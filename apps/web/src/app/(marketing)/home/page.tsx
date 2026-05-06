import type { Metadata } from "next";
import { SharedCtaSection } from "@/shared/sections/index";

export const metadata: Metadata = {
  title: "Qoovex — Il workspace per chef professionisti",
  description:
    "Gestisci ricette, menu digitali, allergeni, valori nutrizionali e piani di lavoro collaborativi.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      {/* Hero — placeholder */}
      <section className="flex min-h-[40vh] flex-col items-start justify-center gap-4 py-16">
        <p className="text-(length:--text-xs) font-medium uppercase tracking-widest text-text-faint">
          Placeholder — Hero
        </p>
        <h1 className="font-display text-(length:--text-3xl) font-semibold text-text">
          Il workspace per chef professionisti.
        </h1>
        <p className="max-w-2xl text-(length:--text-base) leading-relaxed text-text-muted">
          Ricette, menu digitali, allergeni automatici e piani di lavoro
          collaborativi — tutto in un unico posto, pensato per la cucina
          professionale.
        </p>
      </section>

      {/* Features — placeholder */}
      <section className="py-8">
        <p className="mb-4 text-(length:--text-xs) font-medium uppercase tracking-widest text-text-faint">
          Placeholder — Features
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Ricette",
            "Menu digitali",
            "Allergeni",
            "Nutrizionali",
            "Piano di lavoro",
            "QR Code",
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-(--radius-lg) border border-border bg-surface p-5"
            >
              <p className="font-medium text-text">{feature}</p>
              <p className="mt-1 text-(length:--text-sm) text-text-muted">
                Sezione in costruzione.
              </p>
            </div>
          ))}
        </div>
      </section>

      <SharedCtaSection />
    </div>
  );
}