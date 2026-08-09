import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@qoovex/db";
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

  if (hasDevAuthSession || request.auth) {
    if (pathname === "/account/role" || pathname === "/api/account/role") return;
    const userId = request.auth?.user?.id;
    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { accountRole: true } });
      if (!user?.accountRole) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: { code: "ACCOUNT_ROLE_REQUIRED", message: "Scegli il tipo di account prima di continuare." } }, { status: 403 });
        }
        const roleUrl = new URL("/account/role", request.url);
        roleUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(roleUrl);
      }
    }
    return;
  }

  if (!pathname.startsWith("/api/")) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.json(
    { message: "Sessione non valida." },
    { status: 401 },
  );
});

export const config = {
  matcher: [
    "/api/account/:path*",
    "/api/audit-log",
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
    "/account/:path*",
    "/audit-log",
    "/client/:path*",
    "/data-control",
    "/notifications/:path*",
    "/org/:path*",
    "/people/:path*",
    "/qoovex-admin/:path*",
    "/settings/:path*",
    "/workers/:path*",
  ],
};
