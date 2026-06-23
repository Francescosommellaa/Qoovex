import type { Metadata } from "next";
import { Card, Container, PageHeader, Section, Stack, Text } from "@qoovex/ui/web";

export const metadata: Metadata = {
  title: "Contatti",
};

export default function ContactPage() {
  return (
    <main className="web-page">
      <Section spacing="lg">
        <Container size="reading">
          <Stack gap="6">
            <PageHeader
              align="start"
              eyebrow="Qoovex"
              title="Contatti"
              description="Per informazioni sul servizio, sul workspace o sui documenti legali puoi scrivere direttamente al team Qoovex."
            />
            <Card className="web-contact-card" padding="lg" radius="lg">
              <Stack gap="4">
                <Text size="label" weight="semibold">Email</Text>
                <address>
                  <a className="web-action-link" data-variant="primary" href="mailto:ciao@qoovex.com">
                    ciao@qoovex.com
                  </a>
                </address>
                <Text tone="muted">
                  Il canale email è il punto di contatto pubblico finché non esistono flussi commerciali o supporto marketing dedicati.
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
