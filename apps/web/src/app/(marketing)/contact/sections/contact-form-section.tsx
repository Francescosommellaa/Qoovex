import { CtaBand, PageSection, Text } from "@qoovex/ui";
import { contactContent } from "../content/index";

export function ContactFormSection() {
  return (
    <>
      <PageSection
        eyebrow="Contatti"
        title={contactContent.title}
        description={contactContent.description}
      >
        <Text tone="faint" size="sm" leading="relaxed">
          Usa i canali ufficiali Qoovex per supporto, partnership o domande sui workspace.
        </Text>
      </PageSection>

      <CtaBand
        title="Preferisci iniziare subito?"
        description="Crea il workspace e organizza ricette, menu e piani di lavoro dalla stessa base dati."
        actions={[
          { label: "Registrati gratis", href: "https://app.qoovex.com/sign-up" },
          { label: "Vedi i piani", href: "/pricing", variant: "secondary" },
        ]}
      />
    </>
  );
}
