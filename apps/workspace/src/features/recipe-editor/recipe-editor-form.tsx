"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ImageSquare, MagnifyingGlass, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Form,
  FormActions,
  FormControl,
  FormField,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@qoovex/ui";
import {
  createRecipeAction,
  updateRecipeAction,
} from "@shared/actions/recipe-actions";
import {
  EMPTY_NUTRITION_RANGES,
  INGREDIENT_UNIT_OPTIONS,
  NUTRITION_DISPLAY_ROWS,
  RECIPE_CATEGORY_OPTIONS,
  formatGdaRange,
  formatNutritionRange,
  normalizeAllergens,
  normalizeNutritionRanges,
} from "@shared/lib/ingredient-normalization";
import type {
  IngredientEnrichmentDto,
  IngredientInput,
  IngredientSuggestionDto,
  NutritionRangeDto,
  NutritionRangesDto,
  RecipeDetailDto,
  RecipeEditorInput,
} from "@shared/lib/workspace-types";

interface RecipeEditorFormProps {
  mode: "create" | "edit";
  initialRecipe?: RecipeDetailDto;
}

function createEmptyIngredient(): IngredientInput {
  return {
    name: "",
    quantity: 1,
    unit: "g",
    allergens: "",
    calories: null,
    proteins: null,
    carbs: null,
    fats: null,
    nutrition: EMPTY_NUTRITION_RANGES,
    verificationStatus: "PENDING_REVIEW",
    source: "USER",
    confidence: null,
  };
}

function getInitialInput(initialRecipe?: RecipeDetailDto): RecipeEditorInput {
  if (!initialRecipe) {
    return {
      title: "",
      description: "",
      instructions: "",
      category: "ALTRO",
      servings: 4,
      prepTime: null,
      cookTime: null,
      isPublic: false,
      imageUrl: null,
      ingredients: [createEmptyIngredient()],
    };
  }

  return {
    title: initialRecipe.title,
    description: initialRecipe.description ?? "",
    instructions: initialRecipe.instructions ?? "",
    category: initialRecipe.category,
    servings: initialRecipe.servings,
    prepTime: initialRecipe.prepTime,
    cookTime: initialRecipe.cookTime,
    isPublic: initialRecipe.isPublic,
    imageUrl: initialRecipe.imageUrl,
    ingredients: initialRecipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      slug: ingredient.slug,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      allergens: ingredient.allergens.join(", "),
      calories: ingredient.calories,
      proteins: ingredient.proteins,
      carbs: ingredient.carbs,
      fats: ingredient.fats,
      nutrition: ingredient.nutrition,
      verificationStatus: ingredient.verificationStatus,
      source: ingredient.source,
      confidence: ingredient.confidence,
    })),
  };
}

