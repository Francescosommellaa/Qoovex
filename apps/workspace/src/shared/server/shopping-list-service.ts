import "server-only";

import { canUsePlanFeature } from "@shared/config/plan-rules";
import type {
  ShoppingListDetailDto,
  ShoppingListInput,
  ShoppingListItemInput,
  ShoppingListSummaryDto,
  ShoppingListSourceKind,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import {
  createShoppingListForUser,
  findMenuIngredientsForShoppingList,
  findRecipeIngredientsForShoppingList,
  findShoppingListDetailForUser,
  listShoppingListsForUser,
  toggleShoppingListItemForUser,
} from "@shared/server/repositories/shopping-list-repository";
import { WorkspaceValidationError } from "@shared/server/recipe-service";

type RawIngredient = {
  quantity: number;
  unit: string;
  ingredient: { name: string };
};

function normalizeShoppingItems(items: ShoppingListItemInput[]) {
  const normalized = items
    .map((item) => ({
      name: item.name.trim(),
      unit: item.unit.trim(),
      quantity: typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? item.quantity
        : 0,
    }))
    .filter((item) => item.name && item.unit && item.quantity > 0);

  if (normalized.length === 0) {
    throw new WorkspaceValidationError("Aggiungi almeno una voce alla lista.");
  }

  return normalized;
}

export function normalizeShoppingListInput(input: ShoppingListInput): ShoppingListInput {
  const title = input.title.trim();
  if (!title) {
    throw new WorkspaceValidationError("Il titolo della lista e obbligatorio.");
  }

  return {
    title,
    items: normalizeShoppingItems(input.items),
  };
}

function mapShoppingListSummary(
  list: Awaited<ReturnType<typeof listShoppingListsForUser>>[number],
): ShoppingListSummaryDto {
  return {
    id: list.id,
    title: list.title,
    itemsCount: list.items.length,
    checkedCount: list.items.filter((item) => item.checked).length,
    updatedAt: list.updatedAt.toISOString(),
  };
}

function mapShoppingListDetail(
  list: NonNullable<Awaited<ReturnType<typeof findShoppingListDetailForUser>>>,
  plan: WorkspacePlan,
): ShoppingListDetailDto {
  return {
    ...mapShoppingListSummary(list),
    items: list.items,
    canExport: canUsePlanFeature(plan, "shopping_list_export"),
  };
}

function aggregateIngredients(title: string, ingredients: RawIngredient[]): ShoppingListInput {
  const groups = new Map<string, ShoppingListItemInput>();

  for (const item of ingredients) {
    const name = item.ingredient.name.trim();
    const unit = item.unit.trim();
    if (!name || !unit) continue;

    const key = `${name.toLocaleLowerCase("it")}::${unit.toLocaleLowerCase("it")}`;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      groups.set(key, { name, unit, quantity: item.quantity });
    }
  }

  return {
    title,
    items: Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name, "it")),
  };
}

export async function getShoppingListsIndex(userId: string) {
  const lists = await listShoppingListsForUser(userId);
  return lists.map(mapShoppingListSummary);
}

export async function getShoppingListDetail(userId: string, plan: WorkspacePlan, listId: string) {
  const list = await findShoppingListDetailForUser(listId, userId);
  return list ? mapShoppingListDetail(list, plan) : null;
}

export async function createShoppingList(userId: string, input: ShoppingListInput) {
  return await createShoppingListForUser(userId, normalizeShoppingListInput(input));
}

export async function createShoppingListFromSource(
  userId: string,
  sourceKind: ShoppingListSourceKind,
  sourceId: string,
) {
  if (sourceKind === "recipe") {
    const recipe = await findRecipeIngredientsForShoppingList(sourceId, userId);
    if (!recipe) return null;
    return await createShoppingList(
      userId,
      aggregateIngredients(`Spesa per ${recipe.title}`, recipe.ingredients),
    );
  }

  const menu = await findMenuIngredientsForShoppingList(sourceId, userId);
  if (!menu) return null;

  return await createShoppingList(
    userId,
    aggregateIngredients(
      `Spesa per ${menu.title}`,
      menu.items.flatMap((item) => item.recipe.ingredients),
    ),
  );
}

export async function toggleShoppingListItem(userId: string, itemId: string, checked: boolean) {
  if (!itemId.trim()) {
    throw new WorkspaceValidationError("Voce lista non valida.");
  }

  await toggleShoppingListItemForUser(userId, itemId, checked);
}
