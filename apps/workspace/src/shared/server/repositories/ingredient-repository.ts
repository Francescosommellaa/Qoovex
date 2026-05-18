import "server-only";

import { db } from "@qoovex/db";
import {
  buildNutritionRanges,
  normalizeAllergens,
  normalizeNutritionRanges,
  slugifyIngredientName,
} from "@shared/lib/ingredient-normalization";
import type {
  IngredientInput,
  IngredientSource,
  IngredientSuggestionDto,
  IngredientVerificationStatus,
} from "@shared/lib/workspace-types";

const ingredientSelect = {
  id: true,
  name: true,
  slug: true,
  sourceName: true,
  aliases: true,
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
} as const;

function mapIngredient(ingredient: {
  id: string;
  name: string;
  slug: string;
  allergens: string[];
  calories: number | null;
  caloriesMin: number | null;
  caloriesMax: number | null;
  proteins: number | null;
  proteinsMin: number | null;
  proteinsMax: number | null;
  carbs: number | null;
  carbsMin: number | null;
  carbsMax: number | null;
  sugarsMin: number | null;
  sugarsMax: number | null;
  fats: number | null;
  fatsMin: number | null;
  fatsMax: number | null;
  fiberMin: number | null;
  fiberMax: number | null;
  saltMin: number | null;
  saltMax: number | null;
  source: string;
  confidence: number | null;
  verificationStatus: string;
}): IngredientSuggestionDto {
  return {
    id: ingredient.id,
    name: ingredient.name,
    slug: ingredient.slug,
    allergens: ingredient.allergens,
    calories: ingredient.calories,
    proteins: ingredient.proteins,
    carbs: ingredient.carbs,
    fats: ingredient.fats,
    nutrition: normalizeNutritionRanges({
      calories: { min: ingredient.caloriesMin, max: ingredient.caloriesMax, unit: "kcal" },
      proteins: { min: ingredient.proteinsMin, max: ingredient.proteinsMax, unit: "g" },
      carbs: { min: ingredient.carbsMin, max: ingredient.carbsMax, unit: "g" },
      sugars: { min: ingredient.sugarsMin, max: ingredient.sugarsMax, unit: "g" },
      fats: { min: ingredient.fatsMin, max: ingredient.fatsMax, unit: "g" },
      fiber: { min: ingredient.fiberMin, max: ingredient.fiberMax, unit: "g" },
      salt: { min: ingredient.saltMin, max: ingredient.saltMax, unit: "g" },
    }),
    source: ingredient.source as IngredientSource,
    confidence: ingredient.confidence,
    verificationStatus: ingredient.verificationStatus as IngredientVerificationStatus,
  };
}

