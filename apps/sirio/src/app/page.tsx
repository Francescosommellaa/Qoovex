"use client";

import { useState, useEffect } from "react";
import {
  ComingSoon,
  SECTIONS,
  SectionHeader,
  type SectionId,
} from "./sirio-content";
import { SezioneFondamenta } from "../sections/sezione-fondamenta";
import { SezioneColori } from "../sections/sezione-colori";
import { SezioneTipografia } from "../sections/sezione-tipografia";
import { SezioneSpacing } from "../sections/sezione-spacing";
import { SezioneRadius } from "../sections/sezione-radius";
import { SezioneShadows } from "../sections/sezione-shadows";
import { SezioneAnimazioni } from "../sections/sezione-animazioni";
import { SezioneZindex } from "../sections/sezione-zindex";
import { SezioneButton } from "../sections/sezione-button";

const SECTIONS_LOCAL = [
  {
    id: "fondamenta",
    label: "Fondamenta",
    icon: "◈",
    description: "Principi e stack",
  },
  {
    id: "colori",
    label: "Colori",
    icon: "◉",
    description: "Palette e token semantici",
  },
  {
    id: "tipografia",
    label: "Tipografia",
    icon: "T",
    description: "Satoshi + Chillax, type scale",
  },
  { id: "spacing", label: "Spacing", icon: "⊞", description: "Sistema 4px" },
  {
    id: "radius",
    label: "Corner Radius",
    icon: "◻",
    description: "Da sm a full",
  },
  {
    id: "shadows",
    label: "Shadows",
    icon: "◫",
    description: "Elevazione e profondità",
  },
  {
    id: "animazioni",
    label: "Animazioni",
    icon: "◎",
    description: "Easing, durate, transizioni",
  },
  { id: "zindex", label: "Z-index", icon: "⊕", description: "Layer stack" },
  { id: "button", label: "Button", icon: "▷", description: "Varianti e stati" },
  { id: "input", label: "Input", icon: "▭", description: "Text, label, stati" },
  {
    id: "textarea",
    label: "Textarea",
    icon: "▬",
    description: "Multiline input",
  },
  {
    id: "searchbar",
    label: "SearchBar",
    icon: "⊙",
    description: "Ricerca globale",
  },
  {
    id: "card",
    label: "Card",
    icon: "▪",
    description: "Flat, elevated, interactive",
  },
  { id: "badge", label: "Badge", icon: "◦", description: "Status e label" },
  {
    id: "form",
    label: "Form",
    icon: "⊟",
    description: "Composizione completa",
  },
] as const;

type SectionIdLocal = (typeof SECTIONS_LOCAL)[number]["id"];

// ─── Componenti condivisi Sirio ──────────────────────────────────

function SectionHeaderLocal({ label, id }: { label: string; id: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        marginBottom: "var(--space-6)",
        paddingBottom: "var(--space-4)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          color: "var(--color-text-faint)",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
      >
        #{id}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "var(--text-lg)",
          letterSpacing: "-0.02em",
          color: "var(--color-text)",
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function ComingSoonLocal({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "var(--space-8) var(--space-6)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--color-border)",
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "1.25rem", opacity: 0.2 }}>◌</span>
      <p
        style={{ fontSize: "var(--text-sm)", color: "var(--color-text-faint)" }}
      >
        <strong
          style={{ fontStyle: "normal", color: "var(--color-text-muted)" }}
        >
          {label}
        </strong>{" "}
        verrà popolato nella prossima fase.
      </p>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────

function Sidebar({ active }: { active: SectionId }) {
  return (
    <aside
      className="sirio-sidebar"
      style={{
        width: "220px",
        flexShrink: 0,
        borderRight: "1px solid var(--color-border)",
        position: "sticky",
        top: "52px",
        height: "calc(100dvh - 52px)",
        overflowY: "auto",
        padding: "var(--space-5) 0",
        scrollbarWidth: "none",
      }}
    >
      <div
        style={{ padding: "0 var(--space-4)", marginBottom: "var(--space-3)" }}
      >
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-faint)",
          }}
        >
          Contenuti
        </span>
      </div>
      <nav aria-label="Sezioni design system">
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            padding: "0 var(--space-3)",
          }}
        >
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "6px var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-sm)",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                    background: isActive
                      ? "var(--color-surface-offset)"
                      : "transparent",
                    transition:
                      "color var(--transition-fast), background var(--transition-fast)",
                    position: "relative",
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "2px",
                        height: "14px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-primary)",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontFamily: "monospace",
                      opacity: isActive ? 0.6 : 0.25,
                      minWidth: "12px",
                      textAlign: "center",
                    }}
                  >
                    {s.icon}
                  </span>
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div
        style={{
          padding: "var(--space-5) var(--space-4) 0",
          marginTop: "var(--space-5)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <p
          style={{
            fontSize: "0.65rem",
            color: "var(--color-text-faint)",
            lineHeight: 1.6,
          }}
        >
          Sirio cresce in parallelo al prodotto. Ogni sezione appare quando il
          codice esiste.
        </p>
      </div>
    </aside>
  );
}

