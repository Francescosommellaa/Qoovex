import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { AuthCodeError, issueAuthCode, verifyAuthCode } from "@shared/server/auth-code-service";
import { auth } from "@shared/server/auth/config";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { recordSecurityEvent } from "@shared/server/security-audit-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";

const MFA_COOKIE_NAME = "qoovex_mfa";
const TOTP_ISSUER = "Qoovex";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1;
const PENDING_TOTP_TTL_MS = 10 * 60 * 1000;
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export interface MfaSessionBinding {
  userId: string;
  authVersion: number;
  authSessionId: string;
}

export class MfaError extends AccessError {
  constructor(message: string, status: 400 | 403 | 409 = 400, code?: string) {
    super(message, status, code);
    this.name = "MfaError";
  }
}

function getRequiredSecret(name: string) {
  const value =
    process.env[name] ??
    (name === "QOOVEX_MFA_COOKIE_SECRET"
      ? process.env.QOOVEX_MFA_ENCRYPTION_KEY ?? process.env.AUTH_SECRET
      : undefined);
  if (!value) throw new MfaError(`${name} non configurata.`);
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
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
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
  return {
    encrypted: Buffer.concat([encrypted, cipher.getAuthTag()]).toString("base64"),
    nonce: iv.toString("base64"),
  };
}

function decryptSecret(encrypted: string, nonce: string) {
  const payload = Buffer.from(encrypted, "base64");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(nonce, "base64"),
  );
  decipher.setAuthTag(payload.subarray(payload.length - 16));
  return Buffer.concat([decipher.update(payload.subarray(0, payload.length - 16)), decipher.final()]).toString("utf8");
}

function hotp(secret: string, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", decodeBase32(secret)).update(counterBuffer).digest();
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
  return crypto.createHmac("sha256", getCookieSecret()).update(`${userId}:${normalizeBackupCode(code)}`).digest("hex");
}

function generateBackupCodes() {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = Array.from({ length: 10 }, () => BACKUP_CODE_ALPHABET[crypto.randomInt(0, BACKUP_CODE_ALPHABET.length)]).join("");
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
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

function signMfaCookiePayload(payload: string) {
  return crypto.createHmac("sha256", getCookieSecret()).update(payload).digest("base64url");
}

async function assertMfaAttemptLimits(userId: string, ipHash?: string | null) {
  await assertPersistentRateLimit({ identifier: userId, bucket: "mfa-factor", limit: 5, windowMs: 15 * 60 * 1000, userId });
  if (ipHash) {
    await assertPersistentRateLimit({ identifier: ipHash, bucket: "mfa-factor-ip", limit: 20, windowMs: 15 * 60 * 1000 });
  }
}

async function assertMfaMutationLimit(userId: string) {
  await assertPersistentRateLimit({ identifier: userId, bucket: "mfa-mutation", limit: 3, windowMs: 60 * 60 * 1000, userId });
}

async function notifySecurityEventBestEffort(input: {
  userId: string;
  email: string;
  event: "MFA_ENABLED" | "MFA_DISABLED" | "MFA_REPLACED" | "MFA_BACKUP_CODES_REGENERATED";
}) {
  try {
    await sendTransactionalEmail({
      to: input.email,
      template: { kind: "security-event", event: input.event },
      idempotencyKey: `security:${input.event}:${input.userId}:${Date.now()}`,
    });
  } catch {
    await recordSecurityEvent({ userId: input.userId, email: input.email, type: `security_email_failed:${input.event}` }).catch(() => undefined);
  }
}

export async function getMfaStatusByUserId(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      mfaEnabled: true,
      totpVerifiedAt: true,
      _count: { select: { mfaBackupCodes: { where: { usedAt: null } } } },
    },
  });
  if (!user) return null;
  return {
    enabled: user.mfaEnabled,
    totpVerifiedAt: user.totpVerifiedAt,
    backupCodesRemaining: user._count.mfaBackupCodes,
  };
}

