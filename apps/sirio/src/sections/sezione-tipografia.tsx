import { SectionHeader } from "../app/sirio-content";

const TYPE_SCALE = [
  {
    token: "--text-2xl",
    size: "clamp(2rem → 3.5rem)",
    weight: 700,
    font: "display",
    sample: "Mise en place",
  },
  {
    token: "--text-xl",
    size: "clamp(1.5rem → 2.25rem)",
    weight: 600,
    font: "display",
    sample: "Ricetta del giorno",
  },
  {
    token: "--text-lg",
    size: "clamp(1.125rem → 1.5rem)",
    weight: 500,
    font: "body",
    sample: "Ingredienti principali",
  },
  {
    token: "--text-base",
    size: "clamp(1rem → 1.125rem)",
    weight: 400,
    font: "body",
    sample:
      "Unire la farina con il burro a temperatura ambiente e lavorare fino ad ottenere un composto omogeneo.",
  },
  {
    token: "--text-sm",
    size: "clamp(0.875rem → 1rem)",
    weight: 400,
    font: "body",
    sample: "Aggiungi alla lista della spesa",
  },
  {
    token: "--text-xs",
    size: "clamp(0.75rem → 0.875rem)",
    weight: 500,
    font: "body",
    sample: "ALLERGENI · GLUTINE · LATTOSIO",
  },
] as const;

export function SezioneTipografia() {
  return (
    <section id="tipografia" className="sirio-section">
      <SectionHeader label="Tipografia" id="tipografia" />

      {/* Font families */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
          marginBottom: "var(--space-10)",
        }}
      >
        <div
          style={{
            padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-faint)",
              marginBottom: "var(--space-3)",
            }}
          >
            Display
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: "var(--space-2)",
              lineHeight: 1.1,
            }}
          >
            Chillax
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              fontFamily: "monospace",
              color: "var(--color-text-faint)",
            }}
          >
            --font-display · Fontshare
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-3)",
              letterSpacing: "-0.01em",
            }}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz
            <br />
            0123456789 !@#$%
          </div>
        </div>
        <div
          style={{
            padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-faint)",
              marginBottom: "var(--space-3)",
            }}
          >
            Body
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-2)",
              lineHeight: 1.1,
            }}
          >
            Satoshi
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              fontFamily: "monospace",
              color: "var(--color-text-faint)",
            }}
          >
            --font-body · Fontshare
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-3)",
            }}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz
            <br />
            0123456789 !@#$%
          </div>
        </div>
      </div>

      {/* Type scale */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        {TYPE_SCALE.map((step, i) => (
          <div
            key={step.token}
            style={{
              padding: "var(--space-5) var(--space-5)",
              background:
                i % 2 === 0 ? "var(--color-surface)" : "var(--color-surface-2)",
              display: "flex",
              alignItems: "baseline",
              gap: "var(--space-6)",
              flexWrap: "wrap",
            }}
          >
            {/* Token info */}
            <div style={{ minWidth: "160px", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "var(--color-primary)",
                  marginBottom: "2px",
                }}
              >
                {step.token}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-faint)",
                  fontFamily: "monospace",
                }}
              >
                {step.size}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-faint)",
                  marginTop: "2px",
                }}
              >
                {step.font === "display" ? "Chillax" : "Satoshi"} · w
                {step.weight}
              </div>
            </div>
            {/* Sample testo */}
            <div
              style={{
                fontFamily:
                  step.font === "display"
                    ? "var(--font-display)"
                    : "var(--font-body)",
                fontSize: `var(${step.token})`,
                fontWeight: step.weight,
                color: "var(--color-text)",
                letterSpacing: step.font === "display" ? "-0.02em" : "normal",
                lineHeight: 1.2,
                flex: 1,
              }}
            >
              {step.sample}
            </div>
          </div>
        ))}
      </div>

      {/* Regole */}
      <div
        style={{
          marginTop: "var(--space-6)",
          padding: "var(--space-5)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-faint)",
          }}
        >
          Regole
        </div>
        {[
          "Chillax (display) — solo da --text-xl in su (titoli, hero, headline)",
          "Satoshi (body) — tutto il resto: body, label, button, caption",
          "Floor minimo: 12px — nessun testo va sotto --text-xs",
          "Web app: massimo --text-xl — niente --text-2xl in pagine interne",
        ].map((r) => (
          <div
            key={r}
            style={{
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "var(--color-primary)",
                fontSize: "0.65rem",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              ◈
            </span>
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              {r}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
