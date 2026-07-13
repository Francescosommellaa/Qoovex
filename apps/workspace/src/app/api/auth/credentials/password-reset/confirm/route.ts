import { NextResponse } from "next/server";
import { AuthCredentialsError, resetPasswordWithCode } from "@shared/server/auth-credentials-service";
import { AuthCodeError } from "@shared/server/auth-code-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; code?: string; password?: string };
    await resetPasswordWithCode({
      email: body.email ?? "",
      code: body.code ?? "",
      password: body.password ?? "",
      ipHash: getRequestIpHash(request.headers),
    });
    return NextResponse.json({ reset: true });
  } catch (error) {
    const message = error instanceof AuthCredentialsError || error instanceof AuthCodeError
      ? error.message
      : "Reset password non riuscito.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
