type ClerkLikeError = {
  code?: string;
  message?: string;
  errors?: Array<{ code?: string; message?: string }>;
};

function readAuthError(error: unknown): { code: string; message: string } {
  if (typeof error !== "object" || error === null) {
    return { code: "", message: "" };
  }

  const clerkError = error as ClerkLikeError;
  const first = clerkError.errors?.[0];

  return {
    code: String(first?.code ?? clerkError.code ?? "").toLowerCase(),
    message: String(first?.message ?? clerkError.message ?? "").toLowerCase(),
  };
}

export function getSafeAuthErrorMessage(
  error: unknown,
  fallback = "Operazione non riuscita. Riprova tra qualche istante.",
): string {
  const { code, message } = readAuthError(error);
  const fingerprint = `${code} ${message}`;

  if (fingerprint.includes("password")) {
    if (
      fingerprint.includes("pwned") ||
      fingerprint.includes("weak") ||
      fingerprint.includes("too short") ||
      fingerprint.includes("breached")
    ) {
      return "Scegli una password piu sicura e riprova.";
    }

    return "Credenziali non valide oppure account non disponibile.";
  }

  if (
    fingerprint.includes("verification") ||
    fingerprint.includes("code") ||
    fingerprint.includes("expired")
  ) {
    return "Il codice non e valido o e scaduto. Richiedine uno nuovo e riprova.";
  }

  if (fingerprint.includes("username")) {
    return "Scegli uno username valido e non gia in uso.";
  }

  if (
    fingerprint.includes("identifier") ||
    fingerprint.includes("email") ||
    fingerprint.includes("not found")
  ) {
    return "Controlla i dati inseriti e riprova.";
  }

  if (fingerprint.includes("oauth") || fingerprint.includes("sso")) {
    return "Accesso con provider esterno non riuscito. Riprova o usa email e password.";
  }

  return fallback;
}

export function getGenericAuthFailureMessage(): string {
  return "Credenziali non valide oppure account non disponibile.";
}
