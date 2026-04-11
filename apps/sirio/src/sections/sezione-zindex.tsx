import { SectionHeader } from "../app/sirio-content";

const Z_TOKENS = [
  {
    token: "--z-base",
    value: 0,
    label: "Base",
    usage: "Contenuto statico normale",
  },
  {
    token: "--z-raised",
    value: 10,
    label: "Raised",
    usage: "Card hover, elemento sollevato",
  },
  {
    token: "--z-dropdown",
    value: 100,
    label: "Dropdown",
    usage: "Menu, select, autocomplete",
  },
  {
    token: "--z-sticky",
    value: 200,
    label: "Sticky",
    usage: "Header sticky, sidebar sticky",
  },
  {
    token: "--z-modal",
    value: 300,
    label: "Modal",
    usage: "Dialog, bottom sheet, backdrop",
  },
  {
    token: "--z-toast",
    value: 400,
    label: "Toast",
    usage: "Notifiche, snackbar",
  },
  {
    token: "--z-overlay",
    value: 500,
    label: "Overlay",
    usage: "Command palette, fullscreen overlay",
  },
] as const;

export function SezioneZindex() {
  return (
    <section id="zindex" className="sirio-section">
      <SectionHeader label="Z-index" id="zindex" />
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          lineHeight: 1.7,
          maxWidth: "58ch",
          marginBottom: "var(--space-8)",
        }}
      >
        Lo stack di layer di Qoovex. Usa sempre il token — mai valori numerici
        hardcoded nel codice.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        {[...Z_TOKENS].reverse().map((z, i) => {
          const opacity =
            0.3 + ((Z_TOKENS.length - 1 - i) / (Z_TOKENS.length - 1)) * 0.7;
          return (
            <div
              key={z.token}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 150px 1fr auto",
                alignItems: "center",
                gap: "var(--space-4)",
                padding: "var(--space-3) var(--space-5)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderLeft: `3px solid oklch(0.68 0.18 22 / ${opacity})`,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  textAlign: "center",
                }}
              >
                {z.value}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "var(--color-text-faint)",
                }}
              >
                {z.token}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    marginRight: "var(--space-3)",
                  }}
                >
                  {z.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--color-text-muted)",
                  textAlign: "right",
                }}
              >
                {z.usage}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
