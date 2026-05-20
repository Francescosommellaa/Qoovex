"use server";

import { auth } from "@clerk/nextjs/server";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  MfaError,
  confirmTotpSetupForClerkUser,
  disableMfaForClerkUser,
  getMfaStatusByClerkId,
  regenerateBackupCodesForClerkUser,
  startTotpSetupForClerkUser,
  verifyMfaChallengeForClerkUser,
} from "@shared/server/mfa-service";

function getActionError(error: unknown, fallback: string) {
  if (error instanceof MfaError || error instanceof Error) return error.message;
  return fallback;
}

export async function getCurrentMfaStatusAction() {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, message: "Sessione non valida." };

  const status = await getMfaStatusByClerkId(userId);
  return { ok: true as const, status };
}

export async function startTotpSetupAction(): Promise<
  ActionResult<{ otpauthUrl: string; secret: string }>
> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const setup = await startTotpSetupForClerkUser(userId);
    return {
      ok: true,
      message: "Configura il codice nell'app authenticator.",
      data: setup,
    };
  } catch (error) {
    return { ok: false, message: getActionError(error, "A2F non avviata.") };
  }
}

export async function confirmTotpSetupAction(
  code: string,
): Promise<ActionResult<{ backupCodes: string[] }>> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const result = await confirmTotpSetupForClerkUser({ clerkId: userId, code });
    return {
      ok: true,
      message: "A2F attiva. Salva i codici di backup.",
      data: result,
    };
  } catch (error) {
    return { ok: false, message: getActionError(error, "Codice non valido.") };
  }
}

export async function verifyMfaChallengeAction(
  code: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const verified = await verifyMfaChallengeForClerkUser({ clerkId: userId, code });
    return verified
      ? { ok: true, message: "Verifica completata." }
      : { ok: false, message: "Codice non valido." };
  } catch (error) {
    return { ok: false, message: getActionError(error, "Codice non valido.") };
  }
}

export async function disableMfaAction(): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await disableMfaForClerkUser(userId);
    return { ok: true, message: "A2F disattivata." };
  } catch (error) {
    return { ok: false, message: getActionError(error, "A2F non aggiornata.") };
  }
}

export async function regenerateBackupCodesAction(): Promise<
  ActionResult<{ backupCodes: string[] }>
> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const result = await regenerateBackupCodesForClerkUser(userId);
    return {
      ok: true,
      message: "Nuovi codici generati.",
      data: result,
    };
  } catch (error) {
    return { ok: false, message: getActionError(error, "Codici non generati.") };
  }
}
