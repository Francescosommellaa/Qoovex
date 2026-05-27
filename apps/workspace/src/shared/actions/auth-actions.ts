"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  completeCredentialsSignup,
  registerCredentialsUser,
  requestCredentialsSignupEmail,
  requestPasswordReset,
  resetPasswordWithCode,
  verifyCredentialsEmail,
} from "@shared/server/auth-credentials-service";
import { issueAuthCode, verifyAuthCode } from "@shared/server/auth-code-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";
import {
  clearVerifiedSignupEmailCookie,
  getVerifiedSignupEmailFromCookie,
  setVerifiedSignupEmailCookie,
} from "@shared/server/signup-session-service";
import { getSafeAuthActionMessage } from "@shared/actions/auth-action-errors";
import { headers } from "next/headers";

function getErrorMessage(error: unknown, fallback: string) {
  return getSafeAuthActionMessage(error, fallback);
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

export async function requestSignupEmailAction(input: {
  email: string;
}): Promise<ActionResult<{ email: string; existing?: boolean }>> {
  try {
    const result = await requestCredentialsSignupEmail({
      email: input.email,
      ipHash: await getIpHash(),
    });
    return {
      ok: true,
      message: result.existing
        ? "Questa email e gia registrata. Accedi per continuare."
        : "Codice inviato. Controlla la tua email.",
      data: { email: result.email, existing: result.existing },
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Codice non inviato."),
    };
  }
}

export async function verifySignupEmailAction(input: {
  email: string;
  code: string;
}): Promise<ActionResult<{ email: string }>> {
  try {
    const email = input.email.trim().toLowerCase();
    await verifyAuthCode({
      email,
      code: input.code,
      purpose: "EMAIL_VERIFICATION",
      ipHash: await getIpHash(),
    });
    await setVerifiedSignupEmailCookie(email);
    return {
      ok: true,
      message: "Email verificata. Completa username e password.",
      data: { email },
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Codice non valido o scaduto."),
    };
  }
}

export async function completeEmailSignupAction(input: {
  email: string;
  username: string;
  password: string;
}): Promise<ActionResult<{ email: string }>> {
  try {
    const email = input.email.trim().toLowerCase();
    const verifiedEmail = await getVerifiedSignupEmailFromCookie();
    if (!verifiedEmail || verifiedEmail !== email) {
      return {
        ok: false,
        message: "Sessione registrazione scaduta. Verifica di nuovo la email.",
      };
    }

    const result = await completeCredentialsSignup({
      ...input,
      email,
      ipHash: await getIpHash(),
    });
    await clearVerifiedSignupEmailCookie();
    return {
      ok: true,
      message: "Account creato. Accesso in corso.",
      data: { email: result.email },
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Account non creato."),
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
