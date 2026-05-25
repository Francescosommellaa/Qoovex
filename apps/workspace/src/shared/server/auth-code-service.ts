import "server-only";

import crypto from "crypto";
import { db, Prisma, type AuthCodePurpose } from "@qoovex/db";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { recordSecurityEvent } from "@shared/server/security-audit-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";

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

  await sendTransactionalEmail({
    to: email,
    template: { kind: "auth-code", purpose: input.purpose, code },
  });
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
