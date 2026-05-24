"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import { db } from "@qoovex/db";
import { verifyPassword, hashPassword, validatePasswordPolicy } from "@shared/server/auth-password";
import { issueAuthCode, verifyAuthCode } from "@shared/server/auth-code-service";
import { getRequestIpHash, recordSecurityEvent } from "@shared/server/security-audit-service";
import { headers } from "next/headers";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getIpHash() {
  return getRequestIpHash(await headers());
}

async function assertCurrentPassword(userId: string, currentPassword: string) {
  const credential = await db.userCredential.findUnique({
    where: { userId },
    select: { passwordHash: true },
  });
  if (!credential) {
    throw new Error("Questo account non ha ancora una password Qoovex.");
  }
  if (!(await verifyPassword(currentPassword, credential.passwordHash))) {
    throw new Error("Password attuale non valida.");
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? null;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    await assertCurrentPassword(userId, input.currentPassword);
    validatePasswordPolicy(input.newPassword);
    const passwordHash = await hashPassword(input.newPassword);
    await db.$transaction([
      db.userCredential.update({
        where: { userId },
        data: {
          passwordHash,
          passwordUpdatedAt: new Date(),
          passwordResetRequired: false,
        },
      }),
      db.session.deleteMany({ where: { userId } }),
    ]);
    await recordSecurityEvent({
      userId,
      email,
      type: "password_changed",
      ipHash: await getIpHash(),
    });
    return { ok: true, message: "Password aggiornata. Accedi di nuovo." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Password non aggiornata.",
    };
  }
}

export async function requestEmailChangeAction(input: {
  newEmail: string;
  currentPassword: string;
}): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const newEmail = normalizeEmail(input.newEmail);
    if (!newEmail || !newEmail.includes("@")) {
      throw new Error("Inserisci una nuova email valida.");
    }
    await assertCurrentPassword(userId, input.currentPassword);
    await issueAuthCode({
      email: newEmail,
      userId,
      purpose: "EMAIL_CHANGE",
      metadata: { previousEmail: session.user?.email ?? null },
      ipHash: await getIpHash(),
    });
    return { ok: true, message: "Codice inviato alla nuova email." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Codice non inviato.",
    };
  }
}

export async function confirmEmailChangeAction(input: {
  newEmail: string;
  code: string;
}): Promise<ActionResult<{ email: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const email = normalizeEmail(input.newEmail);
    await verifyAuthCode({
      email,
      code: input.code,
      purpose: "EMAIL_CHANGE",
      ipHash: await getIpHash(),
    });
    await db.user.update({
      where: { id: userId },
      data: {
        email,
        emailVerified: new Date(),
      },
    });
    await recordSecurityEvent({
      userId,
      email,
      type: "email_changed",
      ipHash: await getIpHash(),
    });
    return { ok: true, message: "Email aggiornata.", data: { email } };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Email non aggiornata.",
    };
  }
}
