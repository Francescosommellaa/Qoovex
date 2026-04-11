import { SectionHeader } from "../app/page";

const SPACING_TOKENS = [
  { token: "--space-1", px: 4, rem: "0.25rem" },
  { token: "--space-2", px: 8, rem: "0.5rem" },
  { token: "--space-3", px: 12, rem: "0.75rem" },
  { token: "--space-4", px: 16, rem: "1rem" },
  { token: "--space-5", px: 20, rem: "1.25rem" },
  { token: "--space-6", px: 24, rem: "1.5rem" },
  { token: "--space-8", px: 32, rem: "2rem" },
  { token: "--space-10", px: 40, rem: "2.5rem" },
  { token: "--space-12", px: 48, rem: "3rem" },
  { token: "--space-16", px: 64, rem: "4rem" },
  { token: "--space-20", px: 80, rem: "5rem" },
  { token: "--space-24", px: 96, rem: "6rem" },
  { token: "--space-32", px: 128, rem: "8rem" },
] as const;

const MAX_PX = 128;

const USAGE_MAP: Record<string, string> = {
  "--space-1": "icon gap, badge padding",
  "--space-2": "chip padding, tight inline gap",
  "--space-3": "input padding inline, small gap",
  "--space-4": "button padding, card gap",
  "--space-5": "form field gap",
  "--space-6": "card padding",
  "--space-8": "section interna, sidebar padding",
  "--space-10": "card large padding",
  "--space-12": "sezione content",
  "--space-16": "sezione principale",
  "--space-20": "hero gap",
  "--space-24": "sezione hero",
  "--space-32": "layout macro",
};

export function SezioneSpacing() {
  return (
    <section id="spacing" className="sirio-section">
      <SectionHeader label="Spacing" id="spacing" />
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          lineHeight: 1.7,
          maxWidth: "58ch",
          marginBottom: "var(--space-8)",
        }}
      >
        Sistema basato su unità di{" "}
        <strong style={{ color: "var(--color-text)" }}>4px</strong>. Ogni
        margine, padding e gap deve usare un token — nessun valore arbitrario.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        {SPACING_TOKENS.map((s) => {
          const barWidth = Math.max(4, (s.px / MAX_PX) * 100);
          return (
            <div
              key={s.token}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr 80px",
                alignItems: "center",
                gap: "var(--space-4)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Token name */}
              <div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    color: "var(--color-primary)",
                  }}
                >
                  {s.token}
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "var(--color-text-faint)",
                    marginTop: "2px",
                  }}
                >
                  {s.rem} · {s.px}px
                </div>
              </div>
              {/* Barra visiva */}
              <div
                style={{
                  height: "6px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-surface-offset)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-primary)",
                    opacity: 0.7,
                  }}
                />
              </div>
              {/* Uso */}
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-faint)",
                  lineHeight: 1.4,
                  textAlign: "right",
                }}
              >
                {USAGE_MAP[s.token]}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
