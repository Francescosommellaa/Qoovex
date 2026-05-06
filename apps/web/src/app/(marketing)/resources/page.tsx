import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risorse",
  description: "Guide, tutorial e aggiornamenti per usare al meglio Qoovex.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      <section className="py-16">
        <p className="mb-3 text-(length:--text-xs) font-medium uppercase tracking-widest text-text-faint">
          Placeholder — Risorse
        </p>
        <h1 className="font-display text-(length:--text-3xl) font-semibold text-text">
          Guide e risorse.
        </h1>
        <p className="mt-4 max-w-2xl text-(length:--text-base) leading-relaxed text-text-muted">
          Tutorial, changelog e materiali per sfruttare al massimo il tuo
          workspace Qoovex.
        </p>
      </section>
    </div>
  );
}