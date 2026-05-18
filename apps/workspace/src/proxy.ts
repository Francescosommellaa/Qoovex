import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
]);

const authorizedParties = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://app.qoovex.com",
];

export default clerkMiddleware(async (auth, req) => {
  const hasDevAuthSession =
    isDevAuthAllowedForHost(req.headers.get("host") ?? req.nextUrl.host) &&
    req.cookies.get("qv-dev-auth")?.value === "enabled";

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
