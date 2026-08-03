import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@shared/server/auth/auth.config";
import {
  DEV_AUTH_COOKIE_NAME,
  verifyDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";
import { isPublicApiPath } from "@shared/lib/public-api-routes";
import { buildRequestCallbackUrl } from "@shared/lib/auth-routing";

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

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { message: "Sessione non valida." },
      { status: 401 },
    );
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    buildRequestCallbackUrl(pathname, request.nextUrl.search),
  );
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/access/:path*",
    "/account/:path*",
    "/audit-log/:path*",
    "/calendar/:path*",
    "/checklists/:path*",
    "/dashboard/:path*",
    "/data-control/:path*",
    "/deadlines/:path*",
    "/document-packages/:path*",
    "/documents/:path*",
    "/evidence/:path*",
    "/job-sites/:path*",
    "/notifications/:path*",
    "/qoovex-admin/:path*",
    "/search/:path*",
    "/settings/:path*",
    "/workers/:path*",
    "/api/account/:path*",
    "/api/audit-log",
    "/api/calendar/:path*",
    "/api/checklists/:path*",
    "/api/context",
    "/api/dashboard",
    "/api/data/:path*",
    "/api/deadlines/:path*",
    "/api/document-packages/:path*",
    "/api/document-requirements/:path*",
    "/api/document-types/:path*",
    "/api/documents/:path*",
    "/api/evidence/:path*",
    "/api/job-sites/:path*",
    "/api/notifications/:path*",
    "/api/organization/:path*",
    "/api/organizations",
    "/api/platform-admin/:path*",
    "/api/reminders/:path*",
    "/api/resource-assignments/:path*",
    "/api/support/:path*",
    "/api/workers/:path*",
  ],
};
