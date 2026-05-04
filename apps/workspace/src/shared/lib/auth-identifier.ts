function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Allinea email e username a come vengono inviati a Clerk dalla registrazione:
 * - email: minuscolo;
 * - username: minuscolo, senza spazi, con eventuale prefisso "@" rimosso.
 */
function applyIdentifierCaseAndSpaces(value: string): string {
  const lowered = value.toLowerCase();

  if (isLikelyEmail(lowered)) {
    return lowered;
  }

  return lowered.replace(/\s+/g, "").replace(/^@+/, "");
}

/** Valore mostrato nel campo mentre l’utente digita (senza trim agli estremi). */
export function formatAuthIdentifierInput(value: string): string {
  return applyIdentifierCaseAndSpaces(value);
}

/** Valore da passare a `signIn.create({ identifier })` e a link/query string. */
export function normalizeAuthIdentifierForClerk(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return applyIdentifierCaseAndSpaces(trimmed);
}
