import { Stack, Text } from "@qoovex/ui";
import { workflowSteps } from "../content/index";
import { HomeSectionShell } from "../_components/index";

export function WorkflowSection() {
  return (
    <HomeSectionShell
      title="Scrivi una volta. Usi in ogni servizio."
      description="Il ricettario diventa operativo: non resta archivio, entra nei menu, nei task e nelle preparazioni del giorno."
      accent="success"
    >
      <div className="grid grid-cols-1 gap-(--spacing-8) border-y border-(--color-divider) py-(--spacing-6) md:grid-cols-3">
        {workflowSteps.slice(0, 3).map((step, index) => (
          <Stack key={step.label} gap="3">
            <Text as="span" family="display" size="lg" tone="faint" weight="semibold">
              0{index + 1}
            </Text>
            <Stack gap="2">
              <Text as="h3" family="display" size="xl" weight="semibold" leading="tight">
                {step.title}
              </Text>
              <Text size="sm" tone="muted" leading="relaxed">
                {step.description}
              </Text>
            </Stack>
          </Stack>
        ))}
      </div>
    </HomeSectionShell>
  );
}
