import { NextResponse } from "next/server";
import { AuthCredentialsError, verifyCredentialsEmail } from "@shared/server/auth-credentials-service";
import { AuthCodeError } from "@shared/server/auth-code-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; code?: string };
    await verifyCredentialsEmail({
      email: body.email ?? "",
      code: body.code ?? "",
      ipHash: getRequestIpHash(request.headers),
    });
    return NextResponse.json({ verified: true });
  } catch (error) {
    const message = error instanceof AuthCredentialsError || error instanceof AuthCodeError
      ? error.message
      : "Verifica email non riuscita.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
