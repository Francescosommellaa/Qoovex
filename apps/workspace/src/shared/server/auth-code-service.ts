import "server-only";

import crypto from "crypto";
import { db, Prisma, type AuthCodePurpose } from "@qoovex/db";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { recordSecurityEvent } from "@shared/server/security-audit-service";

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;

export class AuthCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthCodeError";
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getCodeSecret() {
  const secret =
    process.env.QOOVEX_AUTH_CODE_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DEV_AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new AuthCodeError("Segreto codici auth non configurato.");
  }

  return secret;
}

function hashCode(input: {
  email: string;
  purpose: AuthCodePurpose;
  code: string;
}) {
  return crypto
    .createHmac("sha256", getCodeSecret())
    .update(`${input.purpose}:${normalizeEmail(input.email)}:${input.code}`)
    .digest("hex");
}

function generateCode() {
  const min = 10 ** (CODE_LENGTH - 1);
  const max = 10 ** CODE_LENGTH;
  return String(crypto.randomInt(min, max));
}

async function sendAuthCodeEmail(input: {
  email: string;
  code: string;
  purpose: AuthCodePurpose;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth-code] ${input.purpose} ${input.email}: ${input.code}`);
      return;
    }

    throw new AuthCodeError("Email auth non configurata.");
  }

  const subject =
    input.purpose === "PASSWORD_RESET"
      ? "Codice reset password Qoovex"
      : input.purpose === "EMAIL_CHANGE"
        ? "Codice cambio email Qoovex"
        : "Codice verifica email Qoovex";

  const text = [
    `Il tuo codice Qoovex e ${input.code}.`,
    "Scade tra 10 minuti e puo essere usato una sola volta.",
    "Se non hai richiesto tu questa operazione, ignora questa email.",
  ].join("\n\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new AuthCodeError("Invio codice non riuscito.");
  }
}

export async function issueAuthCode(input: {
  email: string;
  purpose: AuthCodePurpose;
  userId?: string | null;
  metadata?: Record<string, unknown>;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  await assertPersistentRateLimit({
    identifier: email,
    bucket: `auth-code:${input.purpose}`,
    limit: 4,
    windowMs: 15 * 60 * 1000,
  });

  const code = generateCode();
  const now = new Date();

  await db.$transaction([
    db.authCode.updateMany({
      where: {
        email,
        purpose: input.purpose,
        consumedAt: null,
      },
      data: { consumedAt: now },
    }),
    db.authCode.create({
      data: {
        email,
        userId: input.userId ?? null,
        purpose: input.purpose,
        codeHash: hashCode({ email, purpose: input.purpose, code }),
        maxAttempts: MAX_ATTEMPTS,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    }),
  ]);

  await sendAuthCodeEmail({ email, code, purpose: input.purpose });
  await recordSecurityEvent({
    userId: input.userId,
    email,
    type: `auth_code_issued:${input.purpose}`,
    ipHash: input.ipHash,
  });
}

export async function verifyAuthCode(input: {
  email: string;
  purpose: AuthCodePurpose;
  code: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const code = input.code.replace(/\D/g, "");
  if (code.length !== CODE_LENGTH) {
    throw new AuthCodeError("Codice non valido.");
  }

  await assertPersistentRateLimit({
    identifier: email,
    bucket: `auth-code-verify:${input.purpose}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });

  const candidate = await db.authCode.findFirst({
    where: {
      email,
      purpose: input.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!candidate || candidate.expiresAt <= new Date()) {
    throw new AuthCodeError("Codice scaduto o non valido.");
  }

  if (candidate.attempts >= candidate.maxAttempts) {
    await db.authCode.update({
      where: { id: candidate.id },
      data: { consumedAt: new Date() },
    });
    throw new AuthCodeError("Troppi tentativi. Richiedi un nuovo codice.");
  }

  const expected = candidate.codeHash;
  const actual = hashCode({ email, purpose: input.purpose, code });
  const matches =
    expected.length === actual.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));

  if (!matches) {
    await db.authCode.update({
      where: { id: candidate.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AuthCodeError("Codice non valido.");
  }

  await db.authCode.update({
    where: { id: candidate.id },
    data: {
      consumedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  await recordSecurityEvent({
    userId: candidate.userId,
    email,
    type: `auth_code_verified:${input.purpose}`,
    ipHash: input.ipHash,
  });

  return candidate;
}
