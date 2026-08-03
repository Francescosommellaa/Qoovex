export function isPublicApiPath(pathname: string) {
  return (
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/dev-auth" ||
    pathname === "/api/data/jobs/run"
  );
}
