import { Badge, Card, CardBody, Icon, Stack, Text } from "@qoovex/ui";
import {
  Brain,
  ClipboardText,
  ForkKnife,
  ShareNetwork,
} from "@phosphor-icons/react/dist/ssr";
import { workflowSteps } from "../content/index";
import { HomeSectionShell } from "../_components/index";

const icons = [ForkKnife, ShareNetwork, ClipboardText, Brain] as const;

export function WorkflowSection() {
  return (
    <HomeSectionShell
      title="Scrivi una volta. Usi in ogni servizio."
      description="Il ricettario diventa operativo: non resta archivio, entra nei menu, nei task e nelle preparazioni del giorno."
      accent="success"
    >
      <div className="grid grid-cols-1 gap-(--spacing-4) md:grid-cols-2">
        {workflowSteps.map((step, index) => {
          const Glyph = icons[index] ?? ForkKnife;

          return (
            <Card key={step.label} variant="surface" tone={step.tone} padding="lg" interactive>
              <CardBody>
                <Stack gap="5">
                  <Stack direction="row" align="center" justify="between" gap="4">
                    <Badge
                      variant="soft"
                      tone={step.tone}
                      size="sm"
                      iconLeft={<Icon icon={Glyph} size="xs" tone={step.tone} weight="bold" />}
                    >
                      {step.label}
                    </Badge>
                    <Text as="span" family="display" size="lg" tone="faint" weight="semibold">
                      0{index + 1}
                    </Text>
                  </Stack>
                  <Stack gap="3">
                    <Text as="h3" family="display" size="lg" weight="semibold" leading="tight">
                      {step.title}
                    </Text>
                    <Text size="sm" tone="muted" leading="relaxed">
                      {step.description}
                    </Text>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </HomeSectionShell>
  );
}
