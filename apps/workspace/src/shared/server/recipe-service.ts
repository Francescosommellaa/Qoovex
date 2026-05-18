import "server-only";

import { getPlanLimit, assertLimitAvailable } from "@shared/config/plan-rules";
import {
  buildNutritionRanges,
  normalizeAllergens,
  normalizeNutritionRanges,
  slugifyIngredientName,
} from "@shared/lib/ingredient-normalization";
import type {
  IngredientSource,
  IngredientInput,
  IngredientVerificationStatus,
  LimitStatus,
  RecipeCategory,
  RecipeDetailDto,
  RecipeEditorInput,
  RecipeFiltersDto,
  RecipeIngredientDto,
  RecipeSummaryDto,
  RecipeStatus,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import { resolveRecipeImageUrl } from "@shared/server/recipe-image-access";
import {
  archiveRecipeForUser,
  countRecipesForUser,
  createRecipeForUser,
  findRecipeDetailVisibleToUser,
  forkRecipeForUser,
  listPublicRecipes,
  listRecipeOptionsForUser,
  listRecipesForUser,
  setRecipePublicationForUser,
  updateRecipeForUser,
} from "@shared/server/repositories/recipe-repository";

export class WorkspaceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceValidationError";
  }
}

function uniqueAllergens(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "it"));
}

function normalizeNumber(value: number | null | undefined, fallback = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return value;
}

function normalizeOptionalNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return value;
}

function normalizeIngredients(rawIngredients: IngredientInput[]) {
  const seen = new Set<string>();
  const ingredients = rawIngredients
    .map((ingredient) => ({
      ...ingredient,
      name: ingredient.name.trim(),
      unit: ingredient.unit.trim(),
      slug: ingredient.slug?.trim() || slugifyIngredientName(ingredient.name),
      allergens: normalizeAllergens(ingredient.allergens).join(", "),
      quantity: normalizeNumber(ingredient.quantity),
      calories: normalizeOptionalNumber(ingredient.calories),
      proteins: normalizeOptionalNumber(ingredient.proteins),
      carbs: normalizeOptionalNumber(ingredient.carbs),
      fats: normalizeOptionalNumber(ingredient.fats),
      nutrition: normalizeNutritionRanges(
        ingredient.nutrition ??
          buildNutritionRanges({
            calories: ingredient.calories,
            proteins: ingredient.proteins,
            carbs: ingredient.carbs,
            fats: ingredient.fats,
          }),
      ),
      verificationStatus: ingredient.verificationStatus ?? "PENDING_REVIEW",
      source: ingredient.source ?? "USER",
      confidence: normalizeOptionalNumber(ingredient.confidence),
    }))
    .filter((ingredient) => ingredient.name && ingredient.unit && ingredient.quantity > 0);

  for (const ingredient of ingredients) {
    const key = ingredient.name.toLocaleLowerCase("it");
    if (seen.has(key)) {
      throw new WorkspaceValidationError("Ogni ingrediente deve comparire una sola volta.");
    }
    seen.add(key);
  }

  if (ingredients.length === 0) {
    throw new WorkspaceValidationError("Aggiungi almeno un ingrediente.");
  }

  return ingredients;
}

export function normalizeRecipeInput(input: RecipeEditorInput): RecipeEditorInput {
  const title = input.title.trim();
  if (!title) {
    throw new WorkspaceValidationError("Il titolo della ricetta e obbligatorio.");
  }

  return {
    title,
    description: input.description?.trim() || undefined,
    instructions: input.instructions?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    category: input.category ?? "ALTRO",
    servings: Math.max(1, Math.round(normalizeNumber(input.servings, 4))),
    prepTime: normalizeOptionalNumber(input.prepTime),
    cookTime: normalizeOptionalNumber(input.cookTime),
    isPublic: Boolean(input.isPublic),
    ingredients: normalizeIngredients(input.ingredients),
  };
}

