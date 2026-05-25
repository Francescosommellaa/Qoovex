import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

const SIGNUP_COOKIE_NAME = "qv-signup-email";
const SIGNUP_COOKIE_VERSION = "v1";
const SIGNUP_COOKIE_TTL_SECONDS = 30 * 60;

export class SignupSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignupSessionError";
  }
}

function getSignupSecret() {
  const secret =
    process.env.QOOVEX_AUTH_CODE_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DEV_AUTH_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new SignupSessionError("Sessione registrazione non configurata.");
  }

  return secret;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSignupSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function setVerifiedSignupEmailCookie(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const expiresAt = Math.floor(Date.now() / 1000) + SIGNUP_COOKIE_TTL_SECONDS;
  const payload = `${SIGNUP_COOKIE_VERSION}.${encode(normalizedEmail)}.${expiresAt}`;
  const cookieStore = await cookies();

  cookieStore.set(SIGNUP_COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SIGNUP_COOKIE_TTL_SECONDS,
  });
}

export async function getVerifiedSignupEmailFromCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SIGNUP_COOKIE_NAME)?.value;
  if (!value) return null;

  const [version, encodedEmail, expiresAtRaw, signature] = value.split(".");
  if (version !== SIGNUP_COOKIE_VERSION || !encodedEmail || !expiresAtRaw || !signature) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const payload = `${version}.${encodedEmail}.${expiresAtRaw}`;
  if (!safeEqual(sign(payload), signature)) return null;

  return normalizeEmail(decode(encodedEmail));
}

export async function clearVerifiedSignupEmailCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SIGNUP_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
