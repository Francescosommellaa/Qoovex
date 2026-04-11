import { SiriaSidebar } from "./sirio-sidebar";

const sections = [
  { id: "fondamenta", label: "Fondamenta" },
  { id: "colori", label: "Colori" },
  { id: "tipografia", label: "Tipografia" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Corner Radius" },
  { id: "shadows", label: "Shadows" },
  { id: "animazioni", label: "Animazioni" },
  { id: "pulsanti", label: "Button" },
  { id: "input", label: "Input" },
  { id: "textarea", label: "Textarea" },
  { id: "searchbar", label: "SearchBar" },
  { id: "card", label: "Card" },
  { id: "badge", label: "Badge" },
  { id: "form", label: "Form" },
];

export default function SirioHome() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#0a0a0a",
        color: "#ededed",
      }}
    >
      {/* TOP HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "0 1rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
              fill="#ededed"
              opacity="0.9"
            />
          </svg>
          <span
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontWeight: 600,
              fontSize: "1.05rem",
              letterSpacing: "-0.01em",
              color: "#ededed",
            }}
          >
            Sirio
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "rgba(237,237,237,0.4)",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              paddingTop: "2px",
            }}
          >
            Qoovex Design System
          </span>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            color: "rgba(237,237,237,0.3)",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          v0.1
        </span>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR — client component per i mouse events */}
        <SiriaSidebar />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "2rem 1rem",
            maxWidth: "860px",
          }}
        >
          {/* HERO */}
          <section style={{ marginBottom: "4rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
                  fill="#ededed"
                />
              </svg>
              <h1
                style={{
                  fontFamily: "'Chillax', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2rem, 6vw, 3.5rem)",
                  letterSpacing: "-0.03em",
                  color: "#ededed",
                  lineHeight: 1,
                }}
              >
                Sirio
              </h1>
            </div>
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                color: "rgba(237,237,237,0.5)",
                maxWidth: "52ch",
                lineHeight: 1.65,
                marginBottom: "1.5rem",
              }}
            >
              Il design system ufficiale di Qoovex. Qui vivono i token, i
              componenti e i pattern che definiscono l&apos;identit&agrave; visiva del
              prodotto. Viene costruito in modo incrementale: ogni componente
              che creiamo finisce qui prima di entrare in produzione.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Dark mode", "Mobile first", "Tailwind v4", "Next.js 15", "Satoshi + Chillax"].map(
                (tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.25rem 0.625rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "rgba(237,237,237,0.5)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </section>

          {/* FONDAMENTA */}
          <section
            id="fondamenta"
            style={{ marginBottom: "3rem" }}
            className="sirio-mobile-index"
          >
            <SectionHeader label="Fondamenta" />
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(237,237,237,0.45)",
                lineHeight: 1.65,
                maxWidth: "60ch",
                marginBottom: "1.5rem",
              }}
            >
              Sirio &egrave; un documento vivo. Ogni sezione compare quando il
              componente o il token corrispondente viene creato nel monorepo.
              Nessuna documentazione senza implementazione reale.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "rgba(237,237,237,0.55)",
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ opacity: 0.4 }}>✦</span>
                  {s.label}
                </a>
              ))}
            </div>
          </section>

          {/* SEZIONI PLACEHOLDER */}
          {sections.slice(1).map((s) => (
            <section key={s.id} id={s.id} style={{ marginBottom: "3rem" }}>
              <SectionHeader label={s.label} />
              <ComingSoon />
            </section>
          ))}
        </main>
      </div>

      {/* BOTTOM NAV MOBILE */}
      <nav
        aria-label="Navigazione rapida"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 50,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "0.5rem 1rem",
          overflowX: "auto",
          display: "flex",
          gap: "0.25rem",
          scrollbarWidth: "none",
        }}
        className="sirio-bottom-nav"
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              flexShrink: 0,
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(237,237,237,0.5)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .sirio-sidebar { display: block !important; }
          .sirio-bottom-nav { display: none !important; }
          .sirio-mobile-index { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        marginBottom: "1.25rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span style={{ color: "rgba(237,237,237,0.2)", fontSize: "0.8rem", fontFamily: "monospace" }}>
        ✦
      </span>
      <h2
        style={{
          fontFamily: "'Chillax', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(1.125rem, 3vw, 1.375rem)",
          letterSpacing: "-0.02em",
          color: "#ededed",
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function ComingSoon() {
  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: "10px",
        border: "1px dashed rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.015)",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
      }}
    >
      <span style={{ opacity: 0.25, fontSize: "0.75rem" }}>○</span>
      <span style={{ fontSize: "0.8rem", color: "rgba(237,237,237,0.25)", fontStyle: "italic" }}>
        Questa sezione verr&agrave; popolata nella prossima fase.
      </span>
    </div>
  );
}
