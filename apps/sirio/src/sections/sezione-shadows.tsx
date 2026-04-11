import { SectionHeader } from "../app/page";

const SHADOW_TOKENS = [
  {
    token: "--shadow-sm",
    label: "Small",
    description: "Separazione leggera — input, tag, elementi flat",
    css: "0 1px 2px oklch(0 0 0 / 0.40)",
  },
  {
    token: "--shadow-md",
    label: "Medium",
    description: "Card standard, dropdown, tooltip",
    css: "0 1px 2px oklch(0 0 0 / 0.30), 0 4px 12px oklch(0 0 0 / 0.50)",
  },
  {
    token: "--shadow-lg",
    label: "Large",
    description: "Modal, bottom sheet, panel floating",
    css: "0 1px 3px oklch(0 0 0 / 0.30), 0 8px 24px oklch(0 0 0 / 0.55), 0 20px 48px oklch(0 0 0 / 0.35)",
  },
] as const;

export function SezioneShadows() {
  return (
    <section id="shadows" className="sirio-section">
      <SectionHeader label="Shadows" id="shadows" />
      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.7, maxWidth: "58ch", marginBottom: "var(--space-8)" }}>
        Le ombre sono tono-matched alla dark palette — usano opacità nera pura su OKLCH. Indicano elevazione, non decorazione.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-6)" }}>
        {SHADOW_TOKENS.map((s) => (
          <div
            key={s.token}
            style={{
              padding: "var(--space-8) var(--space-6)",
              borderRadius: "var(--radius-xl)",
              background: "var(--color-surface)",
              boxShadow: `var(${s.token})`,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              transition: "transform var(--transition-base)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
          >
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "var(--color-primary)", marginBottom: "var(--space-2)" }}>{s.token}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{s.description}</div>
            </div>
            <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <code style={{ fontSize: "0.6rem", fontFamily: "monospace", color: "var(--color-text-faint)", lineHeight: 1.6, wordBreak: "break-all" }}>
                {s.css}
              </code>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}