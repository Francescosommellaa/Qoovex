"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Trash } from "@phosphor-icons/react";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  EmptyState,
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
      items: recipes.length > 0 ? [createEmptyItem(recipes)] : [],
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
        <div>
          <Text as="h3" size="lg" weight="semibold">
            Composizione
          </Text>
          <Text size="sm" tone="muted">
            Aggiungi le ricette nell&apos;ordine in cui verranno servite.
          </Text>
        </div>

        {noRecipes ? (
          <EmptyState
            icon={
              <BookOpen
                size={28}
                className="text-(--color-text-muted)"
                aria-hidden
              />
            }
            title="Ti serve almeno una ricetta"
            description="Esplora le ricette disponibili oppure creane una nuova per iniziare a comporre il menu."
            action={
              <div className="flex flex-wrap justify-center gap-(--spacing-2)">
                <Button as="a" href="/explore" variant="secondary" size="md">
                  Esplora ricette
                </Button>
                <Button as="a" href="/recipes/new" variant="primary" size="md">
                  Crea nuova ricetta
                </Button>
              </div>
            }
          />
        ) : (
          <>
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
            <Button
              type="button"
              variant="secondary"
              size="md"
              iconLeft={<Plus size={16} />}
              className="qv-motion-interactive w-full justify-center border-dashed"
              onClick={() =>
                setInput((current) => ({
                  ...current,
                  items: [...current.items, createEmptyItem(recipes)],
                }))
              }
            >
              Aggiungi ricetta
            </Button>
          </>
        )}
      </Stack>

      <Card variant="panel" padding="md">
        <CardBody>
          <div className="flex flex-col gap-(--spacing-4) sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Text as="h3" size="lg" weight="semibold">
                Visibilità
              </Text>
              <Text size="sm" tone="muted">
                Scegli se mostrare il menu nella sezione Esplora.
              </Text>
            </div>
            <Checkbox
              label="Menu pubblico"
              description={
                input.isPublic
                  ? "Sarà visibile in Esplora dopo il salvataggio."
                  : "Rimarrà visibile solo nel tuo workspace."
              }
              checked={input.isPublic}
              onCheckedChange={(checked) => updateInput({ isPublic: checked })}
            />
          </div>
        </CardBody>
      </Card>

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
