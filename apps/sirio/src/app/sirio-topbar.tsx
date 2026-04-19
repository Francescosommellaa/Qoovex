"use client";

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
        <img
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
          <svg
            width="10"
            height="10"
            viewBox="0 0 256 256"
            aria-hidden="true"
            style={{ opacity: 0.5 }}
          >
            <path
              fill="currentColor"
              d="M224,104a8,8,0,0,1-16,0V59.32l-82.34,82.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"
            />
          </svg>
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
