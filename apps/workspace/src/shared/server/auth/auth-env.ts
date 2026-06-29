/**
 * Variabili Auth.js v5 per Qoovex.
 * In sviluppo, se manca AUTH_SECRET, riusa DEV_AUTH_SECRET (già richiesto per dev-auth).
 */
export function getAuthSecret(): string | undefined {
  const explicit =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (explicit) return explicit;

  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return process.env.DEV_AUTH_SECRET?.trim() || undefined;
}

export function getAuthUrl(): string | undefined {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    undefined
  );
}
