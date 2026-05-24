"use server";

import { auth } from "@shared/server/auth/config";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  UsernameValidationError,
  changeUsernameForUser,
} from "@shared/server/username-service";

export async function changeUsernameAction(
  username: string,
): Promise<ActionResult<{ username: string; usernameChangedAt: string | null }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const result = await changeUsernameForUser({ userId, username });
    return {
      ok: true,
      message: "Username aggiornato.",
      data: {
        username: result.username,
        usernameChangedAt: result.usernameChangedAt?.toISOString() ?? null,
      },
    };
  } catch (error) {
    const message =
      error instanceof UsernameValidationError || error instanceof Error
        ? error.message
        : "Username non aggiornato.";

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
    const message =
      error instanceof UsernameValidationError || error instanceof Error
        ? error.message
        : "Username non aggiornato.";

    return { ok: false, message };
  }
}
