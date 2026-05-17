"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "@phosphor-icons/react";
import {
  Button,
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
import { createMenuAction, updateMenuAction } from "@shared/actions/menu-actions";
import type {
  MenuBuilderInput,
  MenuBuilderItemInput,
  MenuDetailDto,
} from "@shared/lib/workspace-types";

interface RecipeOption {
  id: string;
  title: string;
}

interface MenuBuilderFormProps {
  mode: "create" | "edit";
  recipes: RecipeOption[];
  initialMenu?: MenuDetailDto;
}

function createEmptyItem(recipes: RecipeOption[]): MenuBuilderItemInput {
  return {
    recipeId: recipes[0]?.id ?? "",
    section: "",
  };
}

function getInitialInput(
  recipes: RecipeOption[],
  initialMenu?: MenuDetailDto,
): MenuBuilderInput {
  if (!initialMenu) {
    return {
      title: "",
      description: "",
      isPublic: false,
      items: [createEmptyItem(recipes)],
    };
  }

  return {
    title: initialMenu.title,
    description: initialMenu.description ?? "",
    isPublic: initialMenu.isPublic,
    items: initialMenu.items.map((item) => ({
      recipeId: item.recipeId,
      section: item.section ?? "",
    })),
  };
}

function MenuItemRow({
  item,
  index,
  recipes,
  canRemove,
  onChange,
  onRemove,
}: {
  item: MenuBuilderItemInput;
  index: number;
  recipes: RecipeOption[];
  canRemove: boolean;
  onChange: (index: number, item: MenuBuilderItemInput) => void;
  onRemove: (index: number) => void;
}) {
  const recipeOptions = React.useMemo(
    () => recipes.map((recipe) => ({ value: recipe.id, label: recipe.title })),
    [recipes],
  );

  function updateItem(patch: Partial<MenuBuilderItemInput>) {
    onChange(index, { ...item, ...patch });
  }

  return (
    <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3) md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-end">
      <Select
        label={`Ricetta ${index + 1}`}
        options={recipeOptions}
        value={item.recipeId}
        onChange={(value) => updateItem({ recipeId: value })}
        placeholder="Scegli ricetta"
      />
      <Input
        label="Sezione"
        value={item.section ?? ""}
        placeholder="Antipasti"
        onChange={(event) => updateItem({ section: event.target.value })}
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
  );
}

export function MenuBuilderForm({
  mode,
  recipes,
  initialMenu,
}: MenuBuilderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [input, setInput] = React.useState<MenuBuilderInput>(() =>
    getInitialInput(recipes, initialMenu),
  );
  const [saving, setSaving] = React.useState(false);

  function updateInput(patch: Partial<MenuBuilderInput>) {
    setInput((current) => ({ ...current, ...patch }));
  }

  function updateItem(index: number, item: MenuBuilderItemInput) {
    setInput((current) => ({
      ...current,
      items: current.items.map((currentItem, itemIndex) =>
        itemIndex === index ? item : currentItem,
      ),
    }));
  }

  function removeItem(index: number) {
    setInput((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result =
      mode === "edit" && initialMenu
        ? await updateMenuAction(initialMenu.id, input)
        : await createMenuAction(input);

    setSaving(false);

    if (!result.ok || !result.data) {
      toast({
        variant: "error",
        title: "Menu non salvato",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: mode === "edit" ? "Menu aggiornato" : "Menu creato",
      description: result.message,
    });
    router.push(`/menus/${result.data.id}`);
    router.refresh();
  }

  const noRecipes = recipes.length === 0;

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
          <Input
            label="Titolo menu"
            value={input.title}
            placeholder="Carta degustazione primavera"
            onChange={(event) => updateInput({ title: event.target.value })}
          />
          <Textarea
            label="Descrizione"
            value={input.description}
            placeholder="Note per sala, servizio e preview digitale"
            maxLength={220}
            showCount
            onChange={(event) =>
              updateInput({ description: event.target.value })
            }
          />
        </Stack>
        <Stack gap="4">
          <Checkbox
            label="Pubblica menu"
            description="Il menu sara consultabile nella sezione Esplora."
            checked={input.isPublic}
            onCheckedChange={(checked) => updateInput({ isPublic: checked })}
          />
          {noRecipes ? (
            <Text size="sm" tone="muted">
              Crea almeno una ricetta prima di comporre un menu.
            </Text>
          ) : null}
        </Stack>
      </div>

      <Stack gap="4">
        <div className="flex items-center justify-between gap-(--spacing-3)">
          <div>
            <Text as="h3" size="lg" weight="semibold">
              Composizione
            </Text>
            <Text size="sm" tone="muted">
              Ogni voce mantiene la ricetta di origine e ordine di servizio.
            </Text>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconLeft={<Plus size={14} />}
            disabled={noRecipes}
            onClick={() =>
              setInput((current) => ({
                ...current,
                items: [...current.items, createEmptyItem(recipes)],
              }))
            }
          >
            Voce menu
          </Button>
        </div>

        {input.items.map((item, index) => (
          <MenuItemRow
            key={index}
            item={item}
            index={index}
            recipes={recipes}
            canRemove={input.items.length > 1}
            onChange={updateItem}
            onRemove={removeItem}
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
          disabled={noRecipes}
        >
          {mode === "edit" ? "Aggiorna menu" : "Crea menu"}
        </Button>
      </FormActions>
    </Form>
  );
}