export async function issueMfaEnrollmentCode(input: { userId: string; ipHash?: string | null }) {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, emailVerified: true, mfaEnabled: true },
  });
  if (!user || !user.emailVerified) throw new MfaError("Email verificata richiesta.", 403);
  if (user.mfaEnabled) throw new MfaError("MFA gia attiva.", 409);
  await issueAuthCode({
    email: user.email,
    userId: user.id,
    purpose: "MFA_ENROLLMENT",
    ipHash: input.ipHash,
  });
  return { sent: true };
}

export async function verifyCurrentFactorForUser(input: {
  userId: string;
  code: string;
  ipHash?: string | null;
  sessionBinding?: MfaSessionBinding;
  purpose?: string;
}) {
  await assertMfaAttemptLimits(input.userId, input.ipHash);
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      mfaEnabled: true,
      totpSecretEncrypted: true,
      totpSecretNonce: true,
      mfaBackupCodes: { where: { usedAt: null }, select: { id: true, codeHash: true } },
    },
  });
  if (!user?.mfaEnabled || !user.totpSecretEncrypted || !user.totpSecretNonce) {
    throw new MfaError("MFA non configurata correttamente.", 403);
  }

  const code = input.code.trim();
  let valid = verifyTotpCode(decryptSecret(user.totpSecretEncrypted, user.totpSecretNonce), code);
  let backupCodeId: string | null = null;
  if (!valid) {
    const backupHash = hashBackupCode(user.id, code);
    backupCodeId = user.mfaBackupCodes.find((item) => safeEqual(item.codeHash, backupHash))?.id ?? null;
    if (backupCodeId) {
      const consumed = await db.mfaBackupCode.updateMany({ where: { id: backupCodeId, usedAt: null }, data: { usedAt: new Date() } });
      valid = consumed.count === 1;
    }
  }

  await recordSecurityEvent({
    userId: user.id,
    email: user.email,
    type: valid ? (backupCodeId ? "mfa_backup_code_used" : "mfa_factor_verified") : "mfa_factor_failed",
    ipHash: input.ipHash,
    metadata: { purpose: input.purpose ?? "challenge" },
  });
  if (valid && input.sessionBinding) await setMfaSessionCookie(input.sessionBinding);
  return valid;
}

