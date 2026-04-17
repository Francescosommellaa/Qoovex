"use client";

import { useState } from "react";
import { SearchBar } from "@qoovex/ui";
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
          maxWidth: "560px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SezioneSearchBar() {
  const [value, setValue] = useState("");
  const [lastSearch, setLastSearch] = useState<string | null>(null);

  return (
    <section id="searchbar" className="sirio-section">
      <SectionHeader label="SearchBar" id="searchbar" />

      <Row label="Default">
        <SearchBar placeholder="Cerca ricette…" />
      </Row>

      <Row label="Controlled — digita per filtrare">
        <SearchBar
          value={value}
          onValueChange={setValue}
          onSearch={(q) => setLastSearch(q)}
          placeholder="Cerca nel menu…"
        />
        {lastSearch && (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              fontFamily: "monospace",
            }}
          >
            → onSearch: "{lastSearch}"
          </p>
        )}
        {value && (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              fontFamily: "monospace",
            }}
          >
            value: "{value}"
          </p>
        )}
      </Row>

      <Row label="Disabled">
        <SearchBar placeholder="Cerca…" disabled />
      </Row>

      <Row label="Con valore iniziale">
        <SearchBar defaultValue="risotto" />
      </Row>
    </section>
  );
}
