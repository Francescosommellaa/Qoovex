"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        role="alert"
        style={{
          width: "100%",
          maxWidth: "28rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-4)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            lineHeight: 1.15,
          }}
        >
          Qualcosa non ha funzionato
        </h1>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Non siamo riusciti a completare la richiesta. Riprova tra qualche
          istante.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            alignSelf: "center",
            background: "var(--color-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "var(--color-primary-foreground)",
            cursor: "pointer",
            fontWeight: 600,
            minHeight: "2.5rem",
            padding: "0 var(--spacing-4)",
          }}
        >
          Riprova
        </button>
      </section>
    </main>
  );
}
