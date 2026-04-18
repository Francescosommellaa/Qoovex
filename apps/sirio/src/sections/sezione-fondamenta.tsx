import { SECTIONS, SectionHeader } from "../app/sirio-content";

export function SezioneFondamenta() {
  return (
    <section id="fondamenta" className="sirio-section">
      <SectionHeader label="Fondamenta" id="fondamenta" />
      <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-muted)", lineHeight: 1.75, maxWidth: "60ch", marginBottom: "var(--space-8)" }}>
        Sirio è il design system di Qoovex — uno strumento vivo che cresce in parallelo al prodotto. Ogni token e componente appare qui solo quando esiste nel codice reale.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
        {[
          { label: "Dark mode", value: "Default", note: "color-scheme: dark" },
          { label: "Font display", value: "Chillax", note: "Fontshare" },
          { label: "Font body", value: "Satoshi", note: "Fontshare" },
          { label: "Primario", value: "Corallo Tartare", note: "#FF6B6B" },
          { label: "Base spacing", value: "4px", note: "Sistema modulare" },
          { label: "Stack", value: "Next.js 15", note: "Tailwind v4 + OKLCH" },
        ].map((item) => (
          <div key={item.label} style={{ padding: "var(--space-4)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: "var(--space-2)" }}>{item.label}</div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>{item.value}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-faint)", fontFamily: "monospace" }}>{item.note}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "var(--space-5)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: "var(--space-4)" }}>In questa pagina</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "var(--space-2)" }}>
          {SECTIONS.slice(1).map((s) => (
            <a key={s.id} href={`#${s.id}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)", background: "var(--color-surface-2)", transition: "color var(--transition-fast), border-color var(--transition-fast)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text)"; e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.16)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
            >
              <span style={{ fontSize: "0.6rem", fontFamily: "monospace", opacity: 0.35 }}>{s.icon}</span>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
