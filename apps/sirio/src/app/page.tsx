"use client";

import { useState, useEffect } from "react";
import {
  ComingSoon,
  SECTIONS,
  SectionHeader,
  type SectionId,
} from "./sirio-content";
import { SirioTopbar } from "./sirio-topbar";
import { SirioSidebar } from "./sirio-sidebar";
import { SirioMobileSheet } from "./sirio-mobile-sheet";
import { SezioneFondamenta } from "../sections/sezione-fondamenta";
import { SezioneColori } from "../sections/sezione-colori";
import { SezioneTipografia } from "../sections/sezione-tipografia";
import { SezioneSpacing } from "../sections/sezione-spacing";
import { SezioneRadius } from "../sections/sezione-radius";
import { SezioneShadows } from "../sections/sezione-shadows";
import { SezioneAnimazioni } from "../sections/sezione-animazioni";
import { SezioneZindex } from "../sections/sezione-zindex";
import { SezioneButton } from "../sections/sezione-button";
import { SezioneInput } from "../sections/sezione-input";
import { SezioneTextarea } from "@/sections/sezione-textarea";
import { SezioneSmartSearchBar } from "@/sections/sezione-smart-search-bar";
import { SezioneSearchBar } from "@/sections/sezione-search-bar";
import { SezioneSelect } from "@/sections/sezione-select";

export default function SirioPage() {
  const [active, setActive] = useState<SectionId>("fondamenta");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(s.id as SectionId);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <SirioTopbar onMenuOpen={() => setSheetOpen(true)} />

      <div className="sirio-layout">
        <SirioSidebar active={active} />
        <main className="sirio-main">
          <div style={{ marginBottom: "var(--space-16)" }}>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                overflowX: "hidden",
                padding: "var(--space-8) var(--space-8) var(--space-32)",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "var(--text-2xl)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: "var(--color-text)",
                }}
              >
                Sirio
              </h1>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-faint)",
                  fontFamily: "monospace",
                  marginBottom: "4px",
                }}
              >
                α Canis Majoris — la stella più luminosa del cielo notturno
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-muted)",
                lineHeight: 1.75,
                maxWidth: "56ch",
                marginBottom: "var(--space-5)",
              }}
            >
              Il design system ufficiale di Qoovex. Token, componenti e pattern
              — costruiti in parallelo al prodotto, aggiornati ad ogni release.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              {[
                "Dark mode default",
                "Mobile first",
                "Tailwind v4",
                "Next.js 15",
                "Satoshi + Chillax",
                "Ink Slate",
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    color: "var(--color-text-faint)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <SezioneFondamenta />
          <SezioneColori />
          <SezioneTipografia />
          <SezioneSpacing />
          <SezioneRadius />
          <SezioneShadows />
          <SezioneAnimazioni />
          <SezioneZindex />
          <SezioneButton />
          <SezioneInput />
          <SezioneTextarea />
          <SezioneSmartSearchBar />
          <SezioneSearchBar />
          <SezioneSelect />

          {(["card", "badge", "form"] as const).map((id) => {
            const s = SECTIONS.find((x) => x.id === id)!;
            return (
              <section key={id} id={id} className="sirio-section">
                <SectionHeader label={s.label} id={id} />
                <ComingSoon label={s.label} />
              </section>
            );
          })}
        </main>
      </div>

      <SirioMobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        active={active}
      />
    </>
  );
}
