import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  DEV_AUTH_COOKIE_NAME,
  verifyDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)",
  "/complete-profile(.*)",
  "/api/dev-auth(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/recipes/media(.*)",
]);

const authorizedParties = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://app.qoovex.com",
];

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") ?? req.nextUrl.host;
  const devAuthCookie = req.cookies.get(DEV_AUTH_COOKIE_NAME)?.value;
  const hasDevAuthSession =
    isDevAuthAllowedForHost(host) &&
    (await verifyDevAuthCookieValue(devAuthCookie));

  if (req.nextUrl.pathname === "/") {
    const destination = req.nextUrl.clone();
    if (hasDevAuthSession) {
      destination.pathname = "/dashboard";
      return NextResponse.redirect(destination);
    }

    const { userId } = await auth();
    destination.pathname = userId ? "/dashboard" : "/sign-up";
    return NextResponse.redirect(destination);
  }

  if (hasDevAuthSession) {
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
}, {
  authorizedParties,
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
