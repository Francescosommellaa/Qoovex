export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Qoovex</h1>
        <p>Il workspace per chef professionisti</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a
            href="https://app.qoovex.com/sign-in"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#000",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Accedi
          </a>
          <a
            href="https://app.qoovex.com/sign-up"
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #000",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Registrati gratis
          </a>
        </div>
      </div>
    </main>
  );
}
