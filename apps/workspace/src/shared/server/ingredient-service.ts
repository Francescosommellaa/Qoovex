import "server-only";

import {
  buildNutritionRanges,
  normalizeIngredientName,
  slugifyIngredientName,
} from "@shared/lib/ingredient-normalization";
import type {
  IngredientEnrichmentDto,
  IngredientInput,
  IngredientSuggestionDto,
} from "@shared/lib/workspace-types";
import { createPersistentNotification } from "@shared/server/notification-service";
import {
  createIngredientReview,
  findIngredientByNameOrSlug,
  searchIngredients,
  upsertCatalogIngredient,
} from "@shared/server/repositories/ingredient-repository";

const EXTERNAL_LOOKUP_MIN_INTERVAL_MS = 1200;
let lastExternalLookupAt = 0;

interface ExternalIngredientResult {
  name: string;
  allergens: string[];
  calories: number | null;
  proteins: number | null;
  carbs: number | null;
  sugars: number | null;
  fats: number | null;
  fiber: number | null;
  salt: number | null;
  source: "OPEN_FOOD_FACTS" | "USDA";
  sourceRef?: string;
  confidence: number;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleExternalLookup() {
  const elapsed = Date.now() - lastExternalLookupAt;
  if (elapsed < EXTERNAL_LOOKUP_MIN_INTERVAL_MS) {
    await wait(EXTERNAL_LOOKUP_MIN_INTERVAL_MS - elapsed);
  }
  lastExternalLookupAt = Date.now();
}

function numberOrNull(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseOpenFoodFactsProduct(product: Record<string, unknown>, fallbackName: string): ExternalIngredientResult | null {
  const nutriments = (product.nutriments ?? {}) as Record<string, unknown>;
  const productName = typeof product.product_name === "string" ? product.product_name.trim() : "";
  const allergensTags = Array.isArray(product.allergens_tags) ? product.allergens_tags : [];
  const allergens = allergensTags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.replace(/^..:/, "").replace(/-/g, " "))
    .filter(Boolean);

  const calories = numberOrNull(nutriments["energy-kcal_100g"]);
  const proteins = numberOrNull(nutriments.proteins_100g);
  const carbs = numberOrNull(nutriments.carbohydrates_100g);
  const sugars = numberOrNull(nutriments.sugars_100g);
  const fats = numberOrNull(nutriments.fat_100g);
  const fiber = numberOrNull(nutriments.fiber_100g);
  const salt = numberOrNull(nutriments.salt_100g);

  if (
    calories === null &&
    proteins === null &&
    carbs === null &&
    sugars === null &&
    fats === null &&
    fiber === null &&
    salt === null &&
    allergens.length === 0
  ) {
    return null;
  }

  return {
    name: productName || fallbackName,
    allergens,
    calories,
    proteins,
    carbs,
    sugars,
    fats,
    fiber,
    salt,
    source: "OPEN_FOOD_FACTS",
    sourceRef: typeof product.code === "string" ? product.code : undefined,
    confidence: 0.72,
  };
}

async function lookupOpenFoodFacts(name: string): Promise<ExternalIngredientResult | null> {
  await throttleExternalLookup();

  const params = new URLSearchParams({
    search_terms: name,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "4",
    fields: "code,product_name,nutriments,allergens_tags",
  });

  const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
    headers: {
      "User-Agent": "QoovexWorkspace/0.1 (+https://qoovex.com)",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { products?: Array<Record<string, unknown>> };
  for (const product of payload.products ?? []) {
    const parsed = parseOpenFoodFactsProduct(product, name);
    if (parsed) return parsed;
  }

  return null;
}

async function lookupUsda(name: string): Promise<ExternalIngredientResult | null> {
  const apiKey = process.env.FOODDATA_CENTRAL_API_KEY;
  if (!apiKey) return null;

  await throttleExternalLookup();

  const params = new URLSearchParams({
    api_key: apiKey,
    query: name,
    pageSize: "5",
  });
  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?${params}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    foods?: Array<{
      fdcId?: number;
      description?: string;
      foodNutrients?: Array<{ nutrientName?: string; value?: number }>;
    }>;
  };
  const food = payload.foods?.[0];
  if (!food) return null;
  const nutrients = food.foodNutrients ?? [];

  function nutrient(label: string) {
    return numberOrNull(
      nutrients.find((item) =>
        item.nutrientName?.toLocaleLowerCase("it").includes(label),
      )?.value,
    );
  }

  return {
    name: food.description || name,
    allergens: [],
    calories: nutrient("energy"),
    proteins: nutrient("protein"),
    carbs: nutrient("carbohydrate"),
    sugars: nutrient("sugars"),
    fats: nutrient("total lipid"),
    fiber: nutrient("fiber"),
    salt: (() => {
      const sodium = nutrient("sodium");
      return sodium === null ? null : Number((sodium * 2.5 / 1000).toFixed(3));
    })(),
    source: "USDA",
    sourceRef: food.fdcId?.toString(),
    confidence: 0.78,
  };
}

async function askOllamaForSuggestion(name: string, candidates: IngredientSuggestionDto[]) {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";
  if (!baseUrl || candidates.length === 0) return null;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        prompt: [
          "Sei un assistente per ingredienti professionali. Scegli il candidato piu simile all'input.",
          "Rispondi solo con lo slug esatto del candidato oppure NONE.",
          `Input: ${name}`,
          `Candidati: ${candidates.map((item) => `${item.slug}:${item.name}`).join(", ")}`,
        ].join("\n"),
      }),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as { response?: string };
    const slug = payload.response?.trim().split(/\s+/)[0];
    return candidates.find((candidate) => candidate.slug === slug) ?? null;
  } catch {
    return null;
  }
}

