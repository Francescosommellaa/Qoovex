import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { legalContent } from "../content/index";

export function LegalDocumentsSection() {
  return (
    <PageSection
      eyebrow="Legale"
      title={legalContent.title}
      description={legalContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Privacy",
            body: "Trattamento dei dati e informazioni per utenti e workspace.",
            label: "Privacy",
          },
          {
            title: "Termini",
            body: "Condizioni di utilizzo della piattaforma Qoovex.",
            label: "Termini",
            tone: "primary",
          },
        ]}
      />
    </PageSection>
  );
}
