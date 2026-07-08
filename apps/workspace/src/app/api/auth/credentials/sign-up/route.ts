import { NextResponse } from "next/server";
import { AuthCredentialsError, registerCredentialsUser } from "@shared/server/auth-credentials-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; username?: string; password?: string };
    await registerCredentialsUser({
      email: body.email ?? "",
      username: body.username ?? "",
      password: body.password ?? "",
      ipHash: getRequestIpHash(request.headers),
    });
    return NextResponse.json({ created: true });
  } catch (error) {
    const message = error instanceof AuthCredentialsError ? error.message : "Registrazione non riuscita.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
