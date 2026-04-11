"use client";

import { useState, useEffect } from "react";

// ─── Struttura sezioni ───────────────────────────────────────────
const SECTIONS = [
  {
    id: "fondamenta",
    label: "Fondamenta",
    icon: "◈",
    description: "Il punto di partenza",
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
  {
    id: "spacing",
    label: "Spacing",
    icon: "⊞",
    description: "Sistema 4px",
  },
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
  {
    id: "button",
    label: "Button",
    icon: "▷",
    description: "Varianti e stati",
  },
  {
    id: "input",
    label: "Input",
    icon: "▭",
    description: "Text, label, stati",
  },
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
  {
    id: "badge",
    label: "Badge",
    icon: "◦",
    description: "Status e label",
  },
  {
    id: "form",
    label: "Form",
    icon: "⊟",
    description: "Composizione completa",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ─── Componenti UI interni ───────────────────────────────────────

function SectionHeader({ label, id }: { label: string; id: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
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

function ComingSoon({ label }: { label: string }) {
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
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "0.75rem", opacity: 0.3 }}>◌</span>
      </div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-faint)",
          fontStyle: "italic",
        }}
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

// ─── Sidebar ────────────────────────────────────────────────────

function Sidebar({ activeSection }: { activeSection: SectionId }) {
  return (
    <aside
      style={{
        width: "224px",
        flexShrink: 0,
        borderRight: "1px solid var(--color-border)",
        position: "sticky",
        top: "52px",
        height: "calc(100dvh - 52px)",
        overflowY: "auto",
        padding: "var(--space-6) 0",
        scrollbarWidth: "none",
      }}
    >
      {/* Label */}
      <div
        style={{
          padding: "0 var(--space-4)",
          marginBottom: "var(--space-3)",
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
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
            const isActive = activeSection === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-2) var(--space-3)",
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
                    textDecoration: "none",
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
                        height: "16px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-primary)",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      opacity: isActive ? 0.7 : 0.3,
                      fontFamily: "monospace",
                      minWidth: "14px",
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

      {/* Footer sidebar */}
      <div
        style={{
          padding: "var(--space-6) var(--space-4) 0",
          marginTop: "var(--space-6)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--color-text-faint)",
            lineHeight: 1.6,
          }}
        >
          Sirio cresce in parallelo al design system. Nessuna sezione appare
          prima che il codice esista.
        </p>
      </div>
    </aside>
  );
}

// ─── Bottom Sheet Mobile ─────────────────────────────────────────

function MobileNav({
  isOpen,
  onClose,
  activeSection,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: SectionId;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: "var(--z-modal)" as string,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity var(--transition-slow)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: "var(--z-modal)" as string,
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
          padding:
            "var(--space-2) 0 calc(var(--space-6) + env(safe-area-inset-bottom))",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform var(--transition-slow)",
          maxHeight: "75dvh",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: "36px",
            height: "4px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-border)",
            margin: "var(--space-2) auto var(--space-5)",
          }}
        />
        {/* Label */}
        <div
          style={{
            padding: "0 var(--space-5)",
            marginBottom: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-faint)",
            }}
          >
            Naviga Sirio
          </span>
        </div>
        {/* Links */}
        <nav>
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
              const isActive = activeSection === s.id;
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
                      textDecoration: "none",
                      background: isActive
                        ? "var(--color-surface-offset)"
                        : "transparent",
                      transition: "background var(--transition-fast)",
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
                          fontSize: "0.7rem",
                          fontFamily: "monospace",
                          opacity: 0.4,
                          minWidth: "14px",
                          textAlign: "center",
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
                            fontSize: "0.7rem",
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
        </nav>
      </div>
    </>
  );
}

// ─── Sezione: Fondamenta ─────────────────────────────────────────