export async function startTotpSetupForUser(input: {
  userId: string;
  authorizationType: "email" | "current-factor" | "recovery";
  code?: string;
  recoveryRequestId?: string;
  ipHash?: string | null;
}) {
  await assertMfaMutationLimit(input.userId);
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, username: true, emailVerified: true, mfaEnabled: true },
  });
  if (!user) throw new MfaError("Sessione non valida.", 403);

  if (input.authorizationType === "email") {
    if (user.mfaEnabled || !user.emailVerified) throw new MfaError("Autorizzazione enrollment non valida.", 403);
    try {
      await verifyAuthCode({ email: user.email, purpose: "MFA_ENROLLMENT", code: input.code ?? "", ipHash: input.ipHash });
    } catch (error) {
      if (error instanceof AuthCodeError) throw new MfaError(error.message, 403);
      throw error;
    }
  } else if (input.authorizationType === "current-factor") {
    if (!user.mfaEnabled || !(await verifyCurrentFactorForUser({ userId: user.id, code: input.code ?? "", ipHash: input.ipHash, purpose: "mfa-replacement" }))) {
      throw new MfaError("Fattore corrente non valido.", 403);
    }
  } else {
    if (!user.mfaEnabled || !input.recoveryRequestId) throw new MfaError("Recupero MFA non valido.", 403);
    const recovery = await db.mfaRecoveryRequest.findFirst({
      where: { id: input.recoveryRequestId, userId: user.id, status: "APPROVED", expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (!recovery) throw new MfaError("Recupero MFA scaduto o non approvato.", 403);
  }

  const secret = encodeBase32(crypto.randomBytes(20));
  const encrypted = encryptSecret(secret);
  await db.$transaction(async (tx) => {
    if (input.authorizationType === "recovery") {
      const claimed = await tx.mfaRecoveryRequest.updateMany({
        where: { id: input.recoveryRequestId, userId: user.id, status: "APPROVED", expiresAt: { gt: new Date() } },
        data: { status: "SETUP_STARTED", setupStartedAt: new Date() },
      });
      if (claimed.count !== 1) throw new MfaError("Recupero MFA gia utilizzato.", 409);
    }
    await tx.user.update({
      where: { id: user.id },
      data: {
        totpPendingSecretEncrypted: encrypted.encrypted,
        totpPendingSecretNonce: encrypted.nonce,
        totpPendingCreatedAt: new Date(),
      },
    });
    await tx.securityAuditEvent.create({
      data: { userId: user.id, email: user.email, type: "mfa_setup_started", ipHash: input.ipHash ?? null, metadata: { authorizationType: input.authorizationType } },
    });
  });

  return { secret, otpauthUrl: getOtpAuthUri({ secret, label: user.email || user.username }) };
}

export async function confirmTotpSetupForUser(input: { userId: string; code: string; ipHash?: string | null }) {
  await assertMfaAttemptLimits(input.userId, input.ipHash);
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      mfaEnabled: true,
      totpPendingSecretEncrypted: true,
      totpPendingSecretNonce: true,
      totpPendingCreatedAt: true,
    },
  });
  if (!user?.totpPendingSecretEncrypted || !user.totpPendingSecretNonce) throw new MfaError("Configurazione TOTP non avviata.", 409);
  if (!user.totpPendingCreatedAt || user.totpPendingCreatedAt.getTime() + PENDING_TOTP_TTL_MS < Date.now()) {
    throw new MfaError("Configurazione scaduta. Avvia nuovamente il setup.", 409);
  }
  const secret = decryptSecret(user.totpPendingSecretEncrypted, user.totpPendingSecretNonce);
  if (!verifyTotpCode(secret, input.code.trim())) {
    await recordSecurityEvent({ userId: user.id, email: user.email, type: "mfa_setup_confirmation_failed", ipHash: input.ipHash });
    throw new MfaError("Codice non valido.", 403);
  }

  const backupCodes = generateBackupCodes();
  const now = new Date();
  const event = user.mfaEnabled ? "mfa_replaced" : "mfa_enabled";
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
        totpVerifiedAt: now,
        authVersion: { increment: 1 },
      },
    }),
    db.mfaBackupCode.createMany({ data: backupCodes.map((code) => ({ userId: user.id, codeHash: hashBackupCode(user.id, code) })) }),
    db.mfaRecoveryRequest.updateMany({
      where: { userId: user.id, status: "SETUP_STARTED" },
      data: { status: "COMPLETED", activeKey: null, completedAt: now },
    }),
    db.securityAuditEvent.create({ data: { userId: user.id, email: user.email, type: event, ipHash: input.ipHash ?? null } }),
  ]);
  await clearMfaSessionCookie();
  await notifySecurityEventBestEffort({ userId: user.id, email: user.email, event: user.mfaEnabled ? "MFA_REPLACED" : "MFA_ENABLED" });
  return { backupCodes, reauthenticationRequired: true };
}

