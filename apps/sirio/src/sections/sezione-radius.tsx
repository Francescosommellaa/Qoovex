import { SectionHeader } from "../app/sirio-content";

const RADIUS_TOKENS = [
  {
    token: "--radius-sm",
    value: "4px",
    rem: "0.25rem",
    usage: "Input, badge, tag piccolo",
  },
  {
    token: "--radius-md",
    value: "8px",
    rem: "0.5rem",
    usage: "Button, dropdown item",
  },
  {
    token: "--radius-lg",
    value: "12px",
    rem: "0.75rem",
    usage: "Card, modal, panel",
  },
  {
    token: "--radius-xl",
    value: "16px",
    rem: "1rem",
    usage: "Card large, bottom sheet",
  },
  {
    token: "--radius-2xl",
    value: "24px",
    rem: "1.5rem",
    usage: "Bottom sheet top corners",
  },
  {
    token: "--radius-full",
    value: "9999px",
    rem: "9999px",
    usage: "Pill badge, avatar, toggle",
  },
] as const;

export function SezioneRadius() {
  return (
    <section id="radius" className="sirio-section">
      <SectionHeader label="Corner Radius" id="radius" />
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          lineHeight: 1.7,
          maxWidth: "58ch",
          marginBottom: "var(--space-8)",
        }}
      >
        Ogni elemento usa un radius coerente col suo scopo. Mai valori hardcoded
        — usa sempre il token.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {RADIUS_TOKENS.map((r) => (
          <div
            key={r.token}
            style={{
              padding: "var(--space-5)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                height: "64px",
                background: "var(--color-surface-offset)",
                border: "1px solid var(--color-border)",
                borderRadius:
                  r.token === "--radius-full"
                    ? "var(--radius-full)"
                    : `var(${r.token})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "var(--color-text-faint)",
                }}
              >
                {r.value}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "var(--color-primary)",
                  marginBottom: "4px",
                }}
              >
                {r.token}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-faint)",
                  fontFamily: "monospace",
                  marginBottom: "6px",
                }}
              >
                {r.rem}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {r.usage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
