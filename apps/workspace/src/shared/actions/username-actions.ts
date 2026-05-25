"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import { changeUsernameForUser } from "@shared/server/username-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";
import { getSafeAuthActionMessage } from "@shared/actions/auth-action-errors";

async function sendUsernameChangeEmail(email: string) {
  try {
    await sendTransactionalEmail({
      to: email,
      template: { kind: "security-event", event: "USERNAME_CHANGED" },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] username email failed", error);
    }
  }
}

export async function changeUsernameAction(
  username: string,
): Promise<ActionResult<{ username: string; usernameChangedAt: string | null }>> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const result = await changeUsernameForUser({ userId, username });
    if (email) {
      await sendUsernameChangeEmail(email);
    }
    return {
      ok: true,
      message: "Username aggiornato.",
      data: {
        username: result.username,
        usernameChangedAt: result.usernameChangedAt?.toISOString() ?? null,
      },
    };
  } catch (error) {
    const message = getSafeAuthActionMessage(error, "Username non aggiornato.");

    return { ok: false, message };
  }
}

export async function completeUsernameOnboardingAction(
  username: string,
): Promise<ActionResult<{ username: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const result = await changeUsernameForUser({
      userId,
      username,
      markOnboarded: true,
    });
    return {
      ok: true,
      message: "Username confermato.",
      data: { username: result.username },
    };
  } catch (error) {
    const message = getSafeAuthActionMessage(error, "Username non aggiornato.");

    return { ok: false, message };
  }
}
