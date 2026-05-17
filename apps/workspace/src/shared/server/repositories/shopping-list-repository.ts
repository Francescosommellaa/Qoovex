import "server-only";

import { db } from "@qoovex/db";
import type { ShoppingListInput } from "@shared/lib/workspace-types";

const shoppingListSummarySelect = {
  id: true,
  title: true,
  updatedAt: true,
  items: {
    select: {
      checked: true,
    },
  },
} as const;

const shoppingListDetailSelect = {
  ...shoppingListSummarySelect,
  items: {
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      quantity: true,
      unit: true,
      checked: true,
    },
  },
} as const;

export async function countShoppingListsForUser(userId: string) {
  return await db.shoppingList.count({ where: { userId } });
}

export async function listShoppingListsForUser(userId: string, take = 50) {
  return await db.shoppingList.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take,
    select: shoppingListSummarySelect,
  });
}

export async function findShoppingListDetailForUser(listId: string, userId: string) {
  return await db.shoppingList.findFirst({
    where: { id: listId, userId },
    select: shoppingListDetailSelect,
  });
}

export async function createShoppingListForUser(userId: string, input: ShoppingListInput) {
  return await db.shoppingList.create({
    data: {
      title: input.title,
      userId,
      items: {
        create: input.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })),
      },
    },
    select: { id: true },
  });
}

export async function toggleShoppingListItemForUser(
  userId: string,
  itemId: string,
  checked: boolean,
) {
  await db.shoppingListItem.updateMany({
    where: {
      id: itemId,
      shoppingList: { userId },
    },
    data: { checked },
  });
}

export async function findRecipeIngredientsForShoppingList(recipeId: string, userId: string) {
  return await db.recipe.findFirst({
    where: { id: recipeId, authorId: userId },
    select: {
      title: true,
      ingredients: {
        select: {
          quantity: true,
          unit: true,
          ingredient: { select: { name: true } },
        },
      },
    },
  });
}

export async function findMenuIngredientsForShoppingList(menuId: string, userId: string) {
  return await db.menu.findFirst({
    where: { id: menuId, authorId: userId },
    select: {
      title: true,
      items: {
        select: {
          recipe: {
            select: {
              ingredients: {
                select: {
                  quantity: true,
                  unit: true,
                  ingredient: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
}
