export const AUTH_GENERIC_FAILURE_MESSAGE =
  "Credenziali non valide oppure account non disponibile.";

export const AUTH_REQUEST_ACCEPTED_MESSAGE =
  "Se i dati corrispondono a un account, riceverai le istruzioni. Controlla anche lo spam.";

export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value) return "/dashboard";

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/dashboard";
  }

  try {
    const parsed = new URL(trimmed, "https://workspace.qoovex.local");
    if (parsed.origin !== "https://workspace.qoovex.local") {
      return "/dashboard";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/dashboard";
  }
}

export function getAuthRequestAcceptedToast() {
  return {
    title: "Richiesta registrata",
    description: AUTH_REQUEST_ACCEPTED_MESSAGE,
  };
}

export function getGenericAuthFailureToast() {
  return {
    title: "Operazione non riuscita",
    description: AUTH_GENERIC_FAILURE_MESSAGE,
  };
}

export function isLikelyValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
