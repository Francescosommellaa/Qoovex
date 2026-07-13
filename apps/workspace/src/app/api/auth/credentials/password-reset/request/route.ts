import { NextResponse } from "next/server";
import { AuthCredentialsError, requestPasswordReset } from "@shared/server/auth-credentials-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string };
    await requestPasswordReset({
      email: body.email ?? "",
      ipHash: getRequestIpHash(request.headers),
    });
    return NextResponse.json({ requested: true });
  } catch (error) {
    const message = error instanceof AuthCredentialsError ? error.message : "Richiesta reset non riuscita.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
