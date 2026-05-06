import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prodotto",
  description:
    "Scopri tutte le funzionalità di Qoovex: ricette, menu, allergeni, valori nutrizionali, QR code e piani di lavoro.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      <section className="py-16">
        <p className="mb-3 text-(length:--text-xs) font-medium uppercase tracking-widest text-text-faint">
          Placeholder — Prodotto
        </p>
        <h1 className="font-display text-(length:--text-3xl) font-semibold text-text">
          Tutto quello che ti serve in cucina.
        </h1>
        <p className="mt-4 max-w-2xl text-(length:--text-base) leading-relaxed text-text-muted">
          Ricette strutturate, menu digitali con QR, calcolo automatico degli
          allergeni e valori nutrizionali, piani di lavoro collaborativi.
        </p>
      </section>
    </div>
  );
}