"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle,
  ChefHat,
  ClockCountdown,
  Funnel,
  Tag,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Form,
  FormActions,
  FormContent,
  FormControl,
  FormDescription,
  FormField,
  FormHeader,
  FormSection,
  FormSectionHeader,
  FormTitle,
  Input,
  Select,
  Textarea,
} from "@qoovex/ui";
import type { SelectOption } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseBlock } from "./showcase-block";

const COURSE_OPTIONS: SelectOption[] = [
  { value: "antipasto", label: "Antipasto" },
  { value: "primo", label: "Primo" },
  { value: "secondo", label: "Secondo" },
  { value: "dolce", label: "Dolce" },
];

const STATION_OPTIONS: SelectOption[] = [
  { value: "linea-fredda", label: "Linea fredda" },
  { value: "linea-calda", label: "Linea calda" },
  { value: "pasticceria", label: "Pasticceria" },
  { value: "sala", label: "Sala" },
];

const ALLERGEN_OPTIONS: SelectOption[] = [
  { value: "glutine", label: "Glutine" },
  { value: "latte", label: "Latte" },
  { value: "uova", label: "Uova" },
  { value: "pesce", label: "Pesce" },
  { value: "frutta-guscio", label: "Frutta a guscio" },
];

function RecipeFormDemo() {
  const [recipeName, setRecipeName] = useState("Cacio e pepe");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <Form
      variant="panel"
      tone="primary"
      layout="stack"
      onSubmit={handleSubmit}
    >
      <FormHeader>
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-(--form-accent-border) bg-(--form-accent-soft) text-(--form-accent)">
            <ChefHat size={16} aria-hidden="true" />
          </span>
          <div>
            <FormTitle>Nuova ricetta</FormTitle>
            <FormDescription>
              Composizione completa con campi, sezioni e azioni finali.
            </FormDescription>
          </div>
        </div>
      </FormHeader>

      <FormSection tone="primary">
        <FormSectionHeader>
          <p className="sirio-token-label">dati principali</p>
          <FormDescription>
            Le sezioni raggruppano campi correlati senza introdurre logica di
            prodotto.
          </FormDescription>
        </FormSectionHeader>

        <FormContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Nome ricetta"
            required
            helperText="Nome visibile nel workspace."
          >
            <FormControl>
              <Input
                value={recipeName}
                onChange={(event) => setRecipeName(event.target.value)}
                placeholder="Es. Cacio e pepe"
              />
            </FormControl>
          </FormField>

          <FormField label="Portata" required>
            <FormControl>
              <Select options={COURSE_OPTIONS} defaultValue="primo" />
            </FormControl>
          </FormField>

          <FormField label="Postazione">
            <FormControl>
              <Select options={STATION_OPTIONS} placeholder="Scegli postazione" />
            </FormControl>
          </FormField>

          <FormField label="Tempo stimato" helperText="Formato libero.">
            <FormControl>
              <Input
                iconLeading={<ClockCountdown size={16} aria-hidden="true" />}
                placeholder="18 min"
              />
            </FormControl>
          </FormField>

          <FormField
            className="md:col-span-2"
            label="Descrizione"
            helperText="Testo breve per riconoscere la preparazione."
          >
            <FormControl>
              <Textarea
                variant="auto"
                maxRows={5}
                placeholder="Pecorino, pepe tostato e acqua di cottura..."
              />
            </FormControl>
          </FormField>
        </FormContent>
      </FormSection>

      <FormActions align="between">
        <Button type="button" size="sm" variant="ghost">
          Salva bozza
        </Button>
        <Button type="submit" size="sm">
          Crea ricetta
        </Button>
      </FormActions>
    </Form>
  );
}

function FieldStatesDemo() {
  return (
    <Form variant="surface" density="compact">
      <FormHeader>
        <FormTitle>Stati e accessibilita</FormTitle>
        <FormDescription>
          `FormField` collega label, helper, errori e stato del controllo.
        </FormDescription>
      </FormHeader>

      <FormField
        label="Slug menu"
        required
        status="error"
        error="Questo slug e` gia` in uso."
      >
        <FormControl>
          <Input defaultValue="menu-serale" />
        </FormControl>
      </FormField>

      <FormField
        label="Codice interno"
        status="success"
        successText="Codice disponibile."
      >
        <FormControl>
          <Input defaultValue="REC-204" iconLeading={<Tag size={16} />} />
        </FormControl>
      </FormField>

      <FormField label="Piano" disabled helperText="Gestito dalla subscription.">
        <FormControl>
          <Input defaultValue="Pro" />
        </FormControl>
      </FormField>
    </Form>
  );
}

