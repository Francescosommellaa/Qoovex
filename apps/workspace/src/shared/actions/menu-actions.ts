"use server";

import { revalidatePath } from "next/cache";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import type { ActionResult, MenuBuilderInput } from "@shared/lib/workspace-types";
import { createMenu, updateMenu } from "@shared/server/menu-service";
import { WorkspaceValidationError } from "@shared/server/recipe-service";

function toActionError<T>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof WorkspaceValidationError || error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function createMenuAction(
  input: MenuBuilderInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const menu = await createMenu(user.id, user.plan, input);
    revalidatePath("/menus");
    revalidatePath("/dashboard");
    return { ok: true, message: "Menu creato.", data: menu };
  } catch (error) {
    return toActionError(error, "Impossibile creare il menu.");
  }
}

export async function updateMenuAction(
  menuId: string,
  input: MenuBuilderInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const menu = await updateMenu(user.id, menuId, input);
    if (!menu) return { ok: false, message: "Menu non trovato." };

    revalidatePath("/menus");
    revalidatePath(`/menus/${menuId}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "Menu aggiornato.", data: menu };
  } catch (error) {
    return toActionError(error, "Impossibile aggiornare il menu.");
  }
}
