import "server-only";

import crypto from "crypto";

export function createShareToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashShareToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