interface RecipeSummaryRecord {
  id: string;
  title: string;
  description: string | null;
  category: RecipeCategory;
  status: RecipeStatus;
  servings: number;
  prepTime: number | null;
  cookTime: number | null;
  imageUrl: string | null;
  isPublic: boolean;
  totalCalories: number | null;
  totalCaloriesMin: number | null;
  totalCaloriesMax: number | null;
  totalProteins: number | null;
  totalProteinsMin: number | null;
  totalProteinsMax: number | null;
  totalCarbs: number | null;
  totalCarbsMin: number | null;
  totalCarbsMax: number | null;
  totalSugarsMin: number | null;
  totalSugarsMax: number | null;
  totalFats: number | null;
  totalFatsMin: number | null;
  totalFatsMax: number | null;
  totalFiberMin: number | null;
  totalFiberMax: number | null;
  totalSaltMin: number | null;
  totalSaltMax: number | null;
  likesCount: number;
  forkedFromId: string | null;
  updatedAt: Date;
  deletedAt: Date | null;
  author: { id: string; name: string };
  ingredients: Array<{
    ingredient: {
      allergens: string[];
      verificationStatus?: IngredientVerificationStatus;
    };
  }>;
}

interface RecipeIngredientRecord {
  id: string;
  quantity: number;
  unit: string;
  ingredient: {
    name: string;
    slug: string;
    allergens: string[];
    calories: number | null;
    proteins: number | null;
    carbs: number | null;
    fats: number | null;
    caloriesMin: number | null;
    caloriesMax: number | null;
    proteinsMin: number | null;
    proteinsMax: number | null;
    carbsMin: number | null;
    carbsMax: number | null;
    sugarsMin: number | null;
    sugarsMax: number | null;
    fatsMin: number | null;
    fatsMax: number | null;
    fiberMin: number | null;
    fiberMax: number | null;
    saltMin: number | null;
    saltMax: number | null;
    source: IngredientSource;
    confidence: number | null;
    verificationStatus: IngredientVerificationStatus;
  };
}

interface RecipeDetailRecord extends RecipeSummaryRecord {
  instructions: string | null;
  ingredients: RecipeIngredientRecord[];
}

async function mapRecipeSummary(recipe: RecipeSummaryRecord): Promise<RecipeSummaryDto> {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    status: recipe.status,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    isPublic: recipe.isPublic,
    imageUrl: await resolveRecipeImageUrl(recipe.imageUrl),
    totalCalories: recipe.totalCalories,
    totalProteins: recipe.totalProteins,
    totalCarbs: recipe.totalCarbs,
    totalFats: recipe.totalFats,
    nutrition: normalizeNutritionRanges({
      calories: { min: recipe.totalCaloriesMin, max: recipe.totalCaloriesMax, unit: "kcal" },
      proteins: { min: recipe.totalProteinsMin, max: recipe.totalProteinsMax, unit: "g" },
      carbs: { min: recipe.totalCarbsMin, max: recipe.totalCarbsMax, unit: "g" },
      sugars: { min: recipe.totalSugarsMin, max: recipe.totalSugarsMax, unit: "g" },
      fats: { min: recipe.totalFatsMin, max: recipe.totalFatsMax, unit: "g" },
      fiber: { min: recipe.totalFiberMin, max: recipe.totalFiberMax, unit: "g" },
      salt: { min: recipe.totalSaltMin, max: recipe.totalSaltMax, unit: "g" },
    }),
    likesCount: recipe.likesCount,
    forkedFromId: recipe.forkedFromId,
    ingredientsCount: recipe.ingredients.length,
    allergens: uniqueAllergens(
      recipe.ingredients.flatMap((item) => item.ingredient.allergens),
    ),
    updatedAt: recipe.updatedAt.toISOString(),
    deletedAt: recipe.deletedAt?.toISOString() ?? null,
    authorName: recipe.author.name,
  };
}

