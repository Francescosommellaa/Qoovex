"use client";

import { useState } from "react";
import { Button, Textarea } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

// ─── Helper ──────────────────────────────────────────────────────

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "var(--space-8)" }}>
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-faint)",
          marginBottom: "var(--space-3)",
          fontFamily: "monospace",
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          maxWidth: "400px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Sezione ─────────────────────────────────────────────────────

export function SezioneTextarea() {
  const [feedback, setFeedback] = useState("");
  const MIN_CHARS = 20;
  const canSubmit = feedback.trim().length >= MIN_CHARS;

  return (
    <section id="textarea" className="sirio-section">
      <SectionHeader label="Textarea" id="textarea" />

      {/* Varianti */}
      <Row label="Variant — auto (cresce con il contenuto)">
        <Textarea
          label="Note ricetta"
          placeholder="Aggiungi note di preparazione…"
          variant="auto"
          maxRows={8}
        />
      </Row>

      <Row label="Variant — fixed (resize manuale)">
        <Textarea
          label="Descrizione menu"
          placeholder="Descrivi il menu…"
          variant="fixed"
        />
      </Row>

      <Row label="Variant — static (altezza bloccata)">
        <Textarea
          label="Istruzioni brevi"
          placeholder="Max 3 righe visibili…"
          variant="static"
          rows={3}
        />
      </Row>

      {/* Contatore */}
      <Row label="Con contatore caratteri">
        <Textarea
          label="Bio chef"
          placeholder="Racconta la tua storia…"
          variant="auto"
          maxLength={300}
          showCount
        />
      </Row>

      {/* Status */}
      <Row label="Status — error">
        <Textarea
          label="Ingredienti"
          status="error"
          showCount
          maxLength={500}
          helperText="Digita almeno 10 caratteri."
        />
      </Row>

      <Row label="Status — success">
        <Textarea
          label="Procedimento"
          status="success"
          defaultValue="Portare l'acqua a ebollizione, salare e cuocere la pasta al dente."
        />
      </Row>

      {/* Disabled */}
      <Row label="State — disabled">
        <Textarea
          label="Campo bloccato"
          defaultValue="Valore non modificabile."
          disabled
        />
      </Row>

      {/* Esempio live: minChars per abilitare invio */}
      <Row label={`Live — min ${MIN_CHARS} caratteri per inviare`}>
        <Textarea
          label="Feedback"
          placeholder={`Scrivi almeno ${MIN_CHARS} caratteri…`}
          variant="auto"
          showCount
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          status={
            feedback.length === 0 ? "default" : canSubmit ? "success" : "error"
          }
          helperText={
            feedback.length > 0 && !canSubmit
              ? `Digita almeno ${MIN_CHARS} caratteri.`
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
