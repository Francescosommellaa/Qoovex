import type { NutritionRangeDto, NutritionRangesDto, RecipeCategory } from "@shared/lib/workspace-types";

export const RECIPE_CATEGORY_OPTIONS: Array<{ value: RecipeCategory; label: string }> = [
  { value: "ANTIPASTO", label: "Antipasto" },
  { value: "PRIMO", label: "Primo piatto" },
  { value: "SECONDO", label: "Secondo" },
  { value: "CONTORNO", label: "Contorno" },
  { value: "DOLCE", label: "Dolce" },
  { value: "PANE_LIEVITATI", label: "Pane e lievitati" },
  { value: "SALSA_BASE", label: "Salsa o base" },
  { value: "BEVANDA", label: "Bevanda" },
  { value: "ALTRO", label: "Altro" },
];

export const INGREDIENT_UNIT_OPTIONS = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "pz", label: "pz" },
  { value: "cucchiaio", label: "cucchiaio" },
  { value: "cucchiaino", label: "cucchiaino" },
  { value: "q.b.", label: "q.b." },
];

export function getRecipeCategoryLabel(category: RecipeCategory) {
  return RECIPE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "Altro";
}

export function normalizeIngredientName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function slugifyIngredientName(value: string) {
  const normalized = normalizeIngredientName(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "ingrediente";
}

export function normalizeAllergens(values: string[] | string | null | undefined) {
  const allergens = Array.isArray(values) ? values : values?.split(",") ?? [];
  return Array.from(
    new Set(
      allergens
        .map((value) => value.trim().toLocaleLowerCase("it"))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "it"));
}

const GLUTEN_FREE_FLOUR_PATTERNS = [
  /\bfarina\s+(?:di\s+)?(?:riso|mais|granturco|ceci|piselli|lenticchie|fagioli|soia|mandorle|nocciole|cocco|castagne|quinoa|amaranto|miglio|sorgo|teff)\b/,
  /\bgrano\s+saraceno\b/,
  /\bmaizena\b/,
  /\bamido\s+di\s+mais\b/,
  /\bfecola\s+di\s+patate\b/,
];

const GLUTEN_PATTERNS = [
  /\bfarina(?:\s+(?:00|0|1|2|tipo\s*00|tipo\s*0|tipo\s*1|tipo\s*2|manitoba|integrale))?\b/,
  /\bfarina\s+(?:di\s+)?(?:grano|frumento|farro|segale|orzo|avena|kamut|spelta)\b/,
  /\b(?:grano|frumento|farro|segale|orzo|avena|kamut|spelta)\b/,
  /\b(?:semola|semolino|cous\s*cous|couscous|bulgur|seitan)\b/,
  /\bpane\b/,
  /\bpasta\b/,
];

export function inferAllergensForIngredientName(name: string) {
  const normalized = normalizeIngredientName(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it");

  if (!normalized) return [];
  if (GLUTEN_FREE_FLOUR_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return [];
  }

  return GLUTEN_PATTERNS.some((pattern) => pattern.test(normalized))
    ? ["glutine"]
    : [];
}

export function mergeInferredAllergens(
  name: string,
  values: string[] | string | null | undefined,
) {
  return normalizeAllergens([...normalizeAllergens(values), ...inferAllergensForIngredientName(name)]);
}

export function formatNutrition(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return suffix ? `${formatted}${suffix}` : formatted;
}

export const EMPTY_NUTRITION_RANGES: NutritionRangesDto = {
  calories: { min: null, max: null, unit: "kcal" },
  proteins: { min: null, max: null, unit: "g" },
  carbs: { min: null, max: null, unit: "g" },
  sugars: { min: null, max: null, unit: "g" },
  fats: { min: null, max: null, unit: "g" },
  fiber: { min: null, max: null, unit: "g" },
  salt: { min: null, max: null, unit: "g" },
};

export const NUTRITION_DISPLAY_ROWS: Array<{
  key: keyof NutritionRangesDto;
  label: string;
  indented?: boolean;
}> = [
  { key: "calories", label: "Calorie" },
  { key: "carbs", label: "Carboidrati" },
  { key: "sugars", label: "di cui zuccheri", indented: true },
  { key: "proteins", label: "Proteine" },
  { key: "fats", label: "Grassi" },
  { key: "fiber", label: "Fibre" },
  { key: "salt", label: "Sale" },
];

export function createNutritionRange(
  value: number | null | undefined,
  unit: NutritionRangeDto["unit"],
  tolerance = 0.05,
): NutritionRangeDto {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return { min: null, max: null, unit };
  }

  if (value === 0) {
    return { min: 0, max: 0, unit };
  }

  return {
    min: Number(Math.max(0, value * (1 - tolerance)).toFixed(2)),
    max: Number((value * (1 + tolerance)).toFixed(2)),
    unit,
  };
}

export function buildNutritionRanges(input: {
  calories?: number | null;
  proteins?: number | null;
  carbs?: number | null;
  sugars?: number | null;
  fats?: number | null;
  fiber?: number | null;
  salt?: number | null;
}): NutritionRangesDto {
  return {
    calories: createNutritionRange(input.calories, "kcal"),
    proteins: createNutritionRange(input.proteins, "g"),
    carbs: createNutritionRange(input.carbs, "g"),
    sugars: createNutritionRange(input.sugars, "g"),
    fats: createNutritionRange(input.fats, "g"),
    fiber: createNutritionRange(input.fiber, "g"),
    salt: createNutritionRange(input.salt, "g"),
  };
}

export function normalizeNutritionRanges(input?: Partial<NutritionRangesDto> | null): NutritionRangesDto {
  return {
    calories: input?.calories ?? EMPTY_NUTRITION_RANGES.calories,
    proteins: input?.proteins ?? EMPTY_NUTRITION_RANGES.proteins,
    carbs: input?.carbs ?? EMPTY_NUTRITION_RANGES.carbs,
    sugars: input?.sugars ?? EMPTY_NUTRITION_RANGES.sugars,
    fats: input?.fats ?? EMPTY_NUTRITION_RANGES.fats,
    fiber: input?.fiber ?? EMPTY_NUTRITION_RANGES.fiber,
    salt: input?.salt ?? EMPTY_NUTRITION_RANGES.salt,
  };
}

export function formatNutritionRange(range: NutritionRangeDto) {
  if (range.min === null || range.max === null) return "dato non disponibile";

  const decimals = range.unit === "kcal" ? 0 : range.max <= 1 ? 1 : 0;
  const min = range.min.toFixed(decimals);
  const max = range.max.toFixed(decimals);
  return min === max ? `${min} ${range.unit}` : `${min} - ${max} ${range.unit}`;
}

export function formatGdaRange(calories: NutritionRangeDto) {
  if (calories.min === null || calories.max === null) return "dato non disponibile";

  const min = Math.max(0, (calories.min / 2000) * 100);
  const max = Math.max(0, (calories.max / 2000) * 100);
  const decimals = max <= 1 ? 1 : 0;
  const formattedMin = min.toFixed(decimals);
  const formattedMax = max.toFixed(decimals);
  return formattedMin === formattedMax
    ? `${formattedMin}%`
    : `${formattedMin} - ${formattedMax}%`;
}