// ─── Bottom Sheet Mobile ─────────────────────────────────────────

function MobileSheet({
  open,
  onClose,
  active,
}: {
  open: boolean;
  onClose: () => void;
  active: SectionId;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "oklch(0 0 0 / 0.65)",
          zIndex: 300,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity var(--transition-slow)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 301,
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
          padding: `var(--space-2) 0 calc(var(--space-6) + env(safe-area-inset-bottom))`,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform var(--transition-slow)",
          maxHeight: "75dvh",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "4px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-border)",
            margin: "var(--space-2) auto var(--space-4)",
          }}
        />
        <div
          style={{
            padding: "0 var(--space-5)",
            marginBottom: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-faint)",
            }}
          >
            Naviga Sirio
          </span>
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: "0 var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
          }}
        >
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    background: isActive
                      ? "var(--color-surface-offset)"
                      : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontFamily: "monospace",
                        opacity: 0.35,
                        minWidth: "12px",
                      }}
                    >
                      {s.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? "var(--color-text)"
                            : "var(--color-text-muted)",
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--color-text-faint)",
                          marginTop: "1px",
                        }}
                      >
                        {s.description}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-primary)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────

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
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          height: "52px",
          borderBottom: "1px solid var(--color-border)",
          background: "oklch(0.10 0 0 / 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-4)",
          gap: "var(--space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 1L14.39 8.26L22 10L14.39 11.74L12 19L9.61 11.74L2 10L9.61 8.26L12 1Z"
              fill="var(--color-primary)"
            />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "-0.01em",
            }}
          >
            Sirio
          </span>
          <span
            className="sirio-header-tagline"
            style={{
              display: "none",
              fontSize: "0.6rem",
              color: "var(--color-text-faint)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Qoovex Design System
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              fontFamily: "monospace",
              color: "var(--color-text-faint)",
              letterSpacing: "0.06em",
            }}
          >
            v0.2
          </span>
          <button
            className="sirio-burger"
            onClick={() => setSheetOpen(true)}
            aria-label="Apri menu sezioni"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span
              style={{
                display: "block",
                width: "16px",
                height: "1.5px",
                background: "var(--color-text-muted)",
                borderRadius: "var(--radius-full)",
              }}
            />
            <span
              style={{
                display: "block",
                width: "11px",
                height: "1.5px",
                background: "var(--color-text-muted)",
                borderRadius: "var(--radius-full)",
              }}
            />
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="sirio-layout">
        <Sidebar active={active} />
        <main className="sirio-main" style={{ maxWidth: "820px" }}>
          {/* HERO */}
          <div style={{ marginBottom: "var(--space-16)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "var(--space-4)",
                marginBottom: "var(--space-4)",
                flexWrap: "wrap",
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
                "Corallo Tartare",
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

          {/* SEZIONI */}
          <SezioneFondamenta />
          <SezioneColori />
          <SezioneTipografia />
          <SezioneSpacing />
          <SezioneRadius />
          <SezioneShadows />
          <SezioneAnimazioni />
          <SezioneZindex />
          <SezioneButton />

          {/* Sezioni componenti — coming soon */}
          {(
            ["input", "textarea", "searchbar", "card", "badge", "form"] as const
          ).map((id) => {
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

      <MobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        active={active}
      />
    </>
  );
}
