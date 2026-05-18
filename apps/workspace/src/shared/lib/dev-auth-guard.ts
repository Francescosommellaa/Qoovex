export function isLocalDevHost(host: string | null | undefined) {
  if (!host) return false;

  const normalizedHost = host.toLowerCase();
  const hostname = normalizedHost.startsWith("[")
    ? normalizedHost.slice(1, normalizedHost.indexOf("]"))
    : normalizedHost.split(":")[0];

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function isDevAuthAllowedForHost(host: string | null | undefined) {
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.VERCEL_ENV === "production") return false;

  return isLocalDevHost(host);
}
