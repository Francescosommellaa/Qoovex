"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "@phosphor-icons/react";
import {
  Button,
  Checkbox,
  Form,
  FormActions,
  FormControl,
  FormField,
  Input,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@qoovex/ui";
import {
  createRecipeAction,
  updateRecipeAction,
} from "@shared/actions/recipe-actions";
import type {
  IngredientInput,
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
  };
}

function getInitialInput(initialRecipe?: RecipeDetailDto): RecipeEditorInput {
  if (!initialRecipe) {
    return {
      title: "",
      description: "",
      instructions: "",
      servings: 4,
      prepTime: null,
      cookTime: null,
      isPublic: false,
      ingredients: [createEmptyIngredient()],
    };
  }

  return {
    title: initialRecipe.title,
    description: initialRecipe.description ?? "",
    instructions: initialRecipe.instructions ?? "",
    servings: initialRecipe.servings,
    prepTime: initialRecipe.prepTime,
    cookTime: initialRecipe.cookTime,
    isPublic: initialRecipe.isPublic,
    ingredients: initialRecipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      allergens: ingredient.allergens.join(", "),
      calories: ingredient.calories,
      proteins: ingredient.proteins,
      carbs: ingredient.carbs,
      fats: ingredient.fats,
    })),
  };
}

function parseNumber(value: string, fallback: number | null) {
  if (!value.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
  function updateIngredient(patch: Partial<IngredientInput>) {
    onChange(index, { ...ingredient, ...patch });
  }

  return (
    <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)">
      <div className="grid gap-(--spacing-3) md:grid-cols-[minmax(0,1.2fr)_7rem_7rem_auto] md:items-end">
        <Input
          label={`Ingrediente ${index + 1}`}
          value={ingredient.name}
          placeholder="Farina 00"
          onChange={(event) => updateIngredient({ name: event.target.value })}
        />
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
        <Input
          label="Unita"
          value={ingredient.unit}
          placeholder="g"
          onChange={(event) => updateIngredient({ unit: event.target.value })}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconLeft={<Trash size={14} />}
          disabled={!canRemove}
          onClick={() => onRemove(index)}
        >
          Rimuovi
        </Button>
      </div>

      <div className="grid gap-(--spacing-3) md:grid-cols-5">
        <Input
          label="Allergeni"
          placeholder="glutine, latte"
          value={ingredient.allergens ?? ""}
          onChange={(event) =>
            updateIngredient({ allergens: event.target.value })
          }
        />
        <Input
          label="Kcal"
          type="number"
          min={0}
          value={ingredient.calories ?? ""}
          onChange={(event) =>
            updateIngredient({
              calories: parseNumber(event.target.value, null),
            })
          }
        />
        <Input
          label="Proteine"
          type="number"
          min={0}
          value={ingredient.proteins ?? ""}
          onChange={(event) =>
            updateIngredient({
              proteins: parseNumber(event.target.value, null),
            })
          }
        />
        <Input
          label="Carboidrati"
          type="number"
          min={0}
          value={ingredient.carbs ?? ""}
          onChange={(event) =>
            updateIngredient({ carbs: parseNumber(event.target.value, null) })
          }
        />
        <Input
          label="Grassi"
          type="number"
          min={0}
          value={ingredient.fats ?? ""}
          onChange={(event) =>
            updateIngredient({ fats: parseNumber(event.target.value, null) })
          }
        />
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
      variant: "success",
      title: mode === "edit" ? "Ricetta aggiornata" : "Ricetta creata",
      description: result.message,
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
      <div className="grid gap-(--spacing-4) lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Stack gap="4">
          <FormField label="Titolo ricetta" required>
            <FormControl>
              <Input
                value={input.title}
                placeholder="Ragu bianco di cortile"
                onChange={(event) => updateInput({ title: event.target.value })}
              />
            </FormControl>
          </FormField>

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
        </Stack>

        <Stack gap="4">
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
          <Input
            label="Preparazione min."
            type="number"
            min={0}
            value={input.prepTime ?? ""}
            onChange={(event) =>
              updateInput({ prepTime: parseNumber(event.target.value, null) })
            }
          />
          <Input
            label="Cottura min."
            type="number"
            min={0}
            value={input.cookTime ?? ""}
            onChange={(event) =>
              updateInput({ cookTime: parseNumber(event.target.value, null) })
            }
          />
          <Checkbox
            label="Pubblica in Esplora"
            description="Le ricette pubbliche possono essere consultate e copiate."
            checked={input.isPublic}
            onCheckedChange={(checked) => updateInput({ isPublic: checked })}
          />
        </Stack>
      </div>

      <Stack gap="4">
        <div className="flex items-center justify-between gap-(--spacing-3)">
          <div>
            <Text as="h3" size="lg" weight="semibold">
              Ingredienti
            </Text>
            <Text size="sm" tone="muted">
              Allergeni e valori nutrizionali restano collegati agli ingredienti.
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

      <FormActions align="end">
        <Button
          type="button"
          variant="ghost"
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