function InlineFilterDemo() {
  return (
    <Form variant="surface" layout="inline" density="compact" tone="warning">
      <FormHeader>
        <FormTitle>Filtri compatti</FormTitle>
        <FormDescription>
          Layout inline per toolbar, ricerca locale e filtri rapidi.
        </FormDescription>
      </FormHeader>

      <FormField label="Portata">
        <FormControl>
          <Select options={COURSE_OPTIONS} size="sm" placeholder="Tutte" />
        </FormControl>
      </FormField>

      <FormField label="Allergeni">
        <FormControl>
          <Select
            multiple
            options={ALLERGEN_OPTIONS}
            size="sm"
            placeholder="Filtra"
            maxSelected={3}
            showSelectedCount={false}
          />
        </FormControl>
      </FormField>

      <FormActions align="start">
        <Button
          size="sm"
          variant="secondary"
          iconLeft={<Funnel size={14} aria-hidden="true" />}
        >
          Applica
        </Button>
      </FormActions>
    </Form>
  );
}

function ModularFormDemo() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Form variant="ghost" density="compact">
        <FormField label="Solo campo" helperText="Nessun header, nessuna section, nessuna action.">
          <FormControl>
            <Input placeholder="Campo indipendente" />
          </FormControl>
        </FormField>
      </Form>

      <Form variant="surface" density="compact" layout="grid">
        <FormHeader>
          <FormTitle>Solo header e campi</FormTitle>
          <FormDescription>
            Le actions non sono obbligatorie: le aggiungi solo quando servono.
          </FormDescription>
        </FormHeader>

        <FormField label="Portata">
          <FormControl>
            <Select options={COURSE_OPTIONS} placeholder="Scegli" />
          </FormControl>
        </FormField>

        <FormField label="Allergeni">
          <FormControl>
            <Select
              multiple
              options={ALLERGEN_OPTIONS}
              placeholder="Seleziona"
              maxSelected={3}
              showSelectedCount={false}
            />
          </FormControl>
        </FormField>
      </Form>
    </div>
  );
}

function CompositionPreview() {
  return (
    <Card variant="surface" tone="success">
      <CardBody className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-(--card-accent-border) bg-(--card-accent-soft) text-(--card-accent)">
            <CheckCircle size={16} weight="bold" aria-hidden="true" />
          </span>
          <div>
            <p className="sirio-token-label">modulare</p>
            <h3 className="font-display text-(length:--text-lg) font-semibold text-text">
              Scegli tu gli slot
            </h3>
            <p className="sirio-preview-text">
              `Form` non forza header, sezioni, field wrapper o actions. Puoi
              comporre solo i pezzi necessari al contesto.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">header opzionale</Badge>
          <Badge tone="primary">sections opzionali</Badge>
          <Badge tone="warning">actions opzionali</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

export function SezioneForm() {
  return (
    <section id="form" className="sirio-section">
      <SectionHeader label="Form" id="form" />

      <ShowcaseBlock
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        label="Composizione completa"
        description="Form fornisce struttura, sezioni, azioni e field wrapper; i controlli restano quelli canonici del design system."
      >
        <RecipeFormDemo />
        <FieldStatesDemo />
      </ShowcaseBlock>

      <ShowcaseBlock
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        label="Layout"
        description="Stack, grid e inline coprono pagine, modal, toolbar e pannelli operativi. Dropdown e popover non vengono tagliati dal contenitore."
      >
        <InlineFilterDemo />
        <CompositionPreview />
      </ShowcaseBlock>

      <ShowcaseBlock
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        label="Modularita"
        description="Ogni slot e` opzionale: puoi usare solo campi, aggiungere header, sezioni o actions in base al caso."
      >
        <ModularFormDemo />
      </ShowcaseBlock>
    </section>
  );
}

