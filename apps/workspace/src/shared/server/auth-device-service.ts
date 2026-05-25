import "server-only";

import crypto from "crypto";
import { upsertAuthDevice } from "@shared/server/repositories/auth-device-repository";
import { recordSecurityEvent } from "@shared/server/security-audit-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";

function getDeviceSecret() {
  return (
    process.env.QOOVEX_AUDIT_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DEV_AUTH_SECRET ??
    "qoovex-dev-device-secret"
  );
}

function hmac(value: string) {
  return crypto.createHmac("sha256", getDeviceSecret()).update(value).digest("hex");
}

function getBrowserLabel(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  return "browser";
}

function getPlatformLabel(userAgent: string) {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os|macintosh/i.test(userAgent)) return "macOS";
  if (/iphone|ipad|ios/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/linux/i.test(userAgent)) return "Linux";
  return "dispositivo";
}

function getDeviceLabel(userAgent: string) {
  if (!userAgent.trim()) return "un nuovo dispositivo";
  return `${getBrowserLabel(userAgent)} su ${getPlatformLabel(userAgent)}`;
}

export function getRequestDeviceFingerprint(input: {
  headers: Headers;
  ipHash?: string | null;
}) {
  const userAgent = input.headers.get("user-agent") ?? "";
  const acceptLanguage = input.headers.get("accept-language") ?? "";
  const platform = input.headers.get("sec-ch-ua-platform") ?? "";
  const fingerprintHash = hmac(
    [userAgent, acceptLanguage, platform, input.ipHash ?? ""].join("|"),
  );

  return {
    fingerprintHash,
    userAgentHash: userAgent ? hmac(userAgent) : null,
    label: getDeviceLabel(userAgent),
  };
}

export async function registerAuthDeviceForRequest(input: {
  userId: string;
  email: string;
  headers: Headers;
  ipHash?: string | null;
}) {
  if (input.userId.startsWith("dev_") || input.email.endsWith("@qoovex.local")) {
    return { isNew: false };
  }

  const device = getRequestDeviceFingerprint({
    headers: input.headers,
    ipHash: input.ipHash,
  });
  const result = await upsertAuthDevice({
    userId: input.userId,
    fingerprintHash: device.fingerprintHash,
    userAgentHash: device.userAgentHash,
    label: device.label,
  });

  if (!result.isNew) return result;

  await recordSecurityEvent({
    userId: input.userId,
    email: input.email,
    type: "auth_device_new",
    ipHash: input.ipHash,
    metadata: { deviceLabel: device.label },
  });
  try {
    await sendTransactionalEmail({
      to: input.email,
      template: {
        kind: "security-event",
        event: "NEW_DEVICE",
        deviceLabel: device.label,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] new device email failed", error);
    }
  }

  return result;
}
