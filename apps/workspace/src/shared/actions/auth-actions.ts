"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  AuthCredentialsError,
  registerCredentialsUser,
  requestPasswordReset,
  resetPasswordWithCode,
  verifyCredentialsEmail,
} from "@shared/server/auth-credentials-service";
import { issueAuthCode } from "@shared/server/auth-code-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";
import { headers } from "next/headers";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AuthCredentialsError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}

async function getIpHash() {
  return getRequestIpHash(await headers());
}

export async function registerCredentialsAction(input: {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<ActionResult<{ email: string }>> {
  try {
    const result = await registerCredentialsUser({
      ...input,
      ipHash: await getIpHash(),
    });
    return {
      ok: true,
      message: "Account creato. Inserisci il codice inviato via email.",
      data: { email: result.email },
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Registrazione non completata."),
    };
  }
}

export async function verifyEmailCodeAction(input: {
  email: string;
  code: string;
}): Promise<ActionResult> {
  try {
    await verifyCredentialsEmail({ ...input, ipHash: await getIpHash() });
    return { ok: true, message: "Email verificata. Ora puoi accedere." };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Codice non valido o scaduto."),
    };
  }
}

export async function resendVerificationCodeAction(input: {
  email: string;
}): Promise<ActionResult> {
  try {
    await issueAuthCode({
      email: input.email,
      purpose: "EMAIL_VERIFICATION",
      ipHash: await getIpHash(),
    });
    return { ok: true, message: "Codice inviato." };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Codice non inviato."),
    };
  }
}

export async function requestPasswordResetAction(input: {
  email: string;
}): Promise<ActionResult> {
  try {
    await requestPasswordReset({ email: input.email, ipHash: await getIpHash() });
    return {
      ok: true,
      message:
        "Se l'account esiste, riceverai un codice per impostare una nuova password.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Richiesta non completata."),
    };
  }
}

export async function resetPasswordWithCodeAction(input: {
  email: string;
  code: string;
  password: string;
}): Promise<ActionResult> {
  try {
    await resetPasswordWithCode({ ...input, ipHash: await getIpHash() });
    return { ok: true, message: "Password aggiornata. Accedi di nuovo." };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Password non aggiornata."),
    };
  }
}

export async function getAuthenticatedUserIdAction() {
  const session = await auth();
  return session?.user?.id ?? null;
}
