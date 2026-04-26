"use client";

import { useState } from "react";
import { Button, Textarea } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseRow as Row } from "./showcase-block";

export function SezioneTextarea() {
  const [feedback, setFeedback] = useState("");
  const minChars = 20;
  const canSubmit = feedback.trim().length >= minChars;

  return (
    <section id="textarea" className="sirio-section">
      <SectionHeader label="Textarea" id="textarea" />

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="Variant - auto">
        <Textarea
          label="Note ricetta"
          placeholder="Aggiungi note di preparazione..."
          variant="auto"
          maxRows={8}
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="Variant - fixed">
        <Textarea
          label="Descrizione menu"
          placeholder="Descrivi il menu..."
          variant="fixed"
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="Variant - static">
        <Textarea
          label="Istruzioni brevi"
          placeholder="Max 3 righe visibili..."
          variant="static"
          rows={3}
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="Con contatore caratteri">
        <Textarea
          label="Bio chef"
          placeholder="Racconta la tua storia..."
          variant="auto"
          maxLength={300}
          showCount
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="Status - error">
        <Textarea
          label="Ingredienti"
          status="error"
          showCount
          maxLength={500}
          helperText="Digita almeno 10 caratteri."
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="Status - success">
        <Textarea
          label="Procedimento"
          status="success"
          defaultValue="Portare l'acqua a ebollizione, salare e cuocere la pasta al dente."
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label="State - disabled">
        <Textarea
          label="Campo bloccato"
          defaultValue="Valore non modificabile."
          disabled
        />
      </Row>

      <Row contentClassName="flex max-w-[400px] flex-col gap-4" label={`Live - min ${minChars} caratteri per inviare`}>
        <Textarea
          label="Feedback"
          placeholder={`Scrivi almeno ${minChars} caratteri...`}
          variant="auto"
          showCount
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          status={
            feedback.length === 0 ? "default" : canSubmit ? "success" : "error"
          }
          helperText={
            feedback.length > 0 && !canSubmit
              ? `Digita almeno ${minChars} caratteri.`
              : undefined
          }
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button disabled={!canSubmit}>Invia</Button>
        </div>
      </Row>
    </section>
  );
}
