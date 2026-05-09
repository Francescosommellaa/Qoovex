import type { Metadata } from "next";
import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { resourcesContent } from "./content/index";

export const metadata: Metadata = {
  title: "Risorse",
  description: "Guide, tutorial e aggiornamenti per usare al meglio Qoovex.",
};

export default function Page() {
  return (
    <PageSection
      eyebrow="Risorse"
      title={resourcesContent.title}
      description={resourcesContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Guide operative",
            body: "Materiali pratici per impostare ricette, menu e allergeni con una struttura coerente.",
            label: "Guide",
            tone: "primary",
          },
          {
            title: "Template",
            body: "Schemi riutilizzabili per partire piu velocemente con il tuo workspace Qoovex.",
            label: "Template",
          },
          {
            title: "Aggiornamenti",
            body: "Novita di prodotto e note di rilascio pensate per team di cucina.",
            label: "Changelog",
            tone: "success",
          },
        ]}
      />
    </PageSection>
  );
}