function parseNumber(value: string, fallback: number | null) {
  if (!value.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function applySuggestion(ingredient: IngredientInput, suggestion: IngredientSuggestionDto): IngredientInput {
  return {
    ...ingredient,
    name: suggestion.name,
    slug: suggestion.slug,
    allergens: suggestion.allergens.join(", "),
    calories: suggestion.calories,
    proteins: suggestion.proteins,
    carbs: suggestion.carbs,
    fats: suggestion.fats,
    nutrition: suggestion.nutrition,
    verificationStatus: suggestion.verificationStatus,
    source: suggestion.source,
    confidence: suggestion.confidence,
  };
}

function addRange(
  current: NutritionRangeDto,
  range: NutritionRangeDto,
  factor: number,
): NutritionRangeDto {
  if (range.min === null || range.max === null) return current;
  return {
    unit: current.unit,
    min: (current.min ?? 0) + range.min * factor,
    max: (current.max ?? 0) + range.max * factor,
  };
}

function roundPreviewNutrition(nutrition: NutritionRangesDto): NutritionRangesDto {
  return {
    calories: {
      ...nutrition.calories,
      min: nutrition.calories.min === null ? null : Number(nutrition.calories.min.toFixed(1)),
      max: nutrition.calories.max === null ? null : Number(nutrition.calories.max.toFixed(1)),
    },
    proteins: {
      ...nutrition.proteins,
      min: nutrition.proteins.min === null ? null : Number(nutrition.proteins.min.toFixed(1)),
      max: nutrition.proteins.max === null ? null : Number(nutrition.proteins.max.toFixed(1)),
    },
    carbs: {
      ...nutrition.carbs,
      min: nutrition.carbs.min === null ? null : Number(nutrition.carbs.min.toFixed(1)),
      max: nutrition.carbs.max === null ? null : Number(nutrition.carbs.max.toFixed(1)),
    },
    sugars: {
      ...nutrition.sugars,
      min: nutrition.sugars.min === null ? null : Number(nutrition.sugars.min.toFixed(1)),
      max: nutrition.sugars.max === null ? null : Number(nutrition.sugars.max.toFixed(1)),
    },
    fats: {
      ...nutrition.fats,
      min: nutrition.fats.min === null ? null : Number(nutrition.fats.min.toFixed(1)),
      max: nutrition.fats.max === null ? null : Number(nutrition.fats.max.toFixed(1)),
    },
    fiber: {
      ...nutrition.fiber,
      min: nutrition.fiber.min === null ? null : Number(nutrition.fiber.min.toFixed(1)),
      max: nutrition.fiber.max === null ? null : Number(nutrition.fiber.max.toFixed(1)),
    },
    salt: {
      ...nutrition.salt,
      min: nutrition.salt.min === null ? null : Number(nutrition.salt.min.toFixed(2)),
      max: nutrition.salt.max === null ? null : Number(nutrition.salt.max.toFixed(2)),
    },
  };
}

function calculatePreview(ingredients: IngredientInput[]) {
  return ingredients.reduce(
    (acc, ingredient) => {
      const unit = ingredient.unit.toLocaleLowerCase("it");
      const factor =
        unit === "kg" || unit === "l"
          ? (ingredient.quantity * 1000) / 100
          : unit === "g" || unit === "ml"
            ? ingredient.quantity / 100
            : 0;
      const nutrition = normalizeNutritionRanges(ingredient.nutrition);

      return {
        nutrition: roundPreviewNutrition({
          calories: addRange(acc.nutrition.calories, nutrition.calories, factor),
          proteins: addRange(acc.nutrition.proteins, nutrition.proteins, factor),
          carbs: addRange(acc.nutrition.carbs, nutrition.carbs, factor),
          sugars: addRange(acc.nutrition.sugars, nutrition.sugars, factor),
          fats: addRange(acc.nutrition.fats, nutrition.fats, factor),
          fiber: addRange(acc.nutrition.fiber, nutrition.fiber, factor),
          salt: addRange(acc.nutrition.salt, nutrition.salt, factor),
        }),
        allergens: normalizeAllergens([
          ...acc.allergens,
          ...(ingredient.allergens?.split(",") ?? []),
        ]),
        pending: acc.pending + (ingredient.verificationStatus === "PENDING_REVIEW" ? 1 : 0),
      };
    },
    {
      nutrition: EMPTY_NUTRITION_RANGES,
      allergens: [] as string[],
      pending: 0,
    },
  );
}

function IngredientRow({
  ingredient,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  ingredient: IngredientInput;
  index: number;
  canRemove: boolean;
  onChange: (index: number, ingredient: IngredientInput) => void;
  onRemove: (index: number) => void;
}) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = React.useState<IngredientSuggestionDto[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);

  function updateIngredient(patch: Partial<IngredientInput>) {
    onChange(index, { ...ingredient, ...patch });
  }

  React.useEffect(() => {
    const query = ingredient.name.trim();
    if (query.length < 1 || ingredient.slug) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { suggestions?: IngredientSuggestionDto[] };
        setSuggestions(payload.suggestions ?? []);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [ingredient.name, ingredient.slug]);

  const predictiveSuggestion = suggestions[0];

  async function verifyIngredient() {
    const name = ingredient.name.trim();
    if (!name) return;

    setVerifying(true);
    try {
      const response = await fetch("/api/ingredients/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = (await response.json()) as IngredientEnrichmentDto | { message?: string };

      if (!response.ok || !("ingredient" in payload)) {
        throw new Error(payload.message ?? "Ingrediente non verificato.");
      }

      onChange(index, applySuggestion(ingredient, payload.ingredient));
      toast({
        variant: payload.status === "pending_review" ? "warning" : "success",
        title: payload.status === "pending_review" ? "Ingrediente in revisione" : "Ingrediente verificato",
        description: payload.message,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: error instanceof Error ? error.message : "Riprova tra poco.",
      });
    } finally {
      setVerifying(false);
    }
  }

  const isPending = ingredient.verificationStatus === "PENDING_REVIEW";
  const isVerified = ingredient.verificationStatus === "VERIFIED" || ingredient.verificationStatus === "SUGGESTED";
  const nutrition = normalizeNutritionRanges(ingredient.nutrition);

  return (
    <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3) shadow-(--shadow-sm)">
      <div className="grid gap-(--spacing-3) lg:grid-cols-[minmax(0,1fr)_7rem_8rem_auto] lg:items-end">
        <div className="relative">
          <Input
            label={`Ingrediente ${index + 1}`}
            value={ingredient.name}
            placeholder="Farina 00"
            onKeyDown={(event) => {
              if (event.key === "Tab" && predictiveSuggestion) {
                event.preventDefault();
                onChange(index, applySuggestion(ingredient, predictiveSuggestion));
                setSuggestions([]);
              }
            }}
            onChange={(event) =>
              onChange(index, {
                ...ingredient,
                name: event.target.value,
                slug: undefined,
                verificationStatus: "PENDING_REVIEW",
              })
            }
          />
          {suggestions.length > 0 ? (
            <div className="absolute z-20 mt-(--spacing-1) max-h-56 w-full overflow-auto rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-elevated) p-(--spacing-1) shadow-(--shadow-lg)">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="grid w-full gap-(--spacing-1) rounded-(--radius-md) px-(--spacing-3) py-(--spacing-2) text-left transition-colors hover:bg-(--color-surface-muted)"
                  onClick={() => {
                    onChange(index, applySuggestion(ingredient, suggestion));
                    setSuggestions([]);
                  }}
                >
                  <Text size="sm" weight="medium">
                    {suggestion.name}
                  </Text>
                  <Text size="xs" tone="muted">
                    {suggestion.allergens.length > 0
                      ? `Allergeni: ${suggestion.allergens.join(", ")}`
                      : "Nessun allergene noto"}
                  </Text>
                </button>
              ))}
            </div>
          ) : null}
          {predictiveSuggestion ? (
            <Text size="xs" tone="muted" className="mt-(--spacing-1)">
              Suggerimento: {predictiveSuggestion.name}. Premi Tab per confermare.
            </Text>
          ) : null}
          {loadingSuggestions ? (
            <Text size="xs" tone="muted" className="mt-(--spacing-1)">
              Ricerca nel catalogo...
            </Text>
          ) : null}
        </div>

        <Input
          label="Quantita"
          type="number"
          min={0}
          step="0.01"
          value={ingredient.quantity}
          onChange={(event) =>
            updateIngredient({
              quantity: parseNumber(event.target.value, 0) ?? 0,
            })
          }
        />
        <Select
          label="Unita"
          options={INGREDIENT_UNIT_OPTIONS}
          value={ingredient.unit}
          onChange={(unit) => updateIngredient({ unit })}
        />
        <div className="flex gap-(--spacing-2) lg:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconLeft={<MagnifyingGlass size={14} />}
            loading={verifying}
            loadingLabel="Verifico"
            onClick={verifyIngredient}
          >
            Verifica
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconLeft={<Trash size={14} />}
            disabled={!canRemove}
            onClick={() => onRemove(index)}
          >
            Rimuovi
          </Button>
        </div>
      </div>

      <div className="grid gap-(--spacing-2) sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_9rem]">
        <NutritionRangeList nutrition={nutrition} />
        <div className="rounded-(--radius-md) bg-(--color-surface-muted) p-(--spacing-2)">
          <Text size="xs" tone="muted">
            Stato
          </Text>
          <Badge size="sm" tone={isPending ? "warning" : isVerified ? "success" : "neutral"}>
            {isPending ? "In revisione" : isVerified ? "Verificato" : "Da verificare"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-(--spacing-2)">
        {normalizeAllergens(ingredient.allergens).length > 0 ? (
          normalizeAllergens(ingredient.allergens).map((allergen) => (
            <Badge key={allergen} size="sm" tone="warning">
              {allergen}
            </Badge>
          ))
        ) : (
          <Badge size="sm" tone="neutral">
            allergeni non presenti o non disponibili
          </Badge>
        )}
      </div>
    </div>
  );
}

