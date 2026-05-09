import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { pricingContent } from "../content/index";

export function PricingPlansSection() {
  return (
    <PageSection
      eyebrow="Prezzi"
      title={pricingContent.title}
      description={pricingContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Free",
            body: "Per iniziare a ordinare ricette e prove di menu.",
            label: "Base",
          },
          {
            title: "Start",
            body: "Per piccoli team che vogliono lavorare su ricette e menu condivisi.",
            label: "Team",
            tone: "primary",
          },
          {
            title: "Pro",
            body: "Per workspace con piu flussi, dati nutrizionali e operativita ricorrente.",
            label: "Operativo",
            tone: "success",
          },
          {
            title: "Enterprise",
            body: "Per limiti custom, supporto dedicato e realta multi-sede.",
            label: "Custom",
          },
        ]}
      />
    </PageSection>
  );
}
