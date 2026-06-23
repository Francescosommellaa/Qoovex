import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Grid, PageHeader, Section, Stack, Text } from "@qoovex/ui/web";

import { legalContent, legalDocuments } from "./content/legal-content";

export const metadata: Metadata = {
  title: "Documenti legali",
  description: legalContent.description,
};

export default function LegalPage() {
  return (
    <main className="web-page">
      <Section spacing="lg">
        <Container>
          <Stack gap="8">
            <PageHeader
              align="start"
              eyebrow="Qoovex legal"
              title={legalContent.title}
              description={legalContent.description}
            />
            <Grid as="ul" className="web-legal-list" columns={1} tabletColumns={3} gap="4">
              {Object.values(legalDocuments).map((document) => (
                <li key={document.slug}>
                  <Card className="web-legal-card" padding="md" radius="lg" interactive>
                    <Stack gap="3">
                      <Text size="caption" tone="muted">Aggiornata il {document.lastUpdated}</Text>
                      <Link className="web-legal-card__link" href={`/legal/${document.slug}`}>
                        <Text as="span" size="body-lg" weight="semibold">
                          {document.title}
                        </Text>
                      </Link>
                      <Text tone="muted">{document.description}</Text>
                    </Stack>
                  </Card>
                </li>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
