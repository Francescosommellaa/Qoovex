import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@shared/server/auth/auth.config";
import {
  DEV_AUTH_COOKIE_NAME,
  verifyDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";

const { auth } = NextAuth(authConfig);

function isPublicApi(pathname: string) {
  return pathname.startsWith("/api/auth/") || pathname === "/api/dev-auth" || pathname === "/api/data/jobs/run";
}

export const proxy = auth(async (request) => {
  const { pathname } = request.nextUrl;
  if (isPublicApi(pathname)) return;

  const host = request.headers.get("host") ?? request.nextUrl.host;
  const devAuthCookie = request.cookies.get(DEV_AUTH_COOKIE_NAME)?.value;
  const hasDevAuthSession =
    isDevAuthAllowedForHost(host) &&
    (await verifyDevAuthCookieValue(devAuthCookie));

  if (hasDevAuthSession || request.auth) return;

  return NextResponse.json(
    { message: "Sessione non valida." },
    { status: 401 },
  );
});

export const config = {
  matcher: ["/api/:path*"],
};
