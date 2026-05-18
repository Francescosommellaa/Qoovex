import "server-only";

import { db } from "@qoovex/db";
import type { Prisma, RecipeStatus } from "@qoovex/db";
import {
  normalizeAllergens,
  normalizeNutritionRanges,
  slugifyIngredientName,
} from "@shared/lib/ingredient-normalization";
import type { IngredientInput, RecipeEditorInput, RecipeFiltersDto } from "@shared/lib/workspace-types";
import {
  attachPendingIngredientReviewsToRecipe,
  upsertCatalogIngredient,
} from "@shared/server/repositories/ingredient-repository";

const recipeSummarySelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  status: true,
  servings: true,
  prepTime: true,
  cookTime: true,
  imageUrl: true,
  isPublic: true,
  totalCalories: true,
  totalCaloriesMin: true,
  totalCaloriesMax: true,
  totalProteins: true,
  totalProteinsMin: true,
  totalProteinsMax: true,
  totalCarbs: true,
  totalCarbsMin: true,
  totalCarbsMax: true,
  totalSugarsMin: true,
  totalSugarsMax: true,
  totalFats: true,
  totalFatsMin: true,
  totalFatsMax: true,
  totalFiberMin: true,
  totalFiberMax: true,
  totalSaltMin: true,
  totalSaltMax: true,
  likesCount: true,
  forkedFromId: true,
  updatedAt: true,
  deletedAt: true,
  author: { select: { id: true, name: true } },
  ingredients: {
    select: {
      ingredient: {
        select: {
          name: true,
          allergens: true,
          verificationStatus: true,
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
          slug: true,
          allergens: true,
          calories: true,
          caloriesMin: true,
          caloriesMax: true,
          proteins: true,
          proteinsMin: true,
          proteinsMax: true,
          carbs: true,
          carbsMin: true,
          carbsMax: true,
          sugarsMin: true,
          sugarsMax: true,
          fats: true,
          fatsMin: true,
          fatsMax: true,
          fiberMin: true,
          fiberMax: true,
          saltMin: true,
          saltMax: true,
          source: true,
          confidence: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { id: "asc" },
  },
} as const;

function buildRecipeWhere(userId: string, filters?: RecipeFiltersDto): Prisma.RecipeWhereInput {
  const search = filters?.query?.trim();
  const category = filters?.category && filters.category !== "all" ? filters.category : undefined;
  const visibility = filters?.visibility ?? "all";
  const validity = filters?.validity ?? "all";

  return {
    authorId: userId,
    ...(validity === "archived" ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(category ? { category } : {}),
    ...(visibility === "public" ? { isPublic: true } : {}),
    ...(visibility === "private" ? { isPublic: false } : {}),
    ...(validity === "ready" ? { status: { in: ["READY", "PUBLISHED"] as RecipeStatus[] } } : {}),
    ...(validity === "pending" ? { status: "PENDING_REVIEW" as RecipeStatus } : {}),
    ...(typeof filters?.kcalMin === "number" || typeof filters?.kcalMax === "number"
      ? {
          totalCalories: {
            ...(typeof filters.kcalMin === "number" ? { gte: filters.kcalMin } : {}),
            ...(typeof filters.kcalMax === "number" ? { lte: filters.kcalMax } : {}),
          },
        }
      : {}),
    ...(filters?.allergen
      ? {
          ingredients: {
            some: {
              ingredient: {
                allergens: { has: filters.allergen },
              },
            },
          },
        }
      : {}),
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

function nutritionFactor(quantity: number, unit: string) {
  const normalizedUnit = unit.trim().toLocaleLowerCase("it");
  if (normalizedUnit === "kg" || normalizedUnit === "l") return (quantity * 1000) / 100;
  if (normalizedUnit === "g" || normalizedUnit === "ml") return quantity / 100;
  return 0;
}

function addNutritionRange(
  acc: { min: number; max: number; available: boolean },
  range: { min: number | null; max: number | null },
  factor: number,
) {
  if (range.min === null || range.max === null) return acc;
  return {
    min: acc.min + range.min * factor,
    max: acc.max + range.max * factor,
    available: true,
  };
}

function formatNutritionTotal(value: { min: number; max: number; available: boolean }, decimals = 1) {
  if (!value.available) return { min: null, max: null };
  return {
    min: Number(value.min.toFixed(decimals)),
    max: Number(value.max.toFixed(decimals)),
  };
}

function calculateRecipeNutrition(ingredients: IngredientInput[]) {
  const nutrition = ingredients.reduce(
    (acc, ingredient) => {
      const factor = nutritionFactor(ingredient.quantity, ingredient.unit);
      const ranges = normalizeNutritionRanges(ingredient.nutrition);

      return {
        calories: addNutritionRange(acc.calories, ranges.calories, factor),
        proteins: addNutritionRange(acc.proteins, ranges.proteins, factor),
        carbs: addNutritionRange(acc.carbs, ranges.carbs, factor),
        sugars: addNutritionRange(acc.sugars, ranges.sugars, factor),
        fats: addNutritionRange(acc.fats, ranges.fats, factor),
        fiber: addNutritionRange(acc.fiber, ranges.fiber, factor),
        salt: addNutritionRange(acc.salt, ranges.salt, factor),
      };
    },
    {
      calories: { min: 0, max: 0, available: false },
      proteins: { min: 0, max: 0, available: false },
      carbs: { min: 0, max: 0, available: false },
      sugars: { min: 0, max: 0, available: false },
      fats: { min: 0, max: 0, available: false },
      fiber: { min: 0, max: 0, available: false },
      salt: { min: 0, max: 0, available: false },
    },
  );

  const totals = ingredients.reduce(
    (acc, ingredient) => {
      const factor = nutritionFactor(ingredient.quantity, ingredient.unit);
      return {
        calories: acc.calories + (ingredient.calories ?? 0) * factor,
        proteins: acc.proteins + (ingredient.proteins ?? 0) * factor,
        carbs: acc.carbs + (ingredient.carbs ?? 0) * factor,
        fats: acc.fats + (ingredient.fats ?? 0) * factor,
      };
    },
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );

  const calories = formatNutritionTotal(nutrition.calories);
  const proteins = formatNutritionTotal(nutrition.proteins);
  const carbs = formatNutritionTotal(nutrition.carbs);
  const sugars = formatNutritionTotal(nutrition.sugars);
  const fats = formatNutritionTotal(nutrition.fats);
  const fiber = formatNutritionTotal(nutrition.fiber);
  const salt = formatNutritionTotal(nutrition.salt, 2);

  return {
    totalCalories: Number(totals.calories.toFixed(1)),
    totalCaloriesMin: calories.min,
    totalCaloriesMax: calories.max,
    totalProteins: Number(totals.proteins.toFixed(1)),
    totalProteinsMin: proteins.min,
    totalProteinsMax: proteins.max,
    totalCarbs: Number(totals.carbs.toFixed(1)),
    totalCarbsMin: carbs.min,
    totalCarbsMax: carbs.max,
    totalSugarsMin: sugars.min,
    totalSugarsMax: sugars.max,
    totalFats: Number(totals.fats.toFixed(1)),
    totalFatsMin: fats.min,
    totalFatsMax: fats.max,
    totalFiberMin: fiber.min,
    totalFiberMax: fiber.max,
    totalSaltMin: salt.min,
    totalSaltMax: salt.max,
  };
}

function hasPendingIngredients(ingredients: IngredientInput[]) {
  return ingredients.some((ingredient) => ingredient.verificationStatus === "PENDING_REVIEW");
}

function getRecipeStatus(input: RecipeEditorInput) {
  if (hasPendingIngredients(input.ingredients)) return "PENDING_REVIEW" as const;
  return input.isPublic ? ("PUBLISHED" as const) : ("READY" as const);
}

export async function countRecipesForUser(userId: string) {
  return await db.recipe.count({ where: { authorId: userId, deletedAt: null } });
}

function getRecipeOrderBy(sort: RecipeFiltersDto["sort"] = "updated-desc") {
  switch (sort) {
    case "updated-asc":
      return { updatedAt: "asc" as const };
    case "kcal-desc":
      return { totalCalories: "desc" as const };
    case "kcal-asc":
      return { totalCalories: "asc" as const };
    case "title-asc":
      return { title: "asc" as const };
    case "updated-desc":
    default:
      return { updatedAt: "desc" as const };
  }
}

export async function listRecipesForUser(userId: string, filters?: RecipeFiltersDto, take = 50) {
  return await db.recipe.findMany({
    where: buildRecipeWhere(userId, filters),
    orderBy: getRecipeOrderBy(filters?.sort),
    take,
    select: recipeSummarySelect,
  });
}

export async function listRecipeOptionsForUser(userId: string) {
  return await db.recipe.findMany({
    where: { authorId: userId, deletedAt: null },
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
      OR: [{ authorId: userId }, { isPublic: true, deletedAt: null }],
    },
    select: recipeDetailSelect,
  });
}

export async function createRecipeForUser(userId: string, input: RecipeEditorInput) {
  return await db.$transaction(async (tx) => {
    const nutrition = calculateRecipeNutrition(input.ingredients);
    const status = getRecipeStatus(input);
    const recipe = await tx.recipe.create({
      data: {
        title: input.title,
        description: input.description || null,
        instructions: input.instructions || null,
        imageUrl: input.imageUrl || null,
        category: input.category,
        status,
        servings: input.servings,
        prepTime: input.prepTime ?? null,
        cookTime: input.cookTime ?? null,
        isPublic: status === "PUBLISHED",
        ...nutrition,
        authorId: userId,
      },
      select: { id: true },
    });

    for (const item of input.ingredients) {
      const ingredient = await upsertCatalogIngredient({
        ...item,
        slug: item.slug || slugifyIngredientName(item.name),
        allergens: normalizeAllergens(item.allergens).join(", "),
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

    await attachPendingIngredientReviewsToRecipe({
      userId,
      recipeId: recipe.id,
      slugs: input.ingredients
        .filter((ingredient) => ingredient.verificationStatus === "PENDING_REVIEW")
        .map((ingredient) => ingredient.slug || slugifyIngredientName(ingredient.name)),
    });

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

    const nutrition = calculateRecipeNutrition(input.ingredients);
    const status = getRecipeStatus(input);
    await tx.recipe.update({
      where: { id: recipeId },
      data: {
        title: input.title,
        description: input.description || null,
        instructions: input.instructions || null,
        imageUrl: input.imageUrl || null,
        category: input.category,
        status,
        servings: input.servings,
        prepTime: input.prepTime ?? null,
        cookTime: input.cookTime ?? null,
        isPublic: status === "PUBLISHED",
        ...nutrition,
      },
    });

    await tx.recipeIngredient.deleteMany({ where: { recipeId } });

    for (const item of input.ingredients) {
      const ingredient = await upsertCatalogIngredient({
        ...item,
        slug: item.slug || slugifyIngredientName(item.name),
        allergens: normalizeAllergens(item.allergens).join(", "),
      });
      await tx.recipeIngredient.create({
        data: {
          recipeId,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
        },
      });
    }

    await attachPendingIngredientReviewsToRecipe({
      userId,
      recipeId,
      slugs: input.ingredients
        .filter((ingredient) => ingredient.verificationStatus === "PENDING_REVIEW")
        .map((ingredient) => ingredient.slug || slugifyIngredientName(ingredient.name)),
    });

    return { id: recipeId };
  });
}

export async function listPublicRecipes(query?: string, take = 40) {
  const search = query?.trim();

  return await db.recipe.findMany({
    where: {
      isPublic: true,
      status: "PUBLISHED",
      deletedAt: null,
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
        imageUrl: source.imageUrl,
        category: source.category,
        status: "READY",
        servings: source.servings,
        prepTime: source.prepTime,
        cookTime: source.cookTime,
        isPublic: false,
        totalCalories: source.totalCalories,
        totalCaloriesMin: source.totalCaloriesMin,
        totalCaloriesMax: source.totalCaloriesMax,
        totalProteins: source.totalProteins,
        totalProteinsMin: source.totalProteinsMin,
        totalProteinsMax: source.totalProteinsMax,
        totalCarbs: source.totalCarbs,
        totalCarbsMin: source.totalCarbsMin,
        totalCarbsMax: source.totalCarbsMax,
        totalSugarsMin: source.totalSugarsMin,
        totalSugarsMax: source.totalSugarsMax,
        totalFats: source.totalFats,
        totalFatsMin: source.totalFatsMin,
        totalFatsMax: source.totalFatsMax,
        totalFiberMin: source.totalFiberMin,
        totalFiberMax: source.totalFiberMax,
        totalSaltMin: source.totalSaltMin,
        totalSaltMax: source.totalSaltMax,
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
          slug: item.ingredient.slug,
          allergens: item.ingredient.allergens,
          calories: item.ingredient.calories,
          caloriesMin: item.ingredient.caloriesMin,
          caloriesMax: item.ingredient.caloriesMax,
          proteins: item.ingredient.proteins,
          proteinsMin: item.ingredient.proteinsMin,
          proteinsMax: item.ingredient.proteinsMax,
          carbs: item.ingredient.carbs,
          carbsMin: item.ingredient.carbsMin,
          carbsMax: item.ingredient.carbsMax,
          sugarsMin: item.ingredient.sugarsMin,
          sugarsMax: item.ingredient.sugarsMax,
          fats: item.ingredient.fats,
          fatsMin: item.ingredient.fatsMin,
          fatsMax: item.ingredient.fatsMax,
          fiberMin: item.ingredient.fiberMin,
          fiberMax: item.ingredient.fiberMax,
          saltMin: item.ingredient.saltMin,
          saltMax: item.ingredient.saltMax,
          source: item.ingredient.source,
          confidence: item.ingredient.confidence,
          verificationStatus: item.ingredient.verificationStatus,
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

export async function archiveRecipeForUser(recipeId: string, userId: string) {
  const recipe = await db.recipe.findFirst({
    where: { id: recipeId, authorId: userId, deletedAt: null },
    select: { id: true },
  });

  if (!recipe) return null;

  return await db.recipe.update({
    where: { id: recipeId },
    data: {
      deletedAt: new Date(),
      isPublic: false,
      status: "ARCHIVED",
    },
    select: { id: true },
  });
}

export async function setRecipePublicationForUser(recipeId: string, userId: string, publish: boolean) {
  const recipe = await db.recipe.findFirst({
    where: { id: recipeId, authorId: userId, deletedAt: null },
    select: {
      id: true,
      ingredients: {
        select: {
          ingredient: { select: { verificationStatus: true } },
        },
      },
    },
  });

  if (!recipe) return null;

  const hasPending = recipe.ingredients.some(
    (item) => item.ingredient.verificationStatus === "PENDING_REVIEW",
  );

  if (publish && hasPending) {
    throw new Error("La ricetta contiene ingredienti in revisione e non puo essere pubblicata.");
  }

  return await db.recipe.update({
    where: { id: recipeId },
    data: {
      isPublic: publish,
      status: publish ? "PUBLISHED" : "READY",
    },
    select: { id: true },
  });
}
