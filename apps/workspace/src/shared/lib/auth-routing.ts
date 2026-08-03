const DEFAULT_CALLBACK_URL = "/dashboard";

const AUTH_ENTRY_PATHS = ["/sign-in", "/sign-up", "/reset-password"] as const;

export function sanitizeCallbackUrl(value: string | null | undefined) {
  if (!value) return DEFAULT_CALLBACK_URL;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_CALLBACK_URL;
  if (value === "/api" || value.startsWith("/api/")) return DEFAULT_CALLBACK_URL;
  if (AUTH_ENTRY_PATHS.some((path) => value === path || value.startsWith(`${path}?`))) {
    return DEFAULT_CALLBACK_URL;
  }
  return value;
}

export function buildRequestCallbackUrl(pathname: string, search: string) {
  return sanitizeCallbackUrl(`${pathname}${search}`);
}