function mapRecipeIngredient(
  item: RecipeIngredientRecord,
): RecipeIngredientDto {
  return {
    id: item.id,
    name: item.ingredient.name,
    slug: item.ingredient.slug,
    quantity: item.quantity,
    unit: item.unit,
    allergens: item.ingredient.allergens,
    calories: item.ingredient.calories,
    proteins: item.ingredient.proteins,
    carbs: item.ingredient.carbs,
    fats: item.ingredient.fats,
    nutrition: normalizeNutritionRanges({
      calories: { min: item.ingredient.caloriesMin, max: item.ingredient.caloriesMax, unit: "kcal" },
      proteins: { min: item.ingredient.proteinsMin, max: item.ingredient.proteinsMax, unit: "g" },
      carbs: { min: item.ingredient.carbsMin, max: item.ingredient.carbsMax, unit: "g" },
      sugars: { min: item.ingredient.sugarsMin, max: item.ingredient.sugarsMax, unit: "g" },
      fats: { min: item.ingredient.fatsMin, max: item.ingredient.fatsMax, unit: "g" },
      fiber: { min: item.ingredient.fiberMin, max: item.ingredient.fiberMax, unit: "g" },
      salt: { min: item.ingredient.saltMin, max: item.ingredient.saltMax, unit: "g" },
    }),
    source: item.ingredient.source,
    confidence: item.ingredient.confidence,
    verificationStatus: item.ingredient.verificationStatus,
  };
}

async function mapRecipeDetail(recipe: RecipeDetailRecord, userId: string): Promise<RecipeDetailDto> {
  const summary = await mapRecipeSummary(recipe);
  return {
    ...summary,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map(mapRecipeIngredient),
    canEdit: recipe.author.id === userId,
    canPublish:
      recipe.author.id === userId &&
      recipe.deletedAt === null &&
      !recipe.ingredients.some(
        (item) => item.ingredient.verificationStatus === "PENDING_REVIEW",
      ),
  };
}

export async function getRecipeLimitStatus(userId: string, plan: WorkspacePlan): Promise<LimitStatus> {
  return getPlanLimit(plan, "recipes", await countRecipesForUser(userId));
}

export async function getRecipesIndex(
  userId: string,
  plan: WorkspacePlan,
  filters?: RecipeFiltersDto,
  take = 50,
) {
  const [recipes, limit] = await Promise.all([
    listRecipesForUser(userId, filters, take),
    getRecipeLimitStatus(userId, plan),
  ]);

  return {
    recipes: await Promise.all(recipes.map((recipe) => mapRecipeSummary(recipe))),
    limit,
  };
}

export async function getRecipeOptions(userId: string) {
  const recipes = await listRecipeOptionsForUser(userId);
  return recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    allergens: uniqueAllergens(
      recipe.ingredients.flatMap((item) => item.ingredient.allergens),
    ),
  }));
}

export async function getRecipeDetail(userId: string, recipeId: string) {
  const recipe = await findRecipeDetailVisibleToUser(recipeId, userId);
  return recipe ? await mapRecipeDetail(recipe, userId) : null;
}

export async function createRecipe(userId: string, plan: WorkspacePlan, input: RecipeEditorInput) {
  const limit = await getRecipeLimitStatus(userId, plan);
  assertLimitAvailable(limit, "Hai raggiunto il limite di ricette del piano.");
  return await createRecipeForUser(userId, normalizeRecipeInput(input));
}

export async function updateRecipe(userId: string, recipeId: string, input: RecipeEditorInput) {
  return await updateRecipeForUser(recipeId, userId, normalizeRecipeInput(input));
}

export async function getPublicRecipes(userId: string, query?: string) {
  const recipes = await listPublicRecipes(query);
  return Promise.all(
    recipes.map(async (recipe) => ({
      ...(await mapRecipeSummary(recipe)),
      canEdit: recipe.author.id === userId,
    })),
  );
}

export async function forkPublicRecipe(userId: string, plan: WorkspacePlan, recipeId: string) {
  const limit = await getRecipeLimitStatus(userId, plan);
  assertLimitAvailable(limit, "Hai raggiunto il limite di ricette del piano.");
  return await forkRecipeForUser(recipeId, userId);
}

export async function archiveRecipe(userId: string, recipeId: string) {
  return await archiveRecipeForUser(recipeId, userId);
}

export async function setRecipePublication(userId: string, recipeId: string, publish: boolean) {
  return await setRecipePublicationForUser(recipeId, userId, publish);
}
