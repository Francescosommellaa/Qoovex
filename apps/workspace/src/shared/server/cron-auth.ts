import "server-only";

import crypto from "node:crypto";

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

/** Generic server-only runner authentication; no product workflow is registered. */
export function isAuthorizedCronRequest(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  return Boolean(configuredSecret && authorization && timingSafeEqual(authorization, `Bearer ${configuredSecret}`));
}
