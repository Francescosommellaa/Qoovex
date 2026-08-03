function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Allinea email e username per i flussi auth credentials:
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

/** Valore mostrato nel campo mentre l'utente digita (senza trim agli estremi). */
export function formatAuthIdentifierInput(value: string): string {
  return applyIdentifierCaseAndSpaces(value);
}

/** Valore normalizzato per sign-in (email o username). */
export function normalizeAuthIdentifier(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return applyIdentifierCaseAndSpaces(trimmed);
}
