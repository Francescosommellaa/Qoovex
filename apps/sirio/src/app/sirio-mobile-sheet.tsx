"use client";

import { useEffect } from "react";
import { SECTIONS, type SectionId } from "./sirio-content";

interface SirioMobileSheetProps {
  open: boolean;
  onClose: () => void;
  active: SectionId;
}

export function SirioMobileSheet({
  open,
  onClose,
  active,
}: SirioMobileSheetProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi menu sezioni"
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
          maxHeight: "90%",
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
                    textDecoration: "none",
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
