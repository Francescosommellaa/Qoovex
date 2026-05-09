import { FeatureShowcase, PageSection } from "@qoovex/ui";
import { enterpriseContent } from "../content/index";

export function StorySection() {
  return (
    <PageSection
      eyebrow="Enterprise"
      title={enterpriseContent.title}
      description={enterpriseContent.description}
    >
      <FeatureShowcase
        items={[
          {
            title: "Limiti custom",
            body: "Ricette, menu e utenti possono scalare con i vincoli reali del team.",
            label: "Scala",
            tone: "primary",
          },
          {
            title: "Supporto dedicato",
            body: "Percorsi guidati per adozione, import dati e formazione operativa.",
            label: "Supporto",
          },
          {
            title: "Multi-sede",
            body: "Un impianto coerente per brigate, sedi e ruoli differenti.",
            label: "Sedi",
            tone: "success",
          },
        ]}
      />
    </PageSection>
  );
}
