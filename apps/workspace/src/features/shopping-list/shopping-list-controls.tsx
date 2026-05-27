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
  useToast,
} from "@qoovex/ui";
import {
  createShoppingListAction,
  createShoppingListFromSourceAction,
  toggleShoppingListItemAction,
} from "@shared/actions/shopping-list-actions";
import type {
  ShoppingListInput,
  ShoppingListItemDto,
  ShoppingListItemInput,
  ShoppingListSourceKind,
} from "@shared/lib/workspace-types";

interface SourceOption {
  id: string;
  title: string;
}

function createEmptyItem(): ShoppingListItemInput {
  return { name: "", quantity: 1, unit: "g" };
}

function parseQuantity(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ShoppingListItemRow({
  item,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  item: ShoppingListItemInput;
  index: number;
  canRemove: boolean;
  onChange: (index: number, item: ShoppingListItemInput) => void;
  onRemove: (index: number) => void;
}) {
  function updateItem(patch: Partial<ShoppingListItemInput>) {
    onChange(index, { ...item, ...patch });
  }

  return (
    <div className="grid gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3) md:grid-cols-[minmax(0,1fr)_7rem_7rem_auto] md:items-end">
      <Input
        label={`Voce ${index + 1}`}
        value={item.name}
        placeholder="Pomodori ramati"
        onChange={(event) => updateItem({ name: event.target.value })}
      />
      <Input
        label="Quantita"
        type="number"
        min={0}
        step="0.01"
        value={item.quantity}
        onChange={(event) =>
          updateItem({ quantity: parseQuantity(event.target.value) })
        }
      />
      <Input
        label="Unita"
        value={item.unit}
        placeholder="kg"
        onChange={(event) => updateItem({ unit: event.target.value })}
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

export function CreateShoppingListForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [input, setInput] = React.useState<ShoppingListInput>({
    title: "",
    items: [createEmptyItem()],
  });

  function updateItem(index: number, item: ShoppingListItemInput) {
    setInput((current) => ({
      ...current,
      items: current.items.map((currentItem, itemIndex) =>
        itemIndex === index ? item : currentItem,
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result = await createShoppingListAction(input);
    setSaving(false);

    if (!result.ok || !result.data) {
      toast({
        variant: "error",
        title: "Lista non creata",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: "Lista creata",
      description: result.message,
    });
    router.push(`/shopping-list/${result.data.id}`);
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
      <Input
        label="Titolo lista"
        value={input.title}
        placeholder="Spesa servizio venerdi"
        onChange={(event) =>
          setInput((current) => ({ ...current, title: event.target.value }))
        }
      />

      <Stack gap="3">
        {input.items.map((item, index) => (
          <ShoppingListItemRow
            key={index}
            item={item}
            index={index}
            canRemove={input.items.length > 1}
            onChange={updateItem}
            onRemove={(itemIndex) =>
              setInput((current) => ({
                ...current,
                items: current.items.filter((_, index) => index !== itemIndex),
              }))
            }
          />
        ))}
      </Stack>

      <FormActions align="between">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconLeft={<Plus size={14} />}
          onClick={() =>
            setInput((current) => ({
              ...current,
              items: [...current.items, createEmptyItem()],
            }))
          }
        >
          Voce
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          loadingLabel="Creazione..."
        >
          Crea lista
        </Button>
      </FormActions>
    </Form>
  );
}

export function SourceShoppingListForm({
  recipes,
  menus,
}: {
  recipes: SourceOption[];
  menus: SourceOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [sourceKind, setSourceKind] =
    React.useState<ShoppingListSourceKind>("recipe");
  const sourceOptions = sourceKind === "recipe" ? recipes : menus;
  const [sourceId, setSourceId] = React.useState(sourceOptions[0]?.id ?? "");
  const [saving, setSaving] = React.useState(false);
  const selectedSourceId = sourceOptions.some((source) => source.id === sourceId)
    ? sourceId
    : sourceOptions[0]?.id ?? "";

  function handleSourceKindChange(value: string) {
    const nextSourceKind = value as ShoppingListSourceKind;
    const nextSourceOptions = nextSourceKind === "recipe" ? recipes : menus;

    setSourceKind(nextSourceKind);
    setSourceId(nextSourceOptions[0]?.id ?? "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result = await createShoppingListFromSourceAction(
      sourceKind,
      selectedSourceId,
    );
    setSaving(false);

    if (!result.ok || !result.data) {
      toast({
        variant: "error",
        title: "Lista non generata",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: "Lista generata",
      description: result.message,
    });
    router.push(`/shopping-list/${result.data.id}`);
    router.refresh();
  }

  const noSources = sourceOptions.length === 0;

  return (
    <Form
      variant="plain"
      layout="stack"
      density="comfortable"
      labelStyle="soft"
      noValidate
      onSubmit={handleSubmit}
    >
      <Select
        label="Origine"
        value={sourceKind}
        options={[
          { value: "recipe", label: "Ricetta" },
          { value: "menu", label: "Menu" },
        ]}
        onChange={handleSourceKindChange}
      />
      <Select
        label="Elemento"
        value={selectedSourceId}
        placeholder="Seleziona origine"
        options={sourceOptions.map((source) => ({
          value: source.id,
          label: source.title,
        }))}
        disabled={noSources}
        onChange={setSourceId}
      />
      {noSources ? (
        <Text size="sm" tone="muted">
          Non ci sono elementi disponibili per questa origine.
        </Text>
      ) : null}
      <FormActions align="end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          loadingLabel="Generazione..."
          disabled={noSources}
        >
          Genera lista
        </Button>
      </FormActions>
    </Form>
  );
}

export function ShoppingListItemToggle({ item }: { item: ShoppingListItemDto }) {
  const { toast } = useToast();
  const router = useRouter();
  const [checked, setChecked] = React.useState(item.checked);
  const [updating, setUpdating] = React.useState(false);

  async function handleCheckedChange(nextChecked: boolean) {
    setChecked(nextChecked);
    setUpdating(true);

    const result = await toggleShoppingListItemAction(item.id, nextChecked);
    setUpdating(false);

    if (!result.ok) {
      setChecked(item.checked);
      toast({
        variant: "error",
        title: "Voce non aggiornata",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: nextChecked ? "Voce completata" : "Voce riaperta",
      description: result.message,
    });
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) py-(--spacing-3)">
      <Checkbox
        label={item.name}
        description={`${item.quantity} ${item.unit}`}
        checked={checked}
        disabled={updating}
        onCheckedChange={handleCheckedChange}
      />
      <Text size="xs" tone="muted">
        {checked ? "Completata" : "Da acquistare"}
      </Text>
    </div>
  );
}
