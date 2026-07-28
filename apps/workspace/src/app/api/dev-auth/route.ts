import { NextResponse } from "next/server";
import {
  clearDevAuthCookieValue,
  isDevAuthView,
  isDevAuthSecretConfigured,
  signDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowed } from "@shared/server/dev-auth";

function devAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function POST(request: Request) {
  if (!(await isDevAuthAllowed())) {
    return NextResponse.json(null, { status: 404 });
  }

  if (!isDevAuthSecretConfigured()) {
    return NextResponse.json(
      { error: "DEV_AUTH_SECRET non configurato (minimo 32 caratteri)." },
      { status: 503 },
    );
  }

  let view: unknown = "OWNER";
  const rawBody = await request.text();
  if (rawBody) {
    try {
      view = (JSON.parse(rawBody) as { view?: unknown }).view ?? "OWNER";
    } catch {
      return NextResponse.json({ error: "Richiesta dev non valida." }, { status: 400 });
    }
  }
  if (!isDevAuthView(view)) {
    return NextResponse.json({ error: "Vista dev non valida." }, { status: 400 });
  }

  let signedCookie;
  try {
    signedCookie = await signDevAuthCookieValue(view);
  } catch {
    return NextResponse.json(
      { error: "DEV_AUTH_SECRET non configurato (minimo 32 caratteri)." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true, view });

  response.cookies.set({
    name: signedCookie.name,
    value: signedCookie.value,
    ...devAuthCookieOptions(signedCookie.maxAge),
  });

  return response;
}

export async function DELETE() {
  if (!(await isDevAuthAllowed())) {
    return NextResponse.json(null, { status: 404 });
  }

  const cleared = clearDevAuthCookieValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: cleared.name,
    value: cleared.value,
    ...devAuthCookieOptions(cleared.maxAge),
  });

  return response;
}
