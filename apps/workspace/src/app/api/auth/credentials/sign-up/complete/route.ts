import { NextResponse } from "next/server";
import { AuthCredentialsError, completeCredentialsSignup } from "@shared/server/auth-credentials-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";
import {
  clearVerifiedSignupEmailCookie,
  getVerifiedSignupEmailFromCookie,
  SignupSessionError,
} from "@shared/server/signup-session-service";

export async function POST(request: Request) {
  try {
    const email = await getVerifiedSignupEmailFromCookie();
    if (!email) throw new SignupSessionError("Verifica email scaduta. Richiedi un nuovo codice.");

    const body = await request.json() as { username?: string; password?: string };
    await completeCredentialsSignup({
      email,
      username: body.username ?? "",
      password: body.password ?? "",
      ipHash: getRequestIpHash(request.headers),
    });
    await clearVerifiedSignupEmailCookie();
    return NextResponse.json({ created: true, email });
  } catch (error) {
    const message = error instanceof AuthCredentialsError || error instanceof SignupSessionError
      ? error.message
      : "Registrazione non riuscita.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
