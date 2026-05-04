/**
 * Allinea email e username a come vengono inviati a Clerk dalla registrazione:
 * - email: trim + minuscolo (RFC local-part raramente case-sensitive; Clerk accetta match case-insensitive);
 * - username: trim + minuscolo + rimozione spazi (stesso criterio del campo sign-up).
 */
function applyIdentifierCaseAndSpaces(value: string): string {
  if (value.includes("@")) {
    return value.toLowerCase();
  }
  return value.toLowerCase().replace(/\s+/g, "");
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
