import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Note legali",
  description:
    "Privacy policy, termini di servizio e informazioni legali di Qoovex.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      <section className="py-16">
        <p className="mb-3 text-(length:--text-xs) font-medium uppercase tracking-widest text-text-faint">
          Placeholder — Note legali
        </p>
        <h1 className="font-display text-(length:--text-3xl) font-semibold text-text">
          Note legali.
        </h1>
        <p className="mt-4 max-w-2xl text-(length:--text-base) leading-relaxed text-text-muted">
          Privacy policy, termini di servizio e cookie policy di Qoovex.
        </p>
      </section>
    </div>
  );
}