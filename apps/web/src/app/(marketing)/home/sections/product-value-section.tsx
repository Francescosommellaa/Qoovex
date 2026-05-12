import { Badge, Box, Card, CardBody, Icon, Stack, Text } from "@qoovex/ui";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { HomeSectionShell, WorkPlanBoard } from "../_components/index";
import { operatingPrinciples, workPlanHighlights } from "../content/index";

export function ProductValueSection() {
  return (
    <HomeSectionShell
      title="La regia del servizio, non un altro task manager."
      description="Produzione, evento e servizio hanno tempi diversi. Qoovex li mette nello stesso flusso, con ricette, stock e persone gia collegati."
      accent="primary"
    >
      <div className="grid grid-cols-1 gap-(--spacing-5) lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <WorkPlanBoard />

        <Card variant="bento" tone="primary" padding="lg">
          <CardBody>
            <Stack gap="6">
              <Badge variant="soft" tone="primary" size="sm">
                Carico mentale piu leggero
              </Badge>
              <Stack gap="3">
                <Text as="h3" family="display" size="xl" weight="semibold" leading="tight">
                  Lo chef decide. Qoovex tiene il filo.
                </Text>
                <Text size="sm" tone="muted" leading="relaxed">
                  L&apos;AI serve a togliere passaggi ripetitivi: legge, suggerisce, collega e avvisa. Non sostituisce lo chef, gli libera attenzione.
                </Text>
              </Stack>
              <Stack gap="3">
                {operatingPrinciples.map((item) => (
                  <Stack key={item} direction="row" gap="2" align="start">
                    <Icon
                      icon={CheckCircle}
                      tone="success"
                      size="sm"
                      weight="bold"
                      className="mt-[0.22rem]"
                    />
                    <Text size="sm" tone="muted" leading="snug">
                      {item}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-(--spacing-4) pt-(--spacing-4) sm:grid-cols-2">
        {workPlanHighlights.map((item, index) => (
          <Box
            key={item.label}
            radius="xl"
            border="subtle"
            surface={index % 2 === 0 ? "surface" : "surface2"}
            padding="5"
          >
            <Stack gap="3">
              <Badge variant="soft" tone={index === 0 ? "warning" : "neutral"} size="sm">
                {item.label}
              </Badge>
              <Text size="sm" tone="muted" leading="relaxed">
                {item.description}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </HomeSectionShell>
  );
}
