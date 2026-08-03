import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@shared/server/auth/auth.config";
import {
  DEV_AUTH_COOKIE_NAME,
  verifyDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";
import { isPublicApiPath } from "@shared/lib/public-api-routes";

const { auth } = NextAuth(authConfig);

export const proxy = auth(async (request) => {
  const { pathname } = request.nextUrl;
  if (isPublicApiPath(pathname)) return;

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
  matcher: [
    "/api/account/:path*",
    "/api/audit-log",
    "/api/contexts",
    "/api/client/:path*",
    "/api/data/:path*",
    "/api/exports/:path*",
    "/api/org/:path*",
    "/api/notifications/:path*",
    "/api/organization-profile/:path*",
    "/api/organization/:path*",
    "/api/organizations",
    "/api/platform-admin/:path*",
    "/api/resource-assignments/:path*",
    "/api/support/:path*",
    "/api/workers/:path*",
  ],
};