export async function disableMfaForUser(input: { userId: string; currentCode: string; ipHash?: string | null }) {
  await assertMfaMutationLimit(input.userId);
  if (!(await verifyCurrentFactorForUser({ userId: input.userId, code: input.currentCode, ipHash: input.ipHash, purpose: "mfa-disable" }))) {
    throw new MfaError("Fattore corrente non valido.", 403);
  }
  const user = await db.user.findUnique({ where: { id: input.userId }, select: { id: true, email: true } });
  if (!user) throw new MfaError("Sessione non valida.", 403);
  const now = new Date();
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
        authVersion: { increment: 1 },
      },
    }),
    db.mfaRecoveryRequest.updateMany({
      where: { userId: user.id, status: { in: ["PENDING", "APPROVED", "SETUP_STARTED"] } },
      data: { status: "EXPIRED", activeKey: null },
    }),
    db.securityAuditEvent.create({ data: { userId: user.id, email: user.email, type: "mfa_disabled", ipHash: input.ipHash ?? null, createdAt: now } }),
  ]);
  await clearMfaSessionCookie();
  await notifySecurityEventBestEffort({ userId: user.id, email: user.email, event: "MFA_DISABLED" });
  return { disabled: true, reauthenticationRequired: true };
}

export async function regenerateBackupCodesForUser(input: { userId: string; currentCode: string; ipHash?: string | null }) {
  await assertMfaMutationLimit(input.userId);
  if (!(await verifyCurrentFactorForUser({ userId: input.userId, code: input.currentCode, ipHash: input.ipHash, purpose: "backup-code-regeneration" }))) {
    throw new MfaError("Fattore corrente non valido.", 403);
  }
  const user = await db.user.findUnique({ where: { id: input.userId }, select: { id: true, email: true, mfaEnabled: true } });
  if (!user?.mfaEnabled) throw new MfaError("MFA non attiva.", 409);
  const backupCodes = generateBackupCodes();
  await db.$transaction([
    db.mfaBackupCode.deleteMany({ where: { userId: user.id } }),
    db.mfaBackupCode.createMany({ data: backupCodes.map((code) => ({ userId: user.id, codeHash: hashBackupCode(user.id, code) })) }),
    db.securityAuditEvent.create({ data: { userId: user.id, email: user.email, type: "mfa_backup_codes_regenerated", ipHash: input.ipHash ?? null } }),
  ]);
  await notifySecurityEventBestEffort({ userId: user.id, email: user.email, event: "MFA_BACKUP_CODES_REGENERATED" });
  return { backupCodes };
}

export async function verifyMfaChallengeForUser(input: MfaSessionBinding & { code: string; ipHash?: string | null }) {
  return verifyCurrentFactorForUser({
    userId: input.userId,
    code: input.code,
    ipHash: input.ipHash,
    purpose: "workspace-session",
    sessionBinding: input,
  });
}

export async function isMfaSatisfiedForUser(input: string | MfaSessionBinding) {
  let binding: MfaSessionBinding | null = typeof input === "string" ? null : input;
  if (typeof input === "string") {
    const session = await auth();
    if (session?.user?.id !== input || !session.user.authSessionId) return false;
    const user = await db.user.findUnique({ where: { id: input }, select: { authVersion: true, mfaEnabled: true } });
    if (!user?.mfaEnabled) return true;
    binding = { userId: input, authVersion: user.authVersion, authSessionId: session.user.authSessionId };
  } else {
    const user = await db.user.findUnique({ where: { id: input.userId }, select: { authVersion: true, mfaEnabled: true } });
    if (!user?.mfaEnabled) return true;
    if (user.authVersion !== input.authVersion) return false;
  }
  if (!binding) return false;

  const value = (await cookies()).get(MFA_COOKIE_NAME)?.value;
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signMfaCookiePayload(payload), signature)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as MfaSessionBinding;
    return parsed.userId === binding.userId && parsed.authVersion === binding.authVersion && parsed.authSessionId === binding.authSessionId;
  } catch {
    return false;
  }
}

export async function setMfaSessionCookie(binding: MfaSessionBinding) {
  const payload = Buffer.from(JSON.stringify(binding), "utf8").toString("base64url");
  (await cookies()).set(MFA_COOKIE_NAME, `${payload}.${signMfaCookiePayload(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearMfaSessionCookie() {
  (await cookies()).delete(MFA_COOKIE_NAME);
}
