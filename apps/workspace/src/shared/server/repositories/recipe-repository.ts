import "server-only";

import { db } from "@qoovex/db";
import type { IngredientInput, RecipeEditorInput } from "@shared/lib/workspace-types";

const recipeSummarySelect = {
  id: true,
  title: true,
  description: true,
  servings: true,
  prepTime: true,
  cookTime: true,
  isPublic: true,
  likesCount: true,
  forkedFromId: true,
  updatedAt: true,
  author: { select: { id: true, name: true } },
  ingredients: {
    select: {
      ingredient: {
        select: {
          name: true,
          allergens: true,
        },
      },
    },
  },
} as const;

const recipeDetailSelect = {
  ...recipeSummarySelect,
  instructions: true,
  ingredients: {
    select: {
      id: true,
      quantity: true,
      unit: true,
      ingredient: {
        select: {
          name: true,
          allergens: true,
          calories: true,
          proteins: true,
          carbs: true,
          fats: true,
        },
      },
    },
    orderBy: { id: "asc" },
  },
} as const;

function buildRecipeWhere(userId: string, query?: string) {
  const search = query?.trim();

  return {
    authorId: userId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

async function upsertIngredient(tx: Parameters<Parameters<typeof db.$transaction>[0]>[0], input: IngredientInput) {
  return await tx.ingredient.upsert({
    where: { name: input.name },
    create: {
      name: input.name,
      allergens: input.allergens
        ? input.allergens.split(",").map((value) => value.trim()).filter(Boolean)
        : [],
      calories: input.calories ?? null,
      proteins: input.proteins ?? null,
      carbs: input.carbs ?? null,
      fats: input.fats ?? null,
    },
    update: {
      allergens: input.allergens
        ? input.allergens.split(",").map((value) => value.trim()).filter(Boolean)
        : [],
      calories: input.calories ?? null,
      proteins: input.proteins ?? null,
      carbs: input.carbs ?? null,
      fats: input.fats ?? null,
    },
    select: { id: true },
  });
}

export async function countRecipesForUser(userId: string) {
  return await db.recipe.count({ where: { authorId: userId } });
}

export async function listRecipesForUser(userId: string, query?: string, take = 50) {
  return await db.recipe.findMany({
    where: buildRecipeWhere(userId, query),
    orderBy: { updatedAt: "desc" },
    take,
    select: recipeSummarySelect,
  });
}

export async function listRecipeOptionsForUser(userId: string) {
  return await db.recipe.findMany({
    where: { authorId: userId },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      ingredients: {
        select: {
          ingredient: { select: { allergens: true } },
        },
      },
    },
  });
}

export async function findRecipeDetailForUser(recipeId: string, userId: string) {
  return await db.recipe.findFirst({
    where: { id: recipeId, authorId: userId },
    select: recipeDetailSelect,
  });
}

export async function findRecipeDetailVisibleToUser(recipeId: string, userId: string) {
  return await db.recipe.findFirst({
    where: {
      id: recipeId,
      OR: [{ authorId: userId }, { isPublic: true }],
    },
    select: recipeDetailSelect,
  });
}

export async function createRecipeForUser(userId: string, input: RecipeEditorInput) {
  return await db.$transaction(async (tx) => {
    const recipe = await tx.recipe.create({
      data: {
        title: input.title,
        description: input.description || null,
        instructions: input.instructions || null,
        servings: input.servings,
        prepTime: input.prepTime ?? null,
        cookTime: input.cookTime ?? null,
        isPublic: input.isPublic,
        authorId: userId,
      },
      select: { id: true },
    });

    for (const item of input.ingredients) {
      const ingredient = await upsertIngredient(tx, item);
      await tx.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
        },
      });
    }

    return recipe;
  });
}

export async function updateRecipeForUser(
  recipeId: string,
  userId: string,
  input: RecipeEditorInput,
) {
  return await db.$transaction(async (tx) => {
    const existing = await tx.recipe.findFirst({
      where: { id: recipeId, authorId: userId },
      select: { id: true },
    });

    if (!existing) return null;

    await tx.recipe.update({
      where: { id: recipeId },
      data: {
        title: input.title,
        description: input.description || null,
        instructions: input.instructions || null,
        servings: input.servings,
        prepTime: input.prepTime ?? null,
        cookTime: input.cookTime ?? null,
        isPublic: input.isPublic,
      },
    });

    await tx.recipeIngredient.deleteMany({ where: { recipeId } });

    for (const item of input.ingredients) {
      const ingredient = await upsertIngredient(tx, item);
      await tx.recipeIngredient.create({
        data: {
          recipeId,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
        },
      });
    }

    return { id: recipeId };
  });
}

export async function listPublicRecipes(query?: string, take = 40) {
  const search = query?.trim();

  return await db.recipe.findMany({
    where: {
      isPublic: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: recipeSummarySelect,
  });
}

export async function forkRecipeForUser(sourceRecipeId: string, userId: string) {
  return await db.$transaction(async (tx) => {
    const source = await tx.recipe.findFirst({
      where: {
        id: sourceRecipeId,
        isPublic: true,
      },
      select: recipeDetailSelect,
    });

    if (!source) return null;

    const recipe = await tx.recipe.create({
      data: {
        title: `${source.title} (copia)`,
        description: source.description,
        instructions: source.instructions,
        servings: source.servings,
        prepTime: source.prepTime,
        cookTime: source.cookTime,
        isPublic: false,
        authorId: userId,
        forkedFromId: source.id,
      },
      select: { id: true },
    });

    for (const item of source.ingredients) {
      const ingredient = await tx.ingredient.upsert({
        where: { name: item.ingredient.name },
        create: {
          name: item.ingredient.name,
          allergens: item.ingredient.allergens,
          calories: item.ingredient.calories,
          proteins: item.ingredient.proteins,
          carbs: item.ingredient.carbs,
          fats: item.ingredient.fats,
        },
        update: {},
        select: { id: true },
      });

      await tx.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
        },
      });
    }

    return recipe;
  });
}