export async function searchIngredients(query: string, take = 8) {
  const search = query.trim();
  if (search.length < 1) return [];

  const slug = slugifyIngredientName(search);
  const prefixIngredients = await db.ingredient.findMany({
    where: {
      OR: [
        { slug: { startsWith: slug, mode: "insensitive" } },
        { name: { startsWith: search, mode: "insensitive" } },
      ],
      verificationStatus: { not: "REJECTED" },
    },
    orderBy: [{ verificationStatus: "asc" }, { name: "asc" }],
    take,
    select: ingredientSelect,
  });

  if (prefixIngredients.length > 0) {
    return prefixIngredients.map(mapIngredient);
  }

  const fallbackIngredients = await db.ingredient.findMany({
    where: {
      OR: [
        { slug: { contains: slug, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { aliases: { has: search.toLocaleLowerCase("it") } },
      ],
      verificationStatus: { not: "REJECTED" },
    },
    orderBy: [{ verificationStatus: "asc" }, { name: "asc" }],
    take,
    select: ingredientSelect,
  });

  return fallbackIngredients.map(mapIngredient);
}

export async function findIngredientBySlug(slug: string) {
  const ingredient = await db.ingredient.findUnique({
    where: { slug },
    select: ingredientSelect,
  });

  return ingredient ? mapIngredient(ingredient) : null;
}

export async function findIngredientByNameOrSlug(rawName: string) {
  const name = rawName.trim();
  const slug = slugifyIngredientName(name);

  const ingredient = await db.ingredient.findFirst({
    where: {
      OR: [
        { slug },
        { name: { equals: name, mode: "insensitive" } },
        { aliases: { has: name.toLocaleLowerCase("it") } },
      ],
    },
    select: ingredientSelect,
  });

  return ingredient ? mapIngredient(ingredient) : null;
}

export async function upsertCatalogIngredient(input: IngredientInput) {
  const name = input.name.trim();
  const slug = input.slug?.trim() || slugifyIngredientName(name);
  const allergens = normalizeAllergens(input.allergens);
  const nutrition = normalizeNutritionRanges(
    input.nutrition ??
      buildNutritionRanges({
        calories: input.calories,
        proteins: input.proteins,
        carbs: input.carbs,
        fats: input.fats,
      }),
  );
  const verificationStatus =
    input.verificationStatus ??
    (input.calories === null && input.proteins === null && input.carbs === null && input.fats === null
      ? "PENDING_REVIEW"
      : "VERIFIED");

  const ingredient = await db.ingredient.upsert({
    where: { slug },
    create: {
      name,
      slug,
      sourceName: input.sourceName ?? null,
      aliases: Array.from(
        new Set([name.toLocaleLowerCase("it"), input.sourceName?.toLocaleLowerCase("it")].filter(Boolean)),
      ) as string[],
      allergens,
      calories: input.calories ?? null,
      caloriesMin: nutrition.calories.min,
      caloriesMax: nutrition.calories.max,
      proteins: input.proteins ?? null,
      proteinsMin: nutrition.proteins.min,
      proteinsMax: nutrition.proteins.max,
      carbs: input.carbs ?? null,
      carbsMin: nutrition.carbs.min,
      carbsMax: nutrition.carbs.max,
      sugarsMin: nutrition.sugars.min,
      sugarsMax: nutrition.sugars.max,
      fats: input.fats ?? null,
      fatsMin: nutrition.fats.min,
      fatsMax: nutrition.fats.max,
      fiberMin: nutrition.fiber.min,
      fiberMax: nutrition.fiber.max,
      saltMin: nutrition.salt.min,
      saltMax: nutrition.salt.max,
      source: input.source ?? "USER",
      confidence: input.confidence ?? (verificationStatus === "VERIFIED" ? 0.8 : 0.2),
      verificationStatus,
      sourceUpdatedAt: new Date(),
    },
    update: {
      aliases: { push: name.toLocaleLowerCase("it") },
      ...(verificationStatus === "VERIFIED"
        ? {
            sourceName: input.sourceName ?? undefined,
            allergens,
            calories: input.calories ?? null,
            caloriesMin: nutrition.calories.min,
            caloriesMax: nutrition.calories.max,
            proteins: input.proteins ?? null,
            proteinsMin: nutrition.proteins.min,
            proteinsMax: nutrition.proteins.max,
            carbs: input.carbs ?? null,
            carbsMin: nutrition.carbs.min,
            carbsMax: nutrition.carbs.max,
            sugarsMin: nutrition.sugars.min,
            sugarsMax: nutrition.sugars.max,
            fats: input.fats ?? null,
            fatsMin: nutrition.fats.min,
            fatsMax: nutrition.fats.max,
            fiberMin: nutrition.fiber.min,
            fiberMax: nutrition.fiber.max,
            saltMin: nutrition.salt.min,
            saltMax: nutrition.salt.max,
            source: input.source ?? "USER",
            confidence: input.confidence ?? 0.8,
            verificationStatus,
            sourceUpdatedAt: new Date(),
          }
        : {}),
    },
    select: ingredientSelect,
  });

  return mapIngredient(ingredient);
}

export async function createIngredientReview(input: {
  userId: string;
  ingredientId?: string | null;
  recipeId?: string | null;
  rawName: string;
  normalizedSlug: string;
  note?: string | null;
}) {
  return await db.ingredientReview.upsert({
    where: {
      normalizedSlug_userId_status: {
        normalizedSlug: input.normalizedSlug,
        userId: input.userId,
        status: "PENDING_REVIEW",
      },
    },
    create: {
      userId: input.userId,
      ingredientId: input.ingredientId ?? null,
      recipeId: input.recipeId ?? null,
      rawName: input.rawName,
      normalizedSlug: input.normalizedSlug,
      note: input.note ?? null,
    },
    update: {
      ingredientId: input.ingredientId ?? undefined,
      recipeId: input.recipeId ?? undefined,
      note: input.note ?? undefined,
    },
    select: { id: true },
  });
}

export async function attachPendingIngredientReviewsToRecipe(input: {
  userId: string;
  recipeId: string;
  slugs: string[];
}) {
  if (input.slugs.length === 0) return;

  await db.ingredientReview.updateMany({
    where: {
      userId: input.userId,
      status: "PENDING_REVIEW",
      normalizedSlug: { in: input.slugs },
      recipeId: null,
    },
    data: { recipeId: input.recipeId },
  });
}
