import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "var(--spacing-6)",
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "24rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            marginBottom: "var(--spacing-3)",
          }}
        >
          Pagina non trovata
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-6)" }}>
          L&apos;indirizzo non corrisponde a nessuna pagina del workspace.
        </p>
        <Link
          href="/sign-in"
          style={{
            color: "var(--color-primary)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Vai al login
        </Link>
      </div>
    </main>
  );
}