function SezioneFondamenta() {
  return (
    <section id="fondamenta" style={{ marginBottom: "var(--space-16)" }}>
      <SectionHeader label="Fondamenta" id="fondamenta" />

      <p
        style={{
          fontSize: "var(--text-base)",
          color: "var(--color-text-muted)",
          lineHeight: 1.75,
          marginBottom: "var(--space-8)",
          maxWidth: "60ch",
        }}
      >
        Sirio è il design system di Qoovex — uno strumento vivo che cresce in
        parallelo al prodotto. Ogni token, componente e pattern appare qui solo
        quando esiste nel codice reale. Nessuna documentazione teorica.
      </p>

      {/* Info cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-3)",
          marginBottom: "var(--space-8)",
        }}
      >
        {[
          { label: "Dark mode", value: "Default", note: "color-scheme: dark" },
          { label: "Font display", value: "Chillax", note: "Fontshare" },
          { label: "Font body", value: "Satoshi", note: "Fontshare" },
          { label: "Primario", value: "Corallo Tartare", note: "#FF6B6B" },
          { label: "Base spacing", value: "4px", note: "Sistema 4px" },
          { label: "Stack", value: "Next.js 15", note: "Tailwind v4" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-faint)",
                marginBottom: "var(--space-2)",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: "2px",
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-faint)",
                fontFamily: "monospace",
              }}
            >
              {item.note}
            </div>
          </div>
        ))}
      </div>

      {/* Indice sezioni */}
      <div
        style={{
          padding: "var(--space-5)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-faint)",
            marginBottom: "var(--space-4)",
          }}
        >
          In questa pagina
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "var(--space-2)",
          }}
        >
          {SECTIONS.slice(1).map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                background: "var(--color-surface-2)",
                transition:
                  "color var(--transition-fast), border-color var(--transition-fast)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "monospace",
                  opacity: 0.4,
                }}
              >
                {s.icon}
              </span>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page principale ─────────────────────────────────────────────

export default function SirioPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("fondamenta");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // IntersectionObserver per aggiornare la sezione attiva
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(s.id as SectionId);
          }
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Blocca scroll body quando bottom-sheet è aperto
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <>
      {/* ── HEADER ─────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: "var(--z-sticky)" as string,
          height: "52px",
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(10, 10, 10, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-4)",
          gap: "var(--space-4)",
        }}
      >
        {/* Logo + nome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          {/* Stella Sirio */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 1L14.39 8.26L22 10L14.39 11.74L12 19L9.61 11.74L2 10L9.61 8.26L12 1Z"
              fill="var(--color-primary)"
            />
            <path
              d="M19 2L19.9 4.6L22.5 5.5L19.9 6.4L19 9L18.1 6.4L15.5 5.5L18.1 4.6L19 2Z"
              fill="var(--color-text-faint)"
            />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "-0.01em",
              color: "var(--color-text)",
            }}
          >
            Sirio
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--color-text-faint)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "none",
            }}
            className="sirio-tagline"
          >
            Qoovex Design System
          </span>
        </div>

        {/* Destra: versione + burger mobile */}
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
              color: "var(--color-text-faint)",
              fontFamily: "monospace",
              letterSpacing: "0.06em",
            }}
          >
            v0.1
          </span>

          {/* Burger — solo mobile */}
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Apri menu sezioni"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "transparent",
              cursor: "pointer",
              transition: "background var(--transition-fast)",
            }}
            className="sirio-burger"
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

      {/* ── LAYOUT ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          minHeight: "calc(100dvh - 52px)",
        }}
      >
        {/* Sidebar — solo desktop */}
        <div className="sirio-sidebar-wrapper">
          <Sidebar activeSection={activeSection} />
        </div>

        {/* Main */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "var(--space-8) var(--space-5)",
            maxWidth: "800px",
          }}
        >
          {/* ── HERO ─────────────────────────── */}
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
                  color: "var(--color-text)",
                  lineHeight: 1,
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
                marginBottom: "var(--space-6)",
              }}
            >
              Il design system ufficiale di Qoovex. Colori, tipografia,
              componenti, token e pattern — tutto in un posto solo. Costruito
              mentre il prodotto cresce, aggiornato ad ogni componente nuovo.
            </p>

            {/* Tag */}
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
                    fontSize: "0.7rem",
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

          {/* ── SEZIONI ──────────────────────── */}
          <SezioneFondamenta />

          {/* Le sezioni seguenti verranno popolate fase per fase */}
          {SECTIONS.slice(1).map((s) => (
            <section
              key={s.id}
              id={s.id}
              style={{ marginBottom: "var(--space-16)" }}
            >
              <SectionHeader label={s.label} id={s.id} />
              <ComingSoon label={s.label} />
            </section>
          ))}
        </main>
      </div>

      {/* ── MOBILE BOTTOM SHEET ────────────────────── */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activeSection={activeSection}
      />
    </>
  );
}
