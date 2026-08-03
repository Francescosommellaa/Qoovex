import { devWorkspaceViews, type DevWorkspaceView } from "@qoovex/types";

export const DEV_AUTH_COOKIE_NAME = "qv-dev-auth";

const COOKIE_VERSION = "v2";
const COOKIE_TTL_SECONDS = 60 * 60 * 8;

export interface DevAuthCookieSession {
  expiresAt: number;
  view: DevWorkspaceView;
}

function getDevAuthSecret() {
  return process.env.DEV_AUTH_SECRET?.trim() ?? "";
}

export function isDevAuthSecretConfigured() {
  return getDevAuthSecret().length >= 32;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signPayload(secret: string, payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return base64UrlEncode(new Uint8Array(signature));
}

export function isDevAuthView(value: unknown): value is DevWorkspaceView {
  return typeof value === "string" && devWorkspaceViews.includes(value as DevWorkspaceView);
}

export async function signDevAuthCookieValue(view: DevWorkspaceView = "OWNER") {
  const secret = getDevAuthSecret();
  if (!isDevAuthSecretConfigured()) {
    throw new Error("DEV_AUTH_SECRET is missing or too short");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_TTL_SECONDS;
  const payload = `${COOKIE_VERSION}.${expiresAt}.${view}`;
  const signature = await signPayload(secret, payload);

  return {
    name: DEV_AUTH_COOKIE_NAME,
    value: `${payload}.${signature}`,
    maxAge: COOKIE_TTL_SECONDS,
  };
}

export async function readDevAuthCookieValue(value: string | undefined | null): Promise<DevAuthCookieSession | null> {
  if (!value || !isDevAuthSecretConfigured()) return null;

  const secret = getDevAuthSecret();
  const parts = value.split(".");
  const version = parts[0];
  if (version !== COOKIE_VERSION || parts.length !== 4) return null;

  const expiresAtRaw = parts[1];
  const view = parts[2];
  const signature = parts[3];
  if (!expiresAtRaw || !signature || !isDevAuthView(view)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const payload = `${version}.${expiresAtRaw}.${view}`;
  const expectedSignature = await signPayload(secret, payload);

  return timingSafeEqual(signature, expectedSignature) ? { expiresAt, view } : null;
}

export async function verifyDevAuthCookieValue(value: string | undefined | null) {
  return Boolean(await readDevAuthCookieValue(value));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function clearDevAuthCookieValue() {
  return {
    name: DEV_AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
  };
}
