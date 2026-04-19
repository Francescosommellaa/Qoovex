"use client";

import { useState } from "react";
import {
  EnvelopeSimple,
  Lock,
  MagnifyingGlass,
  User,
} from "@phosphor-icons/react";
import { Input } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

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

export function SezioneInput() {
  const [emailValue, setEmailValue] = useState("");

  const emailStatus =
    emailValue.length === 0
      ? "default"
      : emailValue.includes("@")
        ? "success"
        : "error";

  return (
    <section id="input" className="sirio-section">
      <SectionHeader label="Input" id="input" />

      <Row label="Default">
        <Input label="Nome chef" placeholder="Mario Rossi" />
        <Input label="Senza label" placeholder="Placeholder visibile" />
      </Row>

      <Row label="Sizes">
        <Input size="sm" label="Small" placeholder="Piccolo" />
        <Input size="md" label="Medium" placeholder="Medio (default)" />
        <Input size="lg" label="Large" placeholder="Grande" />
      </Row>

      <Row label="Icon leading">
        <Input
          label="Email"
          placeholder="chef@ristorante.it"
          iconLeading={<EnvelopeSimple size={16} />}
        />
        <Input
          label="Username"
          placeholder="chef_mario"
          iconLeading={<User size={16} />}
        />
        <Input
          label="Cerca"
          placeholder="Cerca ricette..."
          iconLeading={<MagnifyingGlass size={16} />}
        />
      </Row>

      <Row label="Icon trailing">
        <Input
          label="Password"
          type="password"
          placeholder="........"
          iconLeading={<Lock size={16} />}
          showPasswordToggle
          showStrength
        />
      </Row>

      <Row label="Helper text">
        <Input
          label="Username"
          placeholder="chef_mario"
          helperText="Sara visibile pubblicamente nella sezione Esplora."
        />
      </Row>

      <Row label="Status - error">
        <Input
          label="Email"
          placeholder="chef@ristorante.it"
          status="error"
          helperText="Formato email non valido."
          defaultValue="non-una-email"
          iconLeading={<EnvelopeSimple size={16} />}
        />
      </Row>

      <Row label="Status - success">
        <Input
          label="Username"
          placeholder="chef_mario"
          status="success"
          helperText="Username disponibile."
          defaultValue="chef_mario_bianchi"
          iconLeading={<User size={16} />}
        />
      </Row>

      <Row label="State - disabled">
        <Input
          label="Piano attivo"
          value="Pro"
          disabled
          helperText="Non modificabile da qui."
        />
      </Row>

      <Row label="Live - validazione email">
        <Input
          label="Email"
          placeholder="chef@ristorante.it"
          iconLeading={<EnvelopeSimple size={16} />}
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
          status={emailStatus}
          helperText={
            emailStatus === "error"
              ? "Inserisci un'email valida."
              : emailStatus === "success"
                ? "Email valida."
                : undefined
          }
        />
      </Row>
    </section>
  );
}
