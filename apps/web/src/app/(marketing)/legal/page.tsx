import type { Metadata } from "next";
import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { legalContent } from "./content/index";

export const metadata: Metadata = {
  title: "Note legali",
  description:
    "Privacy policy, termini di servizio e informazioni legali di Qoovex.",
};

export default function Page() {
  return (
    <PageSection
      eyebrow="Trasparenza"
      title={legalContent.title}
      description={legalContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Privacy policy",
            body: "Informazioni sul trattamento dei dati e sulle responsabilita di Qoovex.",
            label: "Privacy",
          },
          {
            title: "Termini di servizio",
            body: "Condizioni d'uso della piattaforma, account e servizi collegati.",
            label: "Termini",
            tone: "primary",
          },
          {
            title: "Cookie policy",
            body: "Dettagli sui cookie tecnici e sugli strumenti usati per migliorare il servizio.",
            label: "Cookie",
          },
        ]}
      />
    </PageSection>
  );
}
