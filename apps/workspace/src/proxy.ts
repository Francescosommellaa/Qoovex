import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@shared/server/auth/auth.config";
import {
  DEV_AUTH_COOKIE_NAME,
  verifyDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";

const { auth } = NextAuth(authConfig);

const publicRoutes = new Set([
  "/",
  "/sign-in",
  "/sign-up",
  "/sign-up/verify",
  "/sign-up/setup",
  "/sign-in/verify",
  "/complete-profile",
  "/forgot-password",
  "/reset-password",
  "/mfa-challenge",
  "/workspace-unavailable",
  "/api/dev-auth",
]);

function isPublicPath(pathname: string) {
  if (publicRoutes.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? req.nextUrl.host;
  const devAuthCookie = req.cookies.get(DEV_AUTH_COOKIE_NAME)?.value;
  const hasDevAuthSession =
    isDevAuthAllowedForHost(host) &&
    (await verifyDevAuthCookieValue(devAuthCookie));

  if (pathname === "/") {
    const destination = req.nextUrl.clone();
    if (hasDevAuthSession || req.auth) {
      destination.pathname = "/dashboard";
      return NextResponse.redirect(destination);
    }

    destination.pathname = "/sign-up";
    return NextResponse.redirect(destination);
  }

  if (hasDevAuthSession || isPublicPath(pathname)) {
    return;
  }

  if (!req.auth) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
