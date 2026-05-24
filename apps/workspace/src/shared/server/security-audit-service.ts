import "server-only";

import crypto from "crypto";
import { db, Prisma } from "@qoovex/db";

function getAuditSecret() {
  return (
    process.env.QOOVEX_AUDIT_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DEV_AUTH_SECRET ??
    "qoovex-dev-audit-secret"
  );
}

export function getRequestIpHash(headers?: Headers) {
  const forwarded = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers?.get("x-real-ip")?.trim();
  const ip = forwarded || realIp;
  if (!ip) return undefined;

  return crypto.createHmac("sha256", getAuditSecret()).update(ip).digest("hex");
}

export async function recordSecurityEvent(input: {
  userId?: string | null;
  email?: string | null;
  type: string;
  ipHash?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.securityAuditEvent.create({
    data: {
      userId: input.userId ?? null,
      email: input.email?.trim().toLowerCase() ?? null,
      type: input.type,
      ipHash: input.ipHash ?? null,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
