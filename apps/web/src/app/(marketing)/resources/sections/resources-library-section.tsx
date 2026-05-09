import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { resourcesContent } from "../content/index";

export function ResourcesLibrarySection() {
  return (
    <PageSection
      eyebrow="Risorse"
      title={resourcesContent.title}
      description={resourcesContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Guide",
            body: "Documentazione operativa per lavorare meglio con il workspace.",
            label: "Guide",
            tone: "primary",
          },
          {
            title: "FAQ",
            body: "Risposte sintetiche per dubbi comuni su ricette, menu e account.",
            label: "Supporto",
          },
        ]}
      />
    </PageSection>
  );
}
