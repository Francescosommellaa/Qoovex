import "server-only";

import { normalizeAuthIdentifierForClerk } from "@shared/lib/auth-identifier";
import { findUserEmailByUsername } from "@shared/server/repositories/user-repository";

export async function resolveUserEmailForUsername(
  username: string,
): Promise<string | null> {
  const normalized = normalizeAuthIdentifierForClerk(username);
  if (!normalized || normalized.includes("@")) return null;

  const user = await findUserEmailByUsername(normalized);
  return user?.email ?? null;
}
