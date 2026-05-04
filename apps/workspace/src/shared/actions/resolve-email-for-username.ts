"use server";

import { db } from "@qoovex/db";
import { normalizeAuthIdentifierForClerk } from "@shared/lib/auth-identifier";

/**
 * Risolve l’email canonica del profilo Qoovex dallo username normalizzato.
 * Usato solo come fallback di sign-in quando Clerk non accetta lo username come identificatore.
 */
export async function resolveEmailForUsername(username: string): Promise<string | null> {
  const normalized = normalizeAuthIdentifierForClerk(username);
  if (!normalized || normalized.includes("@")) return null;

  const user = await db.user.findUnique({
    where: { username: normalized },
    select: { email: true },
  });

  return user?.email ?? null;
}
