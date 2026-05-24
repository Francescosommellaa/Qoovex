import "server-only";

import crypto from "crypto";

const PASSWORD_VERSION = "1";
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAXMEM = 64 * 1024 * 1024;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "qwerty123",
  "123456789",
  "1234567890",
  "letmein123",
  "admin123456",
  "qoovex123",
]);

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordValidationError";
  }
}

function getPasswordPepper() {
  const secret =
    process.env.QOOVEX_PASSWORD_PEPPER ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DEV_AUTH_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new PasswordValidationError("Segreto password non configurato.");
  }

  return secret;
}

function prehashPassword(password: string) {
  return crypto
    .createHmac("sha256", getPasswordPepper())
    .update(password, "utf8")
    .digest("hex");
}

function scryptAsync(
  password: string,
  salt: string,
  keyLength: number,
  options: crypto.ScryptOptions,
) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export function validatePasswordPolicy(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new PasswordValidationError(
      `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`,
    );
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new PasswordValidationError(
      `La password deve avere al massimo ${MAX_PASSWORD_LENGTH} caratteri.`,
    );
  }

  const normalized = password.trim().toLowerCase();
  if (COMMON_PASSWORDS.has(normalized)) {
    throw new PasswordValidationError("Scegli una password meno comune.");
  }
}

export async function hashPassword(password: string) {
  validatePasswordPolicy(password);
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = (await scryptAsync(prehashPassword(password), salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: MAXMEM,
  })) as Buffer;

  return [
    "scrypt",
    `v=${PASSWORD_VERSION}`,
    `n=${SCRYPT_N}`,
    `r=${SCRYPT_R}`,
    `p=${SCRYPT_P}`,
    salt,
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;

  const parts = storedHash.split("$");
  if (parts.length !== 7 || parts[0] !== "scrypt") return false;

  const n = Number(parts[2]?.replace("n=", ""));
  const r = Number(parts[3]?.replace("r=", ""));
  const p = Number(parts[4]?.replace("p=", ""));
  const salt = parts[5];
  const expected = Buffer.from(parts[6] ?? "", "base64url");

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p) || !salt) {
    return false;
  }

  const actual = (await scryptAsync(prehashPassword(password), salt, expected.length, {
    N: n,
    r,
    p,
    maxmem: MAXMEM,
  })) as Buffer;

  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}
