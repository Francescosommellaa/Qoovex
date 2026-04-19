"use client";

import { SECTIONS, type SectionId } from "./sirio-content";

interface SirioSidebarProps {
  active: SectionId;
}

export function SirioSidebar({ active }: SirioSidebarProps) {
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
