import { NextResponse } from "next/server";
import { AuthCredentialsError, verifyCredentialsSignupEmail } from "@shared/server/auth-credentials-service";
import { AuthCodeError } from "@shared/server/auth-code-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";
import { clearVerifiedSignupEmailCookie, setVerifiedSignupEmailCookie } from "@shared/server/signup-session-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; code?: string };
    const result = await verifyCredentialsSignupEmail({
      email: body.email ?? "",
      code: body.code ?? "",
      ipHash: getRequestIpHash(request.headers),
    });
    if (result.next === "complete") {
      await setVerifiedSignupEmailCookie(result.email);
    } else {
      await clearVerifiedSignupEmailCookie();
    }
    return NextResponse.json({ verified: true, next: result.next });
  } catch (error) {
    const message = error instanceof AuthCredentialsError || error instanceof AuthCodeError
      ? error.message
      : "Verifica email non riuscita.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
