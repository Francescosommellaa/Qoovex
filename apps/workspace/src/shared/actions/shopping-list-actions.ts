"use server";

import { revalidatePath } from "next/cache";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import type {
  ActionResult,
  ShoppingListInput,
  ShoppingListSourceKind,
} from "@shared/lib/workspace-types";
import {
  createShoppingList,
  createShoppingListFromSource,
  toggleShoppingListItem,
} from "@shared/server/shopping-list-service";
import { WorkspaceValidationError } from "@shared/server/recipe-service";

function toActionError<T>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof WorkspaceValidationError || error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function createShoppingListAction(
  input: ShoppingListInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const list = await createShoppingList(user.id, input);
    revalidatePath("/shopping-list");
    revalidatePath("/dashboard");
    return { ok: true, message: "Lista creata.", data: list };
  } catch (error) {
    return toActionError(error, "Impossibile creare la lista.");
  }
}

export async function createShoppingListFromSourceAction(
  sourceKind: ShoppingListSourceKind,
  sourceId: string,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const list = await createShoppingListFromSource(user.id, sourceKind, sourceId);
    if (!list) return { ok: false, message: "Origine non trovata." };

    revalidatePath("/shopping-list");
    revalidatePath("/dashboard");
    return { ok: true, message: "Lista generata.", data: list };
  } catch (error) {
    return toActionError(error, "Impossibile generare la lista.");
  }
}

export async function toggleShoppingListItemAction(
  itemId: string,
  checked: boolean,
): Promise<ActionResult> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    await toggleShoppingListItem(user.id, itemId, checked);
    revalidatePath("/shopping-list");
    return { ok: true, message: checked ? "Voce completata." : "Voce riaperta." };
  } catch (error) {
    return toActionError(error, "Impossibile aggiornare la voce.");
  }
}
