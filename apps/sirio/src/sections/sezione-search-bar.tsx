"use client";

import { useState } from "react";
import { SearchBar } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseRow as Row } from "./showcase-block";

export function SezioneSearchBar() {
  const [value, setValue] = useState("");
  const [lastSearch, setLastSearch] = useState<string | null>(null);

  return (
    <section id="searchbar" className="sirio-section">
      <SectionHeader label="SearchBar" id="searchbar" />

      <Row contentClassName="flex max-w-[560px] flex-col gap-4" label="Default">
        <SearchBar placeholder="Cerca ricette…" />
      </Row>

      <Row contentClassName="flex max-w-[560px] flex-col gap-4" label="Controlled — digita per filtrare">
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
            {`→ onSearch: "${lastSearch}"`}
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
            {`value: "${value}"`}
          </p>
        )}
      </Row>

      <Row contentClassName="flex max-w-[560px] flex-col gap-4" label="Disabled">
        <SearchBar placeholder="Cerca…" disabled />
      </Row>

      <Row contentClassName="flex max-w-[560px] flex-col gap-4" label="Con valore iniziale">
        <SearchBar defaultValue="risotto" />
      </Row>
    </section>
  );
}
