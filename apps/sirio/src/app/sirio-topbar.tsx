"use client";

import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";

interface SirioTopbarProps {
  onMenuOpen: () => void;
}

export function SirioTopbar({ onMenuOpen }: SirioTopbarProps) {
  return (
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
      {/* LEFT */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
      >
        <Image
          src="/logo-icon/sirio-icon-white.svg"
          alt="Sirio"
          width={16}
          height={16}
          style={{ display: "block", flexShrink: 0 }}
        />
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
          aria-hidden="true"
          style={{
            display: "block",
            width: "1px",
            height: "16px",
            background: "var(--color-border)",
            flexShrink: 0,
          }}
        />

        <a
          href="https://qoovex.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-sm)",
            letterSpacing: "-0.01em",
            color: "var(--color-text-muted)",
            transition: "color var(--transition-fast)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
          aria-label="Vai al sito Qoovex"
        >
          Qoovex
          <ArrowUpRight size={10} aria-hidden="true" style={{ opacity: 0.5 }} />
        </a>
      </div>

      {/* RIGHT */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
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
          onClick={onMenuOpen}
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
  );
}