function NutritionRangeList({ nutrition }: { nutrition: NutritionRangesDto }) {
  return (
    <div className="grid gap-(--spacing-1) rounded-(--radius-md) bg-(--color-surface-muted) p-(--spacing-3)">
      {NUTRITION_DISPLAY_ROWS.map((row) => (
        <div
          key={row.key}
          className={`flex items-baseline justify-between gap-(--spacing-3) ${
            row.indented ? "pl-(--spacing-3)" : ""
          }`}
        >
          <Text size="xs" tone="muted">
            {row.label}
          </Text>
          <Text size="sm" weight={row.indented ? "medium" : "semibold"} className="text-right">
            {formatNutritionRange(nutrition[row.key])}
          </Text>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-(--spacing-3)">
        <Text size="xs" tone="muted">
          GDA
        </Text>
        <Text size="sm" weight="semibold" className="text-right">
          {formatGdaRange(nutrition.calories)}
        </Text>
      </div>
    </div>
  );
}

export function RecipeEditorForm({
  mode,
  initialRecipe,
}: RecipeEditorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [input, setInput] = React.useState<RecipeEditorInput>(() =>
    getInitialInput(initialRecipe),
  );
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const preview = React.useMemo(() => calculatePreview(input.ingredients), [input.ingredients]);
  const hasPendingIngredients = preview.pending > 0;

  function updateInput(patch: Partial<RecipeEditorInput>) {
    setInput((current) => ({ ...current, ...patch }));
  }

  function updateIngredient(index: number, ingredient: IngredientInput) {
    setInput((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, itemIndex) =>
        itemIndex === index ? ingredient : item,
      ),
    }));
  }

  function removeIngredient(index: number) {
    setInput((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/recipes/image", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { url?: string; message?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.message ?? "Upload non riuscito.");
      }
      updateInput({ imageUrl: payload.url });
      toast({
        variant: "success",
        title: "Immagine caricata",
        description: "La ricetta usera questa immagine nelle card e nel dettaglio.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Immagine non caricata",
        description: error instanceof Error ? error.message : "Riprova con JPG, PNG o WebP.",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result =
      mode === "edit" && initialRecipe
        ? await updateRecipeAction(initialRecipe.id, input)
        : await createRecipeAction(input);

    setSaving(false);

    if (!result.ok || !result.data) {
      toast({
        variant: "error",
        title: "Ricetta non salvata",
        description: result.message,
      });
      return;
    }

    toast({
      variant: hasPendingIngredients ? "warning" : "success",
      title: hasPendingIngredients
        ? "Ricetta salvata come bozza"
        : mode === "edit"
          ? "Ricetta aggiornata"
          : "Ricetta creata",
      description: hasPendingIngredients
        ? "Contiene ingredienti in revisione e non puo essere pubblicata."
        : result.message,
    });
    router.push(`/recipes/${result.data.id}`);
    router.refresh();
  }

  return (
    <Form
      variant="plain"
      layout="stack"
      density="comfortable"
      labelStyle="soft"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-(--spacing-5) xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Stack gap="5">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <div className="grid gap-(--spacing-4) md:grid-cols-[minmax(0,1fr)_14rem]">
                  <FormField label="Titolo ricetta" required>
                    <FormControl>
                      <Input
                        value={input.title}
                        placeholder="Ragu bianco di cortile"
                        onChange={(event) => updateInput({ title: event.target.value })}
                      />
                    </FormControl>
                  </FormField>
                  <Select
                    label="Categoria"
                    options={RECIPE_CATEGORY_OPTIONS}
                    value={input.category}
                    onChange={(category) =>
                      updateInput({ category: category as RecipeEditorInput["category"] })
                    }
                  />
                </div>

                <Textarea
                  label="Descrizione"
                  value={input.description}
                  placeholder="Sintesi operativa della preparazione"
                  maxLength={240}
                  showCount
                  onChange={(event) =>
                    updateInput({ description: event.target.value })
                  }
                />

                <Textarea
                  label="Istruzioni"
                  value={input.instructions}
                  placeholder="Passaggi, tempi e note di servizio"
                  maxRows={14}
                  onChange={(event) =>
                    updateInput({ instructions: event.target.value })
                  }
                />

                <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-muted) p-(--spacing-3) md:grid-cols-[9rem_minmax(0,1fr)] md:items-center">
                  <div className="aspect-[4/3] overflow-hidden rounded-(--radius-md) bg-(--color-surface)">
                    {input.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={input.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-(--color-text-muted)">
                        <ImageSquare size={28} />
                      </div>
                    )}
                  </div>
                  <div className="grid gap-(--spacing-2)">
                    <Text size="sm" weight="semibold">
                      Immagine ricetta
                    </Text>
                    <Text size="xs" tone="muted">
                      Opzionale. JPG, PNG o WebP fino a 5 MB.
                    </Text>
                    <div className="flex flex-wrap gap-(--spacing-2)">
                      <label className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) text-(length:--text-sm) font-(--font-weight-semibold) text-(--color-text) transition-colors hover:bg-(--color-surface-elevated)">
                        {uploadingImage ? "Carico..." : "Carica immagine"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={uploadingImage}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) void uploadImage(file);
                          }}
                        />
                      </label>
                      {input.imageUrl ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => updateInput({ imageUrl: null })}
                        >
                          Rimuovi immagine
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap="4">
            <div className="flex flex-col gap-(--spacing-3) sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Text as="h3" size="xl" weight="semibold">
                  Ingredienti
                </Text>
                <Text size="sm" tone="muted">
                  Scrivi, scegli dal catalogo o verifica: allergeni e nutrienti restano automatici.
                </Text>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                iconLeft={<Plus size={14} />}
                onClick={() =>
                  setInput((current) => ({
                    ...current,
                    ingredients: [...current.ingredients, createEmptyIngredient()],
                  }))
                }
              >
                Ingrediente
              </Button>
            </div>

            {input.ingredients.map((ingredient, index) => (
              <IngredientRow
                key={index}
                ingredient={ingredient}
                index={index}
                canRemove={input.ingredients.length > 1}
                onChange={updateIngredient}
                onRemove={removeIngredient}
              />
            ))}
          </Stack>
        </Stack>

        <aside className="xl:sticky xl:top-(--spacing-5) xl:self-start">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <div>
                  <Text as="h3" size="lg" weight="semibold">
                    Stato ricetta
                  </Text>
                  <Text size="sm" tone="muted">
                    Totali stimati dagli ingredienti verificati.
                  </Text>
                </div>

                <NutritionRangeList nutrition={preview.nutrition} />

                <div className="flex flex-wrap gap-(--spacing-2)">
                  {preview.allergens.length > 0 ? (
                    preview.allergens.map((allergen) => (
                      <Badge key={allergen} size="sm" tone="warning">
                        {allergen}
                      </Badge>
                    ))
                  ) : (
                    <Badge size="sm" tone="success">
                      Nessun allergene noto
                    </Badge>
                  )}
                </div>

                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-muted) p-(--spacing-3)">
                  <div className="flex items-start gap-(--spacing-2)">
                    {hasPendingIngredients ? (
                      <WarningCircle size={18} className="mt-0.5 text-(--color-warning)" />
                    ) : (
                      <CheckCircle size={18} className="mt-0.5 text-(--color-success)" />
                    )}
                    <div>
                      <Text size="sm" weight="semibold">
                        {hasPendingIngredients ? "Bozza non pubblicabile" : "Pronta per Esplora"}
                      </Text>
                      <Text size="xs" tone="muted" leading="relaxed">
                        {hasPendingIngredients
                          ? `${preview.pending} ingredienti richiedono revisione umana entro 24 ore.`
                          : "Tutti gli ingredienti sono verificati o suggeriti dal catalogo."}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="grid gap-(--spacing-3)">
                  <Input
                    label="Porzioni"
                    type="number"
                    min={1}
                    value={input.servings}
                    onChange={(event) =>
                      updateInput({
                        servings: parseNumber(event.target.value, 4) ?? 4,
                      })
                    }
                  />
                  <div className="grid grid-cols-2 gap-(--spacing-3)">
                    <Input
                      label="Prep min."
                      type="number"
                      min={0}
                      value={input.prepTime ?? ""}
                      onChange={(event) =>
                        updateInput({ prepTime: parseNumber(event.target.value, null) })
                      }
                    />
                    <Input
                      label="Cottura"
                      type="number"
                      min={0}
                      value={input.cookTime ?? ""}
                      onChange={(event) =>
                        updateInput({ cookTime: parseNumber(event.target.value, null) })
                      }
                    />
                  </div>
                  <Checkbox
                    label="Pubblica in Esplora"
                    description={
                      hasPendingIngredients
                        ? "Disponibile solo dopo la revisione degli ingredienti."
                        : "Le ricette pubbliche possono essere consultate e copiate."
                    }
                    checked={input.isPublic && !hasPendingIngredients}
                    disabled={hasPendingIngredients}
                    onCheckedChange={(checked) => updateInput({ isPublic: checked })}
                  />
                </div>
              </Stack>
            </CardBody>
          </Card>
        </aside>
      </div>

      <FormActions align="end">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.back()}
        >
          Annulla
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          loadingLabel="Salvataggio..."
        >
          {mode === "edit" ? "Aggiorna ricetta" : "Crea ricetta"}
        </Button>
      </FormActions>
    </Form>
  );
}
