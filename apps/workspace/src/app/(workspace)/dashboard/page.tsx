import { Badge, Card, CardBody, PageSection, Stack, Text } from "@qoovex/ui";

export default function DashboardPage() {
  return (
    <PageSection
      title="Workspace pronto"
      description="La shell applicativa e stabile: navigazione, ricerca, preferenze e content scrollabile sono pronti per ospitare le feature."
    >
      <Card variant="panel" tone="success" padding="lg">
        <CardBody>
          <Stack gap="4">
            <Badge variant="soft" tone="success" size="md">
              Shell attiva
            </Badge>
            <Text as="h1" family="display" size="lg" weight="semibold">
              Fondamenta workspace operative
            </Text>
            <Text size="sm" tone="muted" leading="relaxed">
              Le prossime schermate potranno essere composte dentro questo
              spazio senza duplicare layout, navigazione o controlli globali.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </PageSection>
  );
}
