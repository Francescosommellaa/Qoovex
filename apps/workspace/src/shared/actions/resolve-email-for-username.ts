"use server";

import { resolveUserEmailForUsername } from "@shared/server/auth-identity-service";

/**
 * Risolve l’email canonica del profilo Qoovex dallo username normalizzato.
 * Usato solo come fallback di sign-in quando Clerk non accetta lo username come identificatore.
 */
export async function resolveEmailForUsername(username: string): Promise<string | null> {
  return await resolveUserEmailForUsername(username);
}
