import { NextResponse } from "next/server";
import {
  DEV_AUTH_COOKIE_NAME,
  DEV_AUTH_COOKIE_VALUE,
  isDevAuthAllowed,
} from "@shared/server/dev-auth";

function getSafeDestination(req: Request) {
  const url = new URL(req.url);
  const requestedDestination = url.searchParams.get("redirect_url");

  if (!requestedDestination) {
    return "/dashboard";
  }

  try {
    const destinationUrl = new URL(requestedDestination, url.origin);
    if (destinationUrl.origin !== url.origin) {
      return "/dashboard";
    }

    return `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
  } catch {
    return "/dashboard";
  }
}

export async function POST(req: Request) {
  if (!isDevAuthAllowed()) {
    return NextResponse.json(null, { status: 404 });
  }

  const response = NextResponse.json({
    destination: getSafeDestination(req),
  });

  response.cookies.set({
    name: DEV_AUTH_COOKIE_NAME,
    value: DEV_AUTH_COOKIE_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function DELETE() {
  if (!isDevAuthAllowed()) {
    return NextResponse.json(null, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DEV_AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });

  return response;
}
