import { QoovexMark } from "@qoovex/brand/qoovex-mark";

export default function RootPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3f6f4", color: "#182024", fontFamily: "system-ui, sans-serif" }}>
      <section style={{ width: "min(680px, 100%)", borderTop: "8px solid #99500e", paddingTop: 32 }}>
        <QoovexMark width={48} height={48} />
        <p style={{ marginTop: 40, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>Qoovex Event Operations</p>
        <h1 style={{ maxWidth: 560, margin: "12px 0", fontSize: "clamp(44px, 8vw, 78px)", lineHeight: .95 }}>La nuova esperienza è in preparazione.</h1>
        <p style={{ maxWidth: 520, color: "#526168", fontSize: 19 }}>Un sistema operativo per pianificare, preparare e servire eventi con più controllo.</p>
      </section>
    </main>
  );
}
