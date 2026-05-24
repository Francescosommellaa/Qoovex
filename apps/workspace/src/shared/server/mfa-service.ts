import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@qoovex/db";

const MFA_COOKIE_NAME = "qoovex_mfa";
const TOTP_ISSUER = "Qoovex";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1;
const PENDING_TOTP_TTL_MS = 10 * 60 * 1000;
const MFA_SESSION_TTL_SECONDS = 12 * 60 * 60;
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export class MfaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MfaError";
  }
}

function getRequiredSecret(name: string) {
  const value =
    process.env[name] ??
    (name === "QOOVEX_MFA_COOKIE_SECRET"
      ? process.env.QOOVEX_MFA_ENCRYPTION_KEY ?? process.env.AUTH_SECRET
      : undefined);

  if (!value) {
    throw new MfaError(`${name} non configurata.`);
  }

  return value;
}

function getEncryptionKey() {
  return crypto.createHash("sha256").update(getRequiredSecret("QOOVEX_MFA_ENCRYPTION_KEY")).digest();
}

function getCookieSecret() {
  return getRequiredSecret("QOOVEX_MFA_COOKIE_SECRET");
}

function encodeBase32(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function decodeBase32(value: string) {
  const clean = value.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let current = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) continue;
    current = (current << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((current >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function encryptSecret(secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: Buffer.concat([encrypted, tag]).toString("base64"),
    nonce: iv.toString("base64"),
  };
}

function decryptSecret(encrypted: string, nonce: string) {
  const payload = Buffer.from(encrypted, "base64");
  const iv = Buffer.from(nonce, "base64");
  const tag = payload.subarray(payload.length - 16);
  const ciphertext = payload.subarray(0, payload.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);

  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function hotp(secret: string, counter: number) {
  const key = decodeBase32(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

function verifyTotpCode(secret: string, code: string) {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);

  for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset += 1) {
    if (hotp(secret, counter + offset) === code) return true;
  }

  return false;
}

function normalizeBackupCode(code: string) {
  return code.trim().replace(/[\s-]/g, "").toUpperCase();
}

function hashBackupCode(userId: string, code: string) {
  return crypto
    .createHmac("sha256", getCookieSecret())
    .update(`${userId}:${normalizeBackupCode(code)}`)
    .digest("hex");
}

function generateBackupCodes() {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = Array.from({ length: 10 }, () => {
      const index = crypto.randomInt(0, BACKUP_CODE_ALPHABET.length);
      return BACKUP_CODE_ALPHABET[index];
    }).join("");

    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

function signMfaCookiePayload(payload: string) {
  return crypto.createHmac("sha256", getCookieSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function getOtpAuthUri(input: { secret: string; label: string }) {
  const params = new URLSearchParams({
    secret: input.secret,
    issuer: TOTP_ISSUER,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(`${TOTP_ISSUER}:${input.label}`)}?${params}`;
}

export async function getMfaStatusByUserId(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      mfaEnabled: true,
      totpVerifiedAt: true,
      _count: {
        select: {
          mfaBackupCodes: { where: { usedAt: null } },
        },
      },
    },
  });

  if (!user) return null;

  return {
    enabled: user.mfaEnabled,
    totpVerifiedAt: user.totpVerifiedAt,
    backupCodesRemaining: user._count.mfaBackupCodes,
  };
}

export async function startTotpSetupForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) throw new MfaError("Sessione non valida.");

  const secret = encodeBase32(crypto.randomBytes(20));
  const encrypted = encryptSecret(secret);

  await db.user.update({
    where: { id: user.id },
    data: {
      totpPendingSecretEncrypted: encrypted.encrypted,
      totpPendingSecretNonce: encrypted.nonce,
      totpPendingCreatedAt: new Date(),
    },
  });

  return {
    secret,
    otpauthUrl: getOtpAuthUri({ secret, label: user.email || user.username }),
  };
}

export async function confirmTotpSetupForUser(input: {
  userId: string;
  code: string;
}) {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      totpPendingSecretEncrypted: true,
      totpPendingSecretNonce: true,
      totpPendingCreatedAt: true,
    },
  });

  if (!user?.totpPendingSecretEncrypted || !user.totpPendingSecretNonce) {
    throw new MfaError("Configurazione TOTP non avviata.");
  }

  if (
    !user.totpPendingCreatedAt ||
    user.totpPendingCreatedAt.getTime() + PENDING_TOTP_TTL_MS < Date.now()
  ) {
    throw new MfaError("Configurazione scaduta. Genera un nuovo QR.");
  }

  const secret = decryptSecret(
    user.totpPendingSecretEncrypted,
    user.totpPendingSecretNonce,
  );
  if (!verifyTotpCode(secret, input.code.trim())) {
    throw new MfaError("Codice non valido.");
  }

  const backupCodes = generateBackupCodes();

  await db.$transaction([
    db.mfaBackupCode.deleteMany({ where: { userId: user.id } }),
    db.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        totpSecretEncrypted: user.totpPendingSecretEncrypted,
        totpSecretNonce: user.totpPendingSecretNonce,
        totpPendingSecretEncrypted: null,
        totpPendingSecretNonce: null,
        totpPendingCreatedAt: null,
        totpVerifiedAt: new Date(),
      },
    }),
    db.mfaBackupCode.createMany({
      data: backupCodes.map((code) => ({
        userId: user.id,
        codeHash: hashBackupCode(user.id, code),
      })),
    }),
  ]);

  await setMfaSessionCookie(user.id);
  return { backupCodes };
}

export async function disableMfaForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) throw new MfaError("Sessione non valida.");

  await db.$transaction([
    db.mfaBackupCode.deleteMany({ where: { userId: user.id } }),
    db.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        totpSecretEncrypted: null,
        totpSecretNonce: null,
        totpPendingSecretEncrypted: null,
        totpPendingSecretNonce: null,
        totpPendingCreatedAt: null,
        totpVerifiedAt: null,
      },
    }),
  ]);

  await clearMfaSessionCookie();
}

export async function regenerateBackupCodesForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, mfaEnabled: true },
  });

  if (!user?.mfaEnabled) throw new MfaError("A2F non attiva.");

  const backupCodes = generateBackupCodes();
  await db.$transaction([
    db.mfaBackupCode.deleteMany({ where: { userId: user.id } }),
    db.mfaBackupCode.createMany({
      data: backupCodes.map((code) => ({
        userId: user.id,
        codeHash: hashBackupCode(user.id, code),
      })),
    }),
  ]);

  await setMfaSessionCookie(user.id);

  return { backupCodes };
}

export async function verifyMfaChallengeForUser(input: {
  userId: string;
  code: string;
}) {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      mfaEnabled: true,
      totpSecretEncrypted: true,
      totpSecretNonce: true,
      mfaBackupCodes: {
        where: { usedAt: null },
        select: { id: true, codeHash: true },
      },
    },
  });

  if (!user?.mfaEnabled) return true;
  if (!user.totpSecretEncrypted || !user.totpSecretNonce) {
    throw new MfaError("A2F non configurata correttamente.");
  }

  const code = input.code.trim();
  const secret = decryptSecret(user.totpSecretEncrypted, user.totpSecretNonce);
  const totpValid = verifyTotpCode(secret, code);

  if (totpValid) {
    await setMfaSessionCookie(user.id);
    return true;
  }

  const backupHash = hashBackupCode(user.id, code);
  const backup = user.mfaBackupCodes.find((item) =>
    safeEqual(item.codeHash, backupHash),
  );

  if (!backup) return false;

  await db.mfaBackupCode.update({
    where: { id: backup.id },
    data: { usedAt: new Date() },
  });
  await setMfaSessionCookie(user.id);
  return true;
}

export async function isMfaSatisfiedForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true },
  });

  if (!user?.mfaEnabled) return true;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(MFA_COOKIE_NAME)?.value;
  if (!cookie) return false;

  const [cookieUserId, expiresAtRaw, signature] = cookie.split(".");
  if (!cookieUserId || !expiresAtRaw || !signature || cookieUserId !== userId) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const payload = `${cookieUserId}.${expiresAtRaw}`;
  return safeEqual(signMfaCookiePayload(payload), signature);
}

export async function setMfaSessionCookie(userId: string) {
  const expiresAt = Date.now() + MFA_SESSION_TTL_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  const cookieStore = await cookies();

  cookieStore.set(MFA_COOKIE_NAME, `${payload}.${signMfaCookiePayload(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MFA_SESSION_TTL_SECONDS,
  });
}

export async function clearMfaSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(MFA_COOKIE_NAME);
}
