import type { Metadata } from "next";
import { FeatureShowcase, PageSection, ProductPreviewFrame } from "@qoovex/ui";
import { productContent } from "./content/index";

export const metadata: Metadata = {
  title: "Prodotto",
  description:
    "Scopri tutte le funzionalita di Qoovex: ricette, menu, allergeni, valori nutrizionali, QR code e piani di lavoro.",
};

export default function Page() {
  return (
    <>
      <PageSection
        eyebrow="Prodotto"
        title="Tutto quello che ti serve in cucina."
        description="Ricette strutturate, menu digitali con QR, calcolo automatico degli allergeni e valori nutrizionali, piani di lavoro collaborativi."
      >
        <ProductPreviewFrame title="Qoovex Workspace" />
      </PageSection>

      <PageSection
        eyebrow="Workspace operativo"
        title={productContent.title}
        description={productContent.description}
      >
        <FeatureShowcase
          items={[
            {
              title: "Ricette strutturate",
              body: "Ingredienti, passaggi, rese e note restano in un formato unico per tutto il team.",
              label: "Schede",
              tone: "primary",
            },
            {
              title: "Menu e QR",
              body: "Pubblica menu chiari e aggiornabili senza duplicare schede o contenuti.",
              label: "Menu",
            },
            {
              title: "Allergeni e valori",
              body: "Centralizza informazioni sensibili in modo coerente tra ricette e menu.",
              label: "Controllo",
              tone: "success",
            },
          ]}
        />
      </PageSection>
    </>
  );
}
