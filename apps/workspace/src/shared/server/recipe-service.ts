import "server-only";

import { getPlanLimit, assertLimitAvailable } from "@shared/config/plan-rules";
import type {
  IngredientInput,
  LimitStatus,
  RecipeDetailDto,
  RecipeEditorInput,
  RecipeIngredientDto,
  RecipeSummaryDto,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import {
  countRecipesForUser,
  createRecipeForUser,
  findRecipeDetailForUser,
  findRecipeDetailVisibleToUser,
  forkRecipeForUser,
  listPublicRecipes,
  listRecipeOptionsForUser,
  listRecipesForUser,
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
      quantity: normalizeNumber(ingredient.quantity),
      calories: normalizeOptionalNumber(ingredient.calories),
      proteins: normalizeOptionalNumber(ingredient.proteins),
      carbs: normalizeOptionalNumber(ingredient.carbs),
      fats: normalizeOptionalNumber(ingredient.fats),
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
    servings: Math.max(1, Math.round(normalizeNumber(input.servings, 4))),
    prepTime: normalizeOptionalNumber(input.prepTime),
    cookTime: normalizeOptionalNumber(input.cookTime),
    isPublic: Boolean(input.isPublic),
    ingredients: normalizeIngredients(input.ingredients),
  };
}

function mapRecipeSummary(recipe: Awaited<ReturnType<typeof listRecipesForUser>>[number]): RecipeSummaryDto {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    isPublic: recipe.isPublic,
    likesCount: recipe.likesCount,
    forkedFromId: recipe.forkedFromId,
    ingredientsCount: recipe.ingredients.length,
    allergens: uniqueAllergens(
      recipe.ingredients.flatMap((item) => item.ingredient.allergens),
    ),
    updatedAt: recipe.updatedAt.toISOString(),
    authorName: recipe.author.name,
  };
}

function mapRecipeIngredient(
  item: NonNullable<
    Awaited<ReturnType<typeof findRecipeDetailForUser>>
  >["ingredients"][number],
): RecipeIngredientDto {
  return {
    id: item.id,
    name: item.ingredient.name,
    quantity: item.quantity,
    unit: item.unit,
    allergens: item.ingredient.allergens,
    calories: item.ingredient.calories,
    proteins: item.ingredient.proteins,
    carbs: item.ingredient.carbs,
    fats: item.ingredient.fats,
  };
}

function mapRecipeDetail(recipe: NonNullable<Awaited<ReturnType<typeof findRecipeDetailForUser>>>, userId: string): RecipeDetailDto {
  const summary = mapRecipeSummary(recipe);
  return {
    ...summary,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map(mapRecipeIngredient),
    canEdit: recipe.author.id === userId,
  };
}

export async function getRecipeLimitStatus(userId: string, plan: WorkspacePlan): Promise<LimitStatus> {
  return getPlanLimit(plan, "recipes", await countRecipesForUser(userId));
}

export async function getRecipesIndex(
  userId: string,
  plan: WorkspacePlan,
  query?: string,
  take = 50,
) {
  const [recipes, limit] = await Promise.all([
    listRecipesForUser(userId, query, take),
    getRecipeLimitStatus(userId, plan),
  ]);

  return {
    recipes: recipes.map(mapRecipeSummary),
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
  return recipe ? mapRecipeDetail(recipe, userId) : null;
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
  return recipes.map((recipe) => ({
    ...mapRecipeSummary(recipe),
    canEdit: recipe.author.id === userId,
  }));
}

export async function forkPublicRecipe(userId: string, plan: WorkspacePlan, recipeId: string) {
  const limit = await getRecipeLimitStatus(userId, plan);
  assertLimitAvailable(limit, "Hai raggiunto il limite di ricette del piano.");
  return await forkRecipeForUser(recipeId, userId);
}
