"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Plus } from "@phosphor-icons/react";
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
import {
  addWorkPlanMemberAction,
  completeWorkTaskAction,
  createWorkPlanAction,
  createWorkTaskAction,
} from "@shared/actions/work-plan-actions";
import type {
  WorkPlanInput,
  WorkTaskDto,
  WorkTaskInput,
} from "@shared/lib/workspace-types";

interface RecipeOption {
  id: string;
  title: string;
}

export function CreateWorkPlanForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [input, setInput] = React.useState<WorkPlanInput>({
    title: "",
    description: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result = await createWorkPlanAction(input);
    setSaving(false);

    if (!result.ok || !result.data) {
      toast({
        variant: "error",
        title: "Piano non creato",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: "Piano creato",
      description: result.message,
    });
    router.push(`/work-plans/${result.data.id}`);
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
        label="Titolo piano"
        value={input.title}
        placeholder="Preparazioni servizio sera"
        onChange={(event) =>
          setInput((current) => ({ ...current, title: event.target.value }))
        }
      />
      <Textarea
        label="Descrizione"
        value={input.description}
        placeholder="Obiettivo, reparto e note operative"
        maxLength={220}
        showCount
        onChange={(event) =>
          setInput((current) => ({
            ...current,
            description: event.target.value,
          }))
        }
      />
      <FormActions align="end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          loadingLabel="Creazione..."
        >
          Crea piano
        </Button>
      </FormActions>
    </Form>
  );
}

export function AddMemberForm({
  workPlanId,
  disabled,
}: {
  workPlanId: string;
  disabled: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result = await addWorkPlanMemberAction(workPlanId, identifier);
    setSaving(false);

    if (!result.ok) {
      toast({
        variant: "error",
        title: "Membro non aggiunto",
        description: result.message,
      });
      return;
    }

    setIdentifier("");
    toast({
      variant: "success",
      title: "Membro aggiunto",
      description: result.message,
    });
    router.refresh();
  }

  return (
    <Form
      variant="plain"
      layout="stack"
      density="compact"
      labelStyle="soft"
      noValidate
      onSubmit={handleSubmit}
    >
      <Input
        label="Email o username"
        value={identifier}
        placeholder="chef@ristorante.it"
        disabled={disabled}
        onChange={(event) => setIdentifier(event.target.value)}
      />
      <FormActions align="end">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={disabled}
          loading={saving}
          loadingLabel="Aggiunta..."
        >
          Aggiungi
        </Button>
      </FormActions>
    </Form>
  );
}

export function CreateWorkTaskForm({
  workPlanId,
  recipes,
  disabled,
}: {
  workPlanId: string;
  recipes: RecipeOption[];
  disabled: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [input, setInput] = React.useState<WorkTaskInput>({
    title: "",
    description: "",
    recipeId: "",
  });
  const [saving, setSaving] = React.useState(false);

  const recipeOptions = React.useMemo(
    () => [
      { value: "", label: "Task libero" },
      ...recipes.map((recipe) => ({ value: recipe.id, label: recipe.title })),
    ],
    [recipes],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result = await createWorkTaskAction(workPlanId, input);
    setSaving(false);

    if (!result.ok) {
      toast({
        variant: "error",
        title: "Task non creato",
        description: result.message,
      });
      return;
    }

    setInput({ title: "", description: "", recipeId: "" });
    toast({
      variant: "success",
      title: "Task creato",
      description: result.message,
    });
    router.refresh();
  }

  return (
    <Form
      variant="plain"
      layout="stack"
      density="compact"
      labelStyle="soft"
      noValidate
      onSubmit={handleSubmit}
    >
      <Stack gap="3">
        <Input
          label="Titolo task"
          value={input.title}
          placeholder="Preparare fondo vegetale"
          disabled={disabled}
          onChange={(event) =>
            setInput((current) => ({ ...current, title: event.target.value }))
          }
        />
        <Textarea
          label="Note"
          value={input.description}
          placeholder="Quantita, reparto, servizio"
          disabled={disabled}
          maxRows={4}
          onChange={(event) =>
            setInput((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
        <Select
          label="Ricetta collegata"
          value={input.recipeId ?? ""}
          options={recipeOptions}
          disabled={disabled}
          onChange={(value) =>
            setInput((current) => ({ ...current, recipeId: value }))
          }
        />
      </Stack>
      <FormActions align="end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          iconLeft={<Plus size={14} />}
          disabled={disabled}
          loading={saving}
          loadingLabel="Creazione..."
        >
          Crea task
        </Button>
      </FormActions>
    </Form>
  );
}

export function WorkTaskToggle({
  workPlanId,
  task,
}: {
  workPlanId: string;
  task: WorkTaskDto;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [checked, setChecked] = React.useState(Boolean(task.completedAt));
  const [updating, setUpdating] = React.useState(false);

  async function handleCheckedChange(nextChecked: boolean) {
    setChecked(nextChecked);
    setUpdating(true);

    const result = await completeWorkTaskAction(workPlanId, task.id);
    setUpdating(false);

    if (!result.ok) {
      setChecked(Boolean(task.completedAt));
      toast({
        variant: "error",
        title: "Task non aggiornato",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: nextChecked ? "Task completato" : "Task riaperto",
      description: result.message,
    });
    router.refresh();
  }

  return (
    <div className="grid gap-(--spacing-2) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) py-(--spacing-3)">
      <Checkbox
        label={task.title}
        description={task.description ?? undefined}
        checked={checked}
        disabled={updating}
        onCheckedChange={handleCheckedChange}
      />
      {task.recipeId ? (
        <Text size="xs" tone="muted">
          Snapshot ricetta salvato alla creazione
        </Text>
      ) : null}
      {task.completedAt ? (
        <span className="inline-flex items-center gap-(--spacing-1) text-(length:--text-xs) text-(--color-success)">
          <CheckCircle size={12} aria-hidden="true" />
          Completato
        </span>
      ) : null}
    </div>
  );
}
