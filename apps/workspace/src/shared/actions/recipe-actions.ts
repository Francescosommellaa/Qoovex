"use server";

import { revalidatePath } from "next/cache";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import type { ActionResult, RecipeEditorInput } from "@shared/lib/workspace-types";
import {
  WorkspaceValidationError,
  archiveRecipe,
  createRecipe,
  forkPublicRecipe,
  setRecipePublication,
  updateRecipe,
} from "@shared/server/recipe-service";

function toActionError<T>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof WorkspaceValidationError || error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function createRecipeAction(
  input: RecipeEditorInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const recipe = await createRecipe(user.id, user.plan, input);
    revalidatePath("/recipes");
    revalidatePath("/dashboard");
    return { ok: true, message: "Ricetta creata.", data: recipe };
  } catch (error) {
    return toActionError(error, "Impossibile creare la ricetta.");
  }
}

export async function updateRecipeAction(
  recipeId: string,
  input: RecipeEditorInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const recipe = await updateRecipe(user.id, recipeId, input);
    if (!recipe) return { ok: false, message: "Ricetta non trovata." };

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "Ricetta aggiornata.", data: recipe };
  } catch (error) {
    return toActionError(error, "Impossibile aggiornare la ricetta.");
  }
}

export async function forkRecipeAction(
  recipeId: string,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const recipe = await forkPublicRecipe(user.id, user.plan, recipeId);
    if (!recipe) return { ok: false, message: "Ricetta pubblica non trovata." };

    revalidatePath("/recipes");
    revalidatePath("/explore");
    revalidatePath("/dashboard");
    return { ok: true, message: "Ricetta copiata nel workspace.", data: recipe };
  } catch (error) {
    return toActionError(error, "Impossibile copiare la ricetta.");
  }
}

export async function archiveRecipeAction(
  recipeId: string,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const recipe = await archiveRecipe(user.id, recipeId);
    if (!recipe) return { ok: false, message: "Ricetta non trovata." };

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath("/dashboard");
    revalidatePath("/explore");
    return { ok: true, message: "Ricetta archiviata.", data: recipe };
  } catch (error) {
    return toActionError(error, "Impossibile archiviare la ricetta.");
  }
}

export async function setRecipePublicationAction(
  recipeId: string,
  publish: boolean,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const recipe = await setRecipePublication(user.id, recipeId, publish);
    if (!recipe) return { ok: false, message: "Ricetta non trovata." };

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath("/dashboard");
    revalidatePath("/explore");
    return {
      ok: true,
      message: publish ? "Ricetta pubblicata in Esplora." : "Ricetta ritirata da Esplora.",
      data: recipe,
    };
  } catch (error) {
    return toActionError(error, "Impossibile aggiornare la pubblicazione.");
  }
}
