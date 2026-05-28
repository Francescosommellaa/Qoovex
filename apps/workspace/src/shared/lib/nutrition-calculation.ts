import {
  EMPTY_NUTRITION_RANGES,
  mergeInferredAllergens,
  normalizeAllergens,
  normalizeNutritionRanges,
} from "@shared/lib/ingredient-normalization";
import type {
  IngredientInput,
  NutritionRangeDto,
  NutritionRangesDto,
} from "@shared/lib/workspace-types";

export interface NutritionPreview {
  nutrition: NutritionRangesDto;
  allergens: string[];
  pending: number;
  verified: number;
  unavailable: number;
  warnings: string[];
}

export interface RecipeNutritionTotals {
  totalCalories: number;
  totalCaloriesMin: number | null;
  totalCaloriesMax: number | null;
  totalProteins: number;
  totalProteinsMin: number | null;
  totalProteinsMax: number | null;
  totalCarbs: number;
  totalCarbsMin: number | null;
  totalCarbsMax: number | null;
  totalSugarsMin: number | null;
  totalSugarsMax: number | null;
  totalFats: number;
  totalFatsMin: number | null;
  totalFatsMax: number | null;
  totalFiberMin: number | null;
  totalFiberMax: number | null;
  totalSaltMin: number | null;
  totalSaltMax: number | null;
}

interface AccumulatedRange {
  min: number;
  max: number;
  available: boolean;
}

function emptyAccumulatedRange(): AccumulatedRange {
  return { min: 0, max: 0, available: false };
}

export function getNutritionFactor(quantity: number, unit: string) {
  const normalizedUnit = unit.trim().toLocaleLowerCase("it");
  if (normalizedUnit === "kg" || normalizedUnit === "l") return (quantity * 1000) / 100;
  if (normalizedUnit === "g" || normalizedUnit === "ml") return quantity / 100;
  return 0;
}

function addNutritionRange(
  current: NutritionRangeDto,
  range: NutritionRangeDto,
  factor: number,
): NutritionRangeDto {
  if (range.min === null || range.max === null || factor <= 0) return current;

  return {
    unit: current.unit,
    min: (current.min ?? 0) + range.min * factor,
    max: (current.max ?? 0) + range.max * factor,
  };
}

function addAccumulatedRange(
  current: AccumulatedRange,
  range: NutritionRangeDto,
  factor: number,
): AccumulatedRange {
  if (range.min === null || range.max === null || factor <= 0) return current;

  return {
    min: current.min + range.min * factor,
    max: current.max + range.max * factor,
    available: true,
  };
}

function roundRange(range: NutritionRangeDto): NutritionRangeDto {
  const decimals = range.unit === "kcal" ? 1 : range.max !== null && range.max <= 1 ? 2 : 1;

  return {
    ...range,
    min: range.min === null ? null : Number(range.min.toFixed(decimals)),
    max: range.max === null ? null : Number(range.max.toFixed(decimals)),
  };
}

function roundNutrition(nutrition: NutritionRangesDto): NutritionRangesDto {
  return {
    calories: roundRange(nutrition.calories),
    proteins: roundRange(nutrition.proteins),
    carbs: roundRange(nutrition.carbs),
    sugars: roundRange(nutrition.sugars),
    fats: roundRange(nutrition.fats),
    fiber: roundRange(nutrition.fiber),
    salt: roundRange(nutrition.salt),
  };
}

function formatAccumulatedRange(value: AccumulatedRange, decimals = 1) {
  if (!value.available) return { min: null, max: null };

  return {
    min: Number(value.min.toFixed(decimals)),
    max: Number(value.max.toFixed(decimals)),
  };
}

function hasNutritionData(nutrition: NutritionRangesDto) {
  return Object.values(nutrition).some((range) => range.min !== null && range.max !== null);
}

