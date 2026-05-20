"use server";

import { auth } from "@clerk/nextjs/server";
import type { ActionResult } from "@shared/lib/workspace-types";
import {
  UsernameValidationError,
  changeUsernameForClerkUser,
} from "@shared/server/username-service";

export async function changeUsernameAction(
  username: string,
): Promise<ActionResult<{ username: string; usernameChangedAt: string | null }>> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sessione non valida." };

  try {
    const result = await changeUsernameForClerkUser({ clerkId: userId, username });
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
