"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CaretDown, ImageSquare, MagnifyingGlass, Minus, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Form,
  FormActions,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@qoovex/ui";
import {
  IngredientVerificationBadge,
  IngredientVerificationNote,
} from "@entities/ingredient";
import { NutritionRows, RecipeAllergenChips } from "@entities/recipe";
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
  mergeInferredAllergens,
  normalizeNutritionRanges,
} from "@shared/lib/ingredient-normalization";
import { calculateNutritionPreview } from "@shared/lib/nutrition-calculation";
import type {
  IngredientEnrichmentDto,
  IngredientInput,
  IngredientSuggestionDto,
  NutritionRangesDto,
  RecipeDetailDto,
  RecipeEditorInput,
} from "@shared/lib/workspace-types";

interface RecipeEditorFormProps {
  mode: "create" | "edit";
  initialRecipe?: RecipeDetailDto;
}

let ingredientRowKeySequence = 0;

function createIngredientRowKey() {
  ingredientRowKeySequence += 1;
  return `ingredient-row-${ingredientRowKeySequence}`;
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
      sourceName: ingredient.sourceName,
      sourceRef: ingredient.sourceRef,
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
  const normalizedValue = value.trim().replace(",", ".");
  if (!normalizedValue) return fallback;
  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumberInput(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return Number.isInteger(value) ? value.toString() : value.toString();
}

function NumberStepper({
  label,
  value,
  min = 0,
  step = 1,
  fallback = null,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  min?: number;
  step?: number;
  fallback?: number | null;
  onChange: (value: number | null) => void;
}) {
  const currentValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;

  function applyStep(direction: 1 | -1) {
    const base = typeof currentValue === "number" ? currentValue : min;
    const nextValue = Math.max(min, Number((base + direction * step).toFixed(2)));
    onChange(nextValue);
  }

  return (
    <div className="grid gap-(--spacing-1)">
      <Text as="span" size="xs" tone="muted" weight="medium" className="uppercase">
        {label}
      </Text>
      <div className="grid h-10 grid-cols-[2.125rem_minmax(3.5rem,1fr)_2.125rem] items-center overflow-hidden rounded-(--radius-full) border border-(--color-border) bg-(--color-input-bg) transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] focus-within:border-(--color-primary) focus-within:shadow-(--shadow-sm)">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-full rounded-none px-0"
          aria-label={`Diminuisci ${label}`}
          onClick={() => applyStep(-1)}
        >
          <Minus size={13} weight="bold" />
        </Button>
        <Input
          type="text"
          inputMode="decimal"
          value={formatNumberInput(value)}
          onChange={(event) => onChange(parseNumber(event.target.value, fallback))}
          srOnlyLabel
          label={label}
          className="h-full rounded-none border-0 bg-transparent px-0 text-center shadow-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-full rounded-none px-0"
          aria-label={`Aumenta ${label}`}
          onClick={() => applyStep(1)}
        >
          <Plus size={13} weight="bold" />
        </Button>
      </div>
    </div>
  );
}

function applySuggestion(ingredient: IngredientInput, suggestion: IngredientSuggestionDto): IngredientInput {
  return {
    ...ingredient,
    name: suggestion.name,
    slug: suggestion.slug,
    sourceName: suggestion.sourceName,
    sourceRef: suggestion.sourceRef,
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

function canVerifyIngredientInput(ingredient: IngredientInput, minNameLength = 1) {
  const nameLength = ingredient.name.trim().length;
  const isVerified = ingredient.verificationStatus === "VERIFIED" || ingredient.verificationStatus === "SUGGESTED";
  const existsInCatalog = Boolean(ingredient.slug || ingredient.sourceRef);
  return nameLength >= minNameLength && !isVerified && !existsInCatalog;
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
  const [suggestionState, setSuggestionState] = React.useState<{
    query: string;
    items: IngredientSuggestionDto[];
  }>({ query: "", items: [] });
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  function updateIngredient(patch: Partial<IngredientInput>) {
    onChange(index, { ...ingredient, ...patch });
  }

  function handleRemoveClick() {
    if (!canRemove || removing) return;
    setRemoving(true);
    window.setTimeout(() => onRemove(index), 180);
  }

  const ingredientSearchQuery = ingredient.name.trim();
  const canSearchSuggestions = ingredientSearchQuery.length > 0 && !ingredient.slug;
  const suggestions =
    canSearchSuggestions && suggestionState.query === ingredientSearchQuery
      ? suggestionState.items
      : [];

  React.useEffect(() => {
    if (!canSearchSuggestions) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/ingredients/search?q=${encodeURIComponent(ingredientSearchQuery)}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (!response.ok) return;
        const payload = (await response.json()) as { suggestions?: IngredientSuggestionDto[] };
        if (controller.signal.aborted) return;
        setSuggestionState({
          query: ingredientSearchQuery,
          items: payload.suggestions ?? [],
        });
      } catch {
        if (controller.signal.aborted) return;
        setSuggestionState({
          query: ingredientSearchQuery,
          items: [],
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [canSearchSuggestions, ingredientSearchQuery]);

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
  const canVerifyIngredient = canVerifyIngredientInput(ingredient);
  const nutrition = normalizeNutritionRanges(ingredient.nutrition);
  const allergens = mergeInferredAllergens(ingredient.name, ingredient.allergens);
  const ingredientDisplayName = ingredient.name.trim() || "Ingrediente non compilato";

  return (
    <Card
      variant="panel"
      padding="none"
      overflow="visible"
      data-removing={removing}
      className="qv-motion-fade-up transform-gpu border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) transition-[opacity,transform,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-border-strong) hover:shadow-(--shadow-md) data-[removing=true]:translate-y-2 data-[removing=true]:scale-[0.985] data-[removing=true]:opacity-0"
    >
      <CardBody padding="md" className="grid gap-(--spacing-4)">
        <div className="flex flex-wrap items-start justify-between gap-(--spacing-3)">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-(--spacing-2)">
              <Text as="h4" size="sm" weight="semibold" className="uppercase tracking-[0.03em]">
                Ingrediente {index + 1}
              </Text>
              <IngredientVerificationBadge
                status={isPending ? "PENDING_REVIEW" : isVerified ? ingredient.verificationStatus : undefined}
              />
            </div>
            <Text size="xs" tone="muted" className="mt-1 truncate">
              {ingredientDisplayName}
              {ingredient.sourceName ? ` · ${ingredient.sourceName}` : ""}
            </Text>
          </div>
          <div className="flex items-center gap-(--spacing-2)">
            <BadgeLike label="GDA" value={formatGdaRange(nutrition.calories)} />
          </div>
        </div>

        <div className="grid gap-(--spacing-3)">
          <div className="relative">
            <Input
              label="Nome ingrediente"
              value={ingredient.name}
              placeholder="Farina 00"
              onKeyDown={(event) => {
                if (event.key === "Tab" && predictiveSuggestion) {
                  event.preventDefault();
                  onChange(index, applySuggestion(ingredient, predictiveSuggestion));
                  setSuggestionState({ query: "", items: [] });
                }
              }}
              onChange={(event) =>
                onChange(index, {
                  ...ingredient,
                  name: event.target.value,
                  slug: undefined,
                  sourceRef: undefined,
                  sourceName: undefined,
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
                      setSuggestionState({ query: "", items: [] });
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

          <div className="grid gap-(--spacing-3) sm:grid-cols-[minmax(10rem,1fr)_8rem_auto] sm:items-end">
            <NumberStepper
              label="Quantita"
              min={0}
              step={10}
              fallback={0}
              value={ingredient.quantity}
              onChange={(value) => updateIngredient({ quantity: value ?? 0 })}
            />
            <Select
              label="Unita"
              options={INGREDIENT_UNIT_OPTIONS}
              value={ingredient.unit}
              onChange={(unit) => updateIngredient({ unit })}
            />
            <div className="flex gap-(--spacing-2) sm:justify-end">
              <Button
                type="button"
                variant="primary"
                size="md"
                iconLeft={<MagnifyingGlass size={14} />}
                loading={verifying}
                loadingLabel="Verifico"
                disabled={!canVerifyIngredient}
                onClick={verifyIngredient}
              >
                Verifica
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="md"
                iconLeft={<Trash size={14} />}
                disabled={!canRemove}
                onClick={handleRemoveClick}
              >
                Rimuovi
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-divider) bg-(--color-surface-offset) p-(--spacing-3)">
          <div className="grid gap-(--spacing-2) md:grid-cols-3">
            <IngredientSignal label="Energia" value={formatGdaRange(nutrition.calories)} />
            <IngredientSignal label="Proteine" value={formatNutritionRange(nutrition.proteins)} />
            <IngredientSignal label="Carboidrati" value={formatNutritionRange(nutrition.carbs)} />
          </div>

          <div className="flex flex-wrap items-center gap-(--spacing-2)">
            <RecipeAllergenChips
              allergens={allergens}
              emptyLabel="allergeni non presenti o non disponibili"
              compact
            />
          </div>

          <details className="group/ingredient-details">
            <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-(--spacing-3) rounded-(--radius-md) px-(--spacing-2) text-(length:--text-xs) font-medium uppercase tracking-[0.03em] text-(--color-text-muted) transition-colors duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:bg-(--color-surface-muted) hover:text-(--color-text)">
              Dettaglio nutrizionale
              <CaretDown size={13} className="transition-transform group-open/ingredient-details:rotate-180" aria-hidden />
            </summary>
            <div className="qv-motion-fade-up px-(--spacing-1) pb-(--spacing-1) pt-(--spacing-2)">
              <IngredientNutritionDetails nutrition={nutrition} />
            </div>
          </details>
        </div>
      </CardBody>
    </Card>
  );
}

function IngredientSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-h-16 content-center gap-1 rounded-(--radius-md) border border-(--color-divider) bg-(--color-surface) px-(--spacing-3) py-(--spacing-2)">
      <Text size="xs" tone="faint" className="uppercase tracking-[0.03em]">
        {label}
      </Text>
      <Text size="sm" weight="semibold" className="truncate">
        {value}
      </Text>
    </div>
  );
}

function BadgeLike({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-(--spacing-1) rounded-(--radius-full) border border-(--color-border) bg-(--color-surface) px-(--spacing-2) py-1 text-(length:--text-xs)">
      <span className="text-(--color-text-faint)">{label}</span>
      <span className="font-medium text-(--color-text)">{value}</span>
    </span>
  );
}

function IngredientNutritionDetails({ nutrition }: { nutrition: NutritionRangesDto }) {
  return (
    <div className="grid gap-(--spacing-1) pt-(--spacing-1)">
      {NUTRITION_DISPLAY_ROWS.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-(--spacing-3) rounded-(--radius-sm) px-(--spacing-2) py-1.5 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-qoovex)] hover:bg-(--color-surface-muted)"
        >
          <Text size="xs" tone="muted" className={row.indented ? "pl-(--spacing-3)" : ""}>
            {row.label}
          </Text>
          <Text size="xs" weight="medium" className="text-right">
            {formatNutritionRange(nutrition[row.key])}
          </Text>
        </div>
      ))}
      <div className="mt-(--spacing-1) grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-(--spacing-3) rounded-(--radius-sm) bg-(--color-surface-muted) px-(--spacing-2) py-1.5">
        <Text size="xs" tone="muted" className="uppercase">
          GDA
        </Text>
        <Text size="xs" weight="semibold" className="text-right">
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
  const [ingredientRowKeys, setIngredientRowKeys] = React.useState(() =>
    getInitialInput(initialRecipe).ingredients.map(() => createIngredientRowKey()),
  );
  const [saving, setSaving] = React.useState(false);
  const [verifyingAll, setVerifyingAll] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    () => initialRecipe?.imageUrl ?? null,
  );
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const preview = React.useMemo(() => calculateNutritionPreview(input.ingredients), [input.ingredients]);
  const hasPendingIngredients = preview.pending > 0;
  const hasVerifiableIngredients = input.ingredients.some((ingredient) =>
    canVerifyIngredientInput(ingredient, 2),
  );

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
    setIngredientRowKeys((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function addIngredient() {
    setInput((current) => {
      const nextIngredients = [...current.ingredients];
      nextIngredients.push(createEmptyIngredient());
      return {
        ...current,
        ingredients: nextIngredients,
      };
    });
    setIngredientRowKeys((current) => [...current, createIngredientRowKey()]);
  }

  async function verifyAllIngredients() {
    const targets = input.ingredients
      .map((ingredient, index) => ({ ingredient, index }))
      .filter(({ ingredient }) => canVerifyIngredientInput(ingredient, 2));

    if (targets.length === 0) {
      toast({
        variant: "success",
        title: "Ingredienti gia verificati",
        description: "Non ci sono ingredienti da aggiornare.",
      });
      return;
    }

    setVerifyingAll(true);
    try {
      const response = await fetch("/api/ingredients/enrich-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: targets.map(({ ingredient }) => ingredient.name) }),
      });
      const payload = (await response.json()) as {
        results?: IngredientEnrichmentDto[];
        message?: string;
      };

      if (!response.ok || !payload.results) {
        throw new Error(payload.message ?? "Verifica non riuscita.");
      }

      setInput((current) => {
        const nextIngredients = [...current.ingredients];
        for (const result of payload.results ?? []) {
          const target = targets.find(
            ({ ingredient }) =>
              ingredient.name.trim().toLocaleLowerCase("it") ===
              result.ingredient.name.trim().toLocaleLowerCase("it"),
          );
          if (target) {
            nextIngredients[target.index] = applySuggestion(nextIngredients[target.index], result.ingredient);
          }
        }
        return { ...current, ingredients: nextIngredients };
      });

      const pending = payload.results.filter((result) => result.status === "pending_review").length;
      toast({
        variant: pending > 0 ? "warning" : "success",
        title: "Ingredienti verificati",
        description:
          pending > 0
            ? `${pending} ingredienti restano in revisione.`
            : "Allergeni e valori nutrizionali sono stati aggiornati.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: error instanceof Error ? error.message : "Riprova tra poco.",
      });
    } finally {
      setVerifyingAll(false);
    }
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
      const payload = (await response.json()) as {
        url?: string;
        displayUrl?: string;
        message?: string;
      };
      if (!response.ok || !payload.url) {
        throw new Error(payload.message ?? "Upload non riuscito.");
      }
      updateInput({ imageUrl: payload.url });
      setImagePreviewUrl(payload.displayUrl ?? payload.url);
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
                  <Input
                    label="TITOLO RICETTA"
                    required
                    value={input.title}
                    placeholder="Ragu bianco di cortile"
                    onChange={(event) => updateInput({ title: event.target.value })}
                  />
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
                  label="DESCRIZIONE"
                  variant="static"
                  value={input.description}
                  placeholder="Sintesi operativa della preparazione"
                  maxLength={240}
                  showCount
                  onChange={(event) =>
                    updateInput({ description: event.target.value })
                  }
                />

                <Textarea
                  label="ISTRUZIONI"
                  variant="fixed"
                  value={input.instructions}
                  placeholder="Passaggi, tempi e note di servizio"
                  maxRows={14}
                  onChange={(event) =>
                    updateInput({ instructions: event.target.value })
                  }
                />

                <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-muted) p-(--spacing-3) md:grid-cols-[9rem_minmax(0,1fr)] md:items-center">
                  <div className="aspect-square overflow-hidden rounded-(--radius-md) bg-(--color-surface)">
                    {input.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreviewUrl ?? input.imageUrl}
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
                    <Text size="sm" weight="semibold" className="uppercase">
                      Immagine ricetta
                    </Text>
                    <Text size="xs" tone="muted">
                      Opzionale. JPG, PNG o WebP fino a 5 MB.
                    </Text>
                    <div className="flex flex-wrap gap-(--spacing-2)">
                      <input
                        ref={imageInputRef}
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
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        loading={uploadingImage}
                        loadingLabel="Carico..."
                        onClick={() => imageInputRef.current?.click()}
                      >
                        Carica immagine
                      </Button>
                      {input.imageUrl ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            updateInput({ imageUrl: null });
                            setImagePreviewUrl(null);
                          }}
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
                <Text as="h3" size="xl" weight="semibold" className="uppercase">
                  Ingredienti
                </Text>
                <Text size="sm" tone="muted">
                  Scrivi, scegli dal catalogo o verifica: allergeni e nutrienti restano automatici.
                </Text>
              </div>
              <div className="flex flex-wrap gap-(--spacing-2)">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={verifyingAll}
                  loadingLabel="Verifico"
                  iconLeft={<MagnifyingGlass size={14} />}
                  disabled={!hasVerifiableIngredients}
                  onClick={verifyAllIngredients}
                >
                  Verifica tutti
                </Button>
              </div>
            </div>

            {input.ingredients.map((ingredient, index) => (
              <IngredientRow
                key={ingredientRowKeys[index] ?? `ingredient-row-fallback-${index}`}
                ingredient={ingredient}
                index={index}
                canRemove={input.ingredients.length > 1}
                onChange={updateIngredient}
                onRemove={removeIngredient}
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              size="md"
              iconLeft={<Plus size={16} />}
              className="qv-motion-interactive w-full justify-center border-dashed"
              onClick={addIngredient}
            >
              Aggiungi ingrediente
            </Button>
          </Stack>
        </Stack>

        <aside className="xl:sticky xl:top-(--spacing-5) xl:self-start">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <div>
                  <Text as="h3" size="lg" weight="semibold" className="uppercase">
                    Stato ricetta
                  </Text>
                  <Text size="sm" tone="muted">
                    Totali stimati dagli ingredienti verificati.
                  </Text>
                </div>

                <NutritionRows nutrition={preview.nutrition} compact />

                <RecipeAllergenChips allergens={preview.allergens} emptyLabel="Nessun allergene noto" />

                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-muted) p-(--spacing-3)">
                  <IngredientVerificationNote
                    status={hasPendingIngredients ? "PENDING_REVIEW" : "VERIFIED"}
                    pendingCount={preview.pending}
                  />
                </div>

                {preview.warnings.length > 0 ? (
                  <div className="grid gap-(--spacing-2) rounded-(--radius-lg) border border-(--color-warning)/30 bg-(--color-warning-highlight) p-(--spacing-3)">
                    {preview.warnings.map((warning) => (
                      <div key={warning} className="flex items-start gap-(--spacing-2)">
                        <WarningCircle size={16} className="mt-0.5 shrink-0 text-(--color-warning)" />
                        <Text size="xs" tone="muted" leading="relaxed">
                          {warning}
                        </Text>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-(--spacing-3)">
                  <NumberStepper
                    label="Porzioni"
                    min={1}
                    step={1}
                    fallback={4}
                    value={input.servings}
                    onChange={(value) => updateInput({ servings: value ?? 4 })}
                  />
                  <div className="grid gap-(--spacing-3)">
                    <NumberStepper
                      label="Prep min."
                      min={0}
                      step={5}
                      value={input.prepTime}
                      onChange={(value) => updateInput({ prepTime: value })}
                    />
                    <NumberStepper
                      label="Cottura"
                      min={0}
                      step={5}
                      value={input.cookTime}
                      onChange={(value) => updateInput({ cookTime: value })}
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
