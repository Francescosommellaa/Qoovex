import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { FaqAccordion } from "@/components/faq-accordion";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { faqGroups } from "../content";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Domande frequenti su Qoovex - Cosa fa e cosa non fa",
  description:
    "Risposte chiare su Qoovex: a chi serve, come funziona la condivisione, cosa non fa e come tratta file e informazioni.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Domande frequenti su Qoovex",
    description: "A chi serve, come funziona la condivisione e cosa Qoovex non fa.",
    url: "/faq",
    type: "article",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqGroups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  ),
};

export default function FaqPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Domande frequenti"
        title="Le risposte alle domande più comuni"
        description="Abbiamo raccolto ciò che imprese e clienti chiedono più spesso. Se non trovi la tua risposta, scrivici dalla pagina Contattaci."
        current="FAQ"
      />

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-12">
          {faqGroups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">{group.title}</h2>
              <FaqAccordion items={group.items} />
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Hai un'altra domanda?"
        description="Scrivici: rispondiamo volentieri a imprese e clienti che vogliono capire meglio Qoovex."
        primaryHref="/contattaci"
        primaryLabel="Contattaci"
      />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </SiteShell>
  );
}