export function calculateNutritionPreview(ingredients: IngredientInput[]): NutritionPreview {
  const warnings = new Set<string>();

  const preview = ingredients.reduce(
    (acc, ingredient) => {
      const factor = getNutritionFactor(ingredient.quantity, ingredient.unit);
      const nutrition = normalizeNutritionRanges(ingredient.nutrition);
      const ingredientAllergens = mergeInferredAllergens(ingredient.name, ingredient.allergens);
      const hasData = hasNutritionData(nutrition);

      if (factor <= 0 && hasData) {
        warnings.add(`${ingredient.name || "Ingrediente"} non incide sui totali con unita ${ingredient.unit}.`);
      }

      return {
        nutrition: {
          calories: addNutritionRange(acc.nutrition.calories, nutrition.calories, factor),
          proteins: addNutritionRange(acc.nutrition.proteins, nutrition.proteins, factor),
          carbs: addNutritionRange(acc.nutrition.carbs, nutrition.carbs, factor),
          sugars: addNutritionRange(acc.nutrition.sugars, nutrition.sugars, factor),
          fats: addNutritionRange(acc.nutrition.fats, nutrition.fats, factor),
          fiber: addNutritionRange(acc.nutrition.fiber, nutrition.fiber, factor),
          salt: addNutritionRange(acc.nutrition.salt, nutrition.salt, factor),
        },
        allergens: normalizeAllergens([...acc.allergens, ...ingredientAllergens]),
        pending: acc.pending + (ingredient.verificationStatus === "PENDING_REVIEW" ? 1 : 0),
        verified:
          acc.verified +
          (ingredient.verificationStatus === "VERIFIED" || ingredient.verificationStatus === "SUGGESTED"
            ? 1
            : 0),
        unavailable: acc.unavailable + (hasData ? 0 : 1),
        warnings: acc.warnings,
      };
    },
    {
      nutrition: EMPTY_NUTRITION_RANGES,
      allergens: [] as string[],
      pending: 0,
      verified: 0,
      unavailable: 0,
      warnings: [] as string[],
    },
  );

  return {
    ...preview,
    nutrition: roundNutrition(preview.nutrition),
    warnings: Array.from(warnings),
  };
}

export function calculateRecipeNutritionTotals(ingredients: IngredientInput[]): RecipeNutritionTotals {
  const nutrition = ingredients.reduce(
    (acc, ingredient) => {
      const factor = getNutritionFactor(ingredient.quantity, ingredient.unit);
      const ranges = normalizeNutritionRanges(ingredient.nutrition);

      return {
        calories: addAccumulatedRange(acc.calories, ranges.calories, factor),
        proteins: addAccumulatedRange(acc.proteins, ranges.proteins, factor),
        carbs: addAccumulatedRange(acc.carbs, ranges.carbs, factor),
        sugars: addAccumulatedRange(acc.sugars, ranges.sugars, factor),
        fats: addAccumulatedRange(acc.fats, ranges.fats, factor),
        fiber: addAccumulatedRange(acc.fiber, ranges.fiber, factor),
        salt: addAccumulatedRange(acc.salt, ranges.salt, factor),
      };
    },
    {
      calories: emptyAccumulatedRange(),
      proteins: emptyAccumulatedRange(),
      carbs: emptyAccumulatedRange(),
      sugars: emptyAccumulatedRange(),
      fats: emptyAccumulatedRange(),
      fiber: emptyAccumulatedRange(),
      salt: emptyAccumulatedRange(),
    },
  );

  const legacyTotals = ingredients.reduce(
    (acc, ingredient) => {
      const factor = getNutritionFactor(ingredient.quantity, ingredient.unit);

      return {
        calories: acc.calories + (ingredient.calories ?? 0) * factor,
        proteins: acc.proteins + (ingredient.proteins ?? 0) * factor,
        carbs: acc.carbs + (ingredient.carbs ?? 0) * factor,
        fats: acc.fats + (ingredient.fats ?? 0) * factor,
      };
    },
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );

  const calories = formatAccumulatedRange(nutrition.calories);
  const proteins = formatAccumulatedRange(nutrition.proteins);
  const carbs = formatAccumulatedRange(nutrition.carbs);
  const sugars = formatAccumulatedRange(nutrition.sugars);
  const fats = formatAccumulatedRange(nutrition.fats);
  const fiber = formatAccumulatedRange(nutrition.fiber);
  const salt = formatAccumulatedRange(nutrition.salt, 2);

  return {
    totalCalories: Number(legacyTotals.calories.toFixed(1)),
    totalCaloriesMin: calories.min,
    totalCaloriesMax: calories.max,
    totalProteins: Number(legacyTotals.proteins.toFixed(1)),
    totalProteinsMin: proteins.min,
    totalProteinsMax: proteins.max,
    totalCarbs: Number(legacyTotals.carbs.toFixed(1)),
    totalCarbsMin: carbs.min,
    totalCarbsMax: carbs.max,
    totalSugarsMin: sugars.min,
    totalSugarsMax: sugars.max,
    totalFats: Number(legacyTotals.fats.toFixed(1)),
    totalFatsMin: fats.min,
    totalFatsMax: fats.max,
    totalFiberMin: fiber.min,
    totalFiberMax: fiber.max,
    totalSaltMin: salt.min,
    totalSaltMax: salt.max,
  };
}
