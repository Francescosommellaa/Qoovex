const DEFAULT_CALLBACK_URL = "/";

export function sanitizeCallbackUrl(value: string | null | undefined) {
  if (!value) return DEFAULT_CALLBACK_URL;
  if (!value.startsWith("/")) return DEFAULT_CALLBACK_URL;
  if (value.startsWith("//")) return DEFAULT_CALLBACK_URL;
  if (value.startsWith("/api/")) return DEFAULT_CALLBACK_URL;
  if (value.startsWith("/sign-in") || value.startsWith("/sign-up") || value.startsWith("/reset-password")) {
    return DEFAULT_CALLBACK_URL;
  }
  return value;
}

export function isClientInvitationCallbackUrl(value: string) {
  return /^\/client\/invitations\/[^/?#]+$/.test(value);
}
