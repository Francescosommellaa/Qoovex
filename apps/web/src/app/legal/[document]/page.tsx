import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Container, Heading, PageHeader, Section, Stack, Text } from "@qoovex/ui/web";

import {
  legalDocuments,
  type LegalDocumentSlug,
} from "../content/legal-content";

type PageProps = {
  params: Promise<{ document: string }>;
};

function getDocument(slug: string) {
  if (!(slug in legalDocuments)) return null;
  return legalDocuments[slug as LegalDocumentSlug];
}

export function generateStaticParams() {
  return Object.keys(legalDocuments).map((document) => ({ document }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { document } = await params;
  const content = getDocument(document);
  if (!content) return {};
  return {
    title: content.title,
    description: content.description,
  };
}

export default async function LegalDocumentPage({ params }: PageProps) {
  const { document } = await params;
  const content = getDocument(document);
  if (!content) notFound();

  return (
    <main className="web-page">
      <Section spacing="lg">
        <Container size="reading">
          <Stack gap="6">
            <PageHeader
              align="start"
              eyebrow="Documento legale"
              title={content.title}
              description={content.description}
              metadata={<span>Aggiornata il {content.lastUpdated}</span>}
              breadcrumbs={<Link className="web-action-link" href="/legal">Tutti i documenti</Link>}
            />
            <Card as="article" padding="lg" radius="lg">
              <Stack gap="6">
                {content.sections.map((section) => (
                  <section className="web-legal-section" key={section.title}>
                    <Heading as="h2" size="heading-sm">
                      {section.title}
                    </Heading>
                    {section.paragraphs?.map((paragraph) => (
                      <Text key={paragraph} tone="muted">
                        {paragraph}
                      </Text>
                    ))}
                    {section.items ? (
                      <ul>
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
