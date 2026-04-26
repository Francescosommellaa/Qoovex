"use client";

import { useState } from "react";
import { Select, type SelectOption } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseRow as Row } from "./showcase-block";

const ALLERGENI: SelectOption[] = [
  { value: "glutine", label: "Glutine" },
  { value: "crostacei", label: "Crostacei" },
  { value: "uova", label: "Uova" },
  { value: "pesce", label: "Pesce" },
  { value: "arachidi", label: "Arachidi" },
  { value: "soia", label: "Soia" },
  { value: "latte", label: "Latte" },
  { value: "noci", label: "Frutta a guscio", disabled: true },
];

const PORTATE = [
  {
    label: "Primo",
    options: [
      { value: "pasta", label: "Pasta" },
      { value: "risotto", label: "Risotto" },
      { value: "zuppa", label: "Zuppa" },
    ],
  },
  {
    label: "Secondo",
    options: [
      { value: "carne", label: "Carne" },
      { value: "pesce-sec", label: "Pesce" },
      { value: "veg", label: "Vegetariano" },
    ],
  },
  {
    label: "Dolce",
    options: [
      { value: "torta", label: "Torta" },
      { value: "gelato", label: "Gelato" },
    ],
  },
];

export function SezioneSelect() {
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("glutine");

  return (
    <section id="select" className="sirio-section">
      <SectionHeader label="Select" id="select" />

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Sizes — sm / md / lg">
        <Select options={ALLERGENI} size="sm" placeholder="Small" label="Sm" />
        <Select options={ALLERGENI} size="md" placeholder="Medium" label="Md" />
        <Select options={ALLERGENI} size="lg" placeholder="Large" label="Lg" />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Controlled vs Uncontrolled">
        <Select
          options={ALLERGENI}
          label="Controllato"
          placeholder="Seleziona allergene..."
          value={v1}
          onChange={setV1}
        />
        <Select
          options={ALLERGENI}
          label="Valore iniziale"
          value={v2}
          onChange={setV2}
        />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Grouped options">
        <Select
          options={PORTATE}
          label="Portata"
          placeholder="Scegli portata..."
        />
        <Select
          options={PORTATE}
          label="Preselezionata"
          defaultValue="risotto"
        />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Stati — error / success">
        <Select
          options={ALLERGENI}
          label="Obbligatorio"
          status="error"
          helperText="Seleziona almeno un allergene"
          placeholder="Seleziona..."
        />
        <Select
          options={ALLERGENI}
          label="Validato"
          status="success"
          helperText="Allergene confermato"
          defaultValue="uova"
        />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Disabled">
        <Select
          options={ALLERGENI}
          label="Disabilitato vuoto"
          disabled
          placeholder="Non modificabile"
        />
        <Select
          options={ALLERGENI}
          label="Disabilitato con valore"
          disabled
          defaultValue="soia"
        />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Option disabilitata">
        <Select
          options={ALLERGENI}
          label="Con opzione disabilitata"
          placeholder="Frutta a guscio è disabilitata..."
        />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Multiselect">
        <Select
          multiple
          options={ALLERGENI}
          label="Allergeni (multiplo)"
          placeholder="Seleziona allergeni..."
        />
        <Select
          multiple
          options={ALLERGENI}
          label="Max 3 selezioni"
          placeholder="Fino a 3..."
          maxSelected={3}
          helperText="Puoi selezionare al massimo 3 allergeni"
        />
      </Row>

      <Row contentClassName="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-4" label="Multiselect con gruppi">
        <Select
          multiple
          options={PORTATE}
          label="Portate multiple"
          placeholder="Scegli più portate..."
          defaultValue={["pasta", "gelato"]}
        />
      </Row>
    </section>
  );
}
