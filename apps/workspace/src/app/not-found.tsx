import Image from "next/image";
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
      <section
        aria-labelledby="not-found-title"
        style={{
          width: "100%",
          maxWidth: "28rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--spacing-4)",
        }}
      >
        <Image
          src="/logo-icon/qoovex-icona-nera-sfondo-quadrato.svg"
          alt="Qoovex"
          width={48}
          height={48}
          priority
          style={{ borderRadius: "var(--radius-lg)" }}
        />
        <div>
          <p
            style={{
              color: "var(--color-text-faint)",
              fontSize: "var(--text-xs)",
              letterSpacing: "0",
              marginBottom: "var(--spacing-2)",
              textTransform: "uppercase",
            }}
          >
            Errore 404
          </p>
          <h1
            id="not-found-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            Pagina non trovata
          </h1>
        </div>
        <p
          style={{
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          L&apos;indirizzo richiesto non corrisponde a nessuna pagina del
          workspace. Se stavi entrando nell&apos;app, torna al percorso sicuro.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "var(--spacing-3)",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              alignItems: "center",
              background: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-primary-foreground)",
              display: "inline-flex",
              fontWeight: 600,
              minHeight: "2.5rem",
              padding: "0 var(--spacing-4)",
              textDecoration: "none",
            }}
          >
            Vai al workspace
          </Link>
          <Link
            href="/sign-in"
            style={{
              alignItems: "center",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text)",
              display: "inline-flex",
              fontWeight: 500,
              minHeight: "2.5rem",
              padding: "0 var(--spacing-4)",
              textDecoration: "none",
            }}
          >
            Accedi
          </Link>
        </div>
      </section>
    </main>
  );
}
