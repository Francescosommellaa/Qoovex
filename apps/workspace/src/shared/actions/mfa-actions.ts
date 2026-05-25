"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  confirmTotpSetupForUser,
  disableMfaForUser,
  getMfaStatusByUserId,
  regenerateBackupCodesForUser,
  startTotpSetupForUser,
  verifyMfaChallengeForUser,
} from "@shared/server/mfa-service";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { registerAuthDeviceForRequest } from "@shared/server/auth-device-service";
import { findUserCredentialState } from "@shared/server/repositories/user-repository";
import { getRequestIpHash } from "@shared/server/security-audit-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";
import { getSafeAuthActionMessage } from "@shared/actions/auth-action-errors";
import { headers } from "next/headers";

function getActionError(error: unknown, fallback: string) {
  return getSafeAuthActionMessage(error, fallback);
}

async function sendMfaEmailBestEffort(input: Parameters<typeof sendTransactionalEmail>[0]) {
  try {
    await sendTransactionalEmail(input);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] mfa email failed", error);
    }
  }
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
    const credentialState = await findUserCredentialState(userId);
    if (!credentialState?.credential) {
      return {
        ok: false,
        message: "Crea prima una password Qoovex per attivare la A2F.",
      };
    }

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
  const email = session?.user?.email;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-confirm",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    const result = await confirmTotpSetupForUser({ userId, code });
    if (email) {
      await sendMfaEmailBestEffort({
        to: email,
        template: { kind: "security-event", event: "MFA_ENABLED" },
      });
    }
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
  const email = session?.user?.email;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-challenge",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    const verified = await verifyMfaChallengeForUser({ userId, code });
    if (verified && email) {
      const headerStore = await headers();
      try {
        await registerAuthDeviceForRequest({
          userId,
          email,
          headers: headerStore,
          ipHash: getRequestIpHash(headerStore),
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[auth] mfa device registration failed", error);
        }
      }
    }
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
  const email = session?.user?.email;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertPersistentRateLimit({
      identifier: userId,
      bucket: "auth:mfa-disable",
      limit: 4,
      windowMs: 15 * 60 * 1000,
    });
    await disableMfaForUser(userId);
    if (email) {
      await sendMfaEmailBestEffort({
        to: email,
        template: { kind: "security-event", event: "MFA_DISABLED" },
      });
    }
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
