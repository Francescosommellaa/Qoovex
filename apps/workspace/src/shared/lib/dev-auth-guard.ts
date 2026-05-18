export function isLocalDevHost(host: string | null | undefined) {
  if (!host) return false;

  const normalizedHost = host.toLowerCase();
  const hostname = normalizedHost.startsWith("[")
    ? normalizedHost.slice(1, normalizedHost.indexOf("]"))
    : normalizedHost.split(":")[0];

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/** Dev-auth must never run on Vercel, production builds, or production runtime. */
export function isDevAuthForbiddenEnvironment() {
  if (process.env.VERCEL === "1") return true;
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.NEXT_PHASE === "phase-production-build") return true;

  return false;
}

export function isDevAuthAllowedForHost(host: string | null | undefined) {
  if (isDevAuthForbiddenEnvironment()) return false;
  if (!isLocalDevHost(host)) return false;

  return process.env.NODE_ENV === "development";
}