function toIngredientInput(result: ExternalIngredientResult, requestedName: string): IngredientInput {
  const displayName = normalizeIngredientName(requestedName);
  return {
    name: displayName,
    sourceName: normalizeIngredientName(result.name || requestedName),
    slug: slugifyIngredientName(displayName),
    quantity: 1,
    unit: "g",
    allergens: result.allergens.join(", "),
    calories: result.calories,
    proteins: result.proteins,
    carbs: result.carbs,
    fats: result.fats,
    nutrition: buildNutritionRanges({
      calories: result.calories,
      proteins: result.proteins,
      carbs: result.carbs,
      sugars: result.sugars,
      fats: result.fats,
      fiber: result.fiber,
      salt: result.salt,
    }),
    source: result.source,
    sourceRef: result.sourceRef ?? null,
    confidence: result.confidence,
    verificationStatus: "VERIFIED",
  };
}

function buildPendingInput(name: string): IngredientInput {
  return {
    name: normalizeIngredientName(name),
    slug: slugifyIngredientName(name),
    quantity: 1,
    unit: "g",
    allergens: "",
    calories: null,
    proteins: null,
    carbs: null,
    fats: null,
    nutrition: buildNutritionRanges({}),
    source: "OLLAMA",
    confidence: 0.1,
    verificationStatus: "PENDING_REVIEW",
  };
}

export async function getIngredientSuggestions(query: string) {
  return await searchIngredients(query);
}

export async function enrichIngredientForUser(input: {
  userId: string;
  name: string;
}): Promise<IngredientEnrichmentDto> {
  const name = normalizeIngredientName(input.name);
  const slug = slugifyIngredientName(name);

  if (name.length < 2) {
    throw new Error("Scrivi almeno 2 caratteri per cercare un ingrediente.");
  }

  const existing = await findIngredientByNameOrSlug(name);
  if (existing) {
    return {
      ingredient: existing,
      status: existing.verificationStatus === "PENDING_REVIEW" ? "pending_review" : "matched",
      matchReason: "catalog",
      message:
        existing.verificationStatus === "PENDING_REVIEW"
          ? "Ingrediente gia in revisione."
          : "Ingrediente trovato nel catalogo Qoovex.",
    };
  }

  const localCandidates = await searchIngredients(name, 5);
  const suggested = await askOllamaForSuggestion(name, localCandidates);
  if (suggested) {
    return {
      ingredient: suggested,
      status: "suggested",
      matchReason: "local_candidate",
      message: `Forse intendevi ${suggested.name}.`,
    };
  }

  const external = (await lookupOpenFoodFacts(name)) ?? (await lookupUsda(name));
  if (external) {
    const ingredient = await upsertCatalogIngredient(toIngredientInput(external, name));
    return {
      ingredient,
      status: "matched",
      matchReason: external.source === "USDA" ? "usda" : "open_food_facts",
      message: "Ingrediente verificato e salvato nel catalogo Qoovex.",
    };
  }

  const pendingIngredient = await upsertCatalogIngredient(buildPendingInput(name));
  const review = await createIngredientReview({
    userId: input.userId,
    ingredientId: pendingIngredient.id,
    rawName: name,
    normalizedSlug: slug,
    note: "Lookup automatico senza risultati affidabili.",
  });

  await createPersistentNotification({
    userId: input.userId,
    type: "ingredient_review",
    title: "Ingrediente in revisione",
    body: `${name} non e stato verificato automaticamente. La ricetta restera in bozza non pubblicabile finche un revisore non lo conferma.`,
    data: { reviewId: review.id, ingredientSlug: slug },
  });

  return {
    ingredient: pendingIngredient,
    status: "pending_review",
    matchReason: "manual_review",
    warnings: ["Nessuna fonte affidabile ha restituito dati nutrizionali completi."],
    message: "Ingrediente non verificato: salvato in revisione, tempo stimato 24 ore.",
    reviewId: review.id,
  };
}

export async function enrichIngredientsForUser(input: {
  userId: string;
  names: string[];
}) {
  const uniqueNames = Array.from(
    new Set(input.names.map((name) => normalizeIngredientName(name)).filter((name) => name.length >= 2)),
  ).slice(0, 12);

  const results = [];
  for (const name of uniqueNames) {
    results.push(await enrichIngredientForUser({ userId: input.userId, name }));
  }

  return results;
}
