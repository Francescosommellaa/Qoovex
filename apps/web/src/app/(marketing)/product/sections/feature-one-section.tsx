import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { productContent } from "../content/index";

export function FeatureOneSection() {
  return (
    <PageSection
      eyebrow="Prodotto"
      title={productContent.title}
      description={productContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Ricette",
            body: "Schede operative ordinate e condivise con il team.",
            label: "Core",
            tone: "primary",
          },
          {
            title: "Menu",
            body: "Menu digitali e QR aggiornati dallo stesso contenuto.",
            label: "Pubblico",
          },
        ]}
      />
    </PageSection>
  );
}
