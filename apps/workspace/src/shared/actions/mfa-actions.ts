"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  MfaError,
  confirmTotpSetupForUser,
  disableMfaForUser,
  getMfaStatusByUserId,
  regenerateBackupCodesForUser,
  startTotpSetupForUser,
  verifyMfaChallengeForUser,
} from "@shared/server/mfa-service";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";

function getActionError(error: unknown, fallback: string) {
  if (error instanceof MfaError || error instanceof Error) return error.message;
  return fallback;
}

export async function getCurrentMfaStatusAction() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false as const, message: "Sessione non valida." };

  const status = await getMfaStatusByUserId(userId);
  return { ok: true as const, status };
}

export async function startTotpSetupAction(): Promise<
  ActionResult<{ otpauthUrl: string; secret: string }>
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-setup",
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });
    const setup = await startTotpSetupForUser(userId);
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
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-confirm",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    const result = await confirmTotpSetupForUser({ userId, code });
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
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-challenge",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    const verified = await verifyMfaChallengeForUser({ userId, code });
    return verified
      ? { ok: true, message: "Verifica completata." }
      : { ok: false, message: "Codice non valido." };
  } catch (error) {
    return { ok: false, message: getActionError(error, "Codice non valido.") };
  }
}

export async function disableMfaAction(): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-disable",
      limit: 4,
      windowMs: 15 * 60 * 1000,
    });
    await disableMfaForUser(userId);
    return { ok: true, message: "A2F disattivata." };
  } catch (error) {
    return { ok: false, message: getActionError(error, "A2F non aggiornata.") };
  }
}

export async function regenerateBackupCodesAction(): Promise<
  ActionResult<{ backupCodes: string[] }>
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-backup-regenerate",
      limit: 4,
      windowMs: 15 * 60 * 1000,
    });
    const result = await regenerateBackupCodesForUser(userId);
    return {
      ok: true,
      message: "Nuovi codici generati.",
      data: result,
    };
  } catch (error) {
    return { ok: false, message: getActionError(error, "Codici non generati.") };
  }
}
