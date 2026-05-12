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
      <div className="grid grid-cols-1 gap-px border border-(--color-divider) bg-(--color-divider) overflow-hidden rounded-(--radius-xl) md:grid-cols-3">
        {workflowSteps.slice(0, 3).map((step, index) => (
          <Stack
            key={step.label}
            gap="5"
            className="bg-(--color-bg) px-(--spacing-6) py-(--spacing-7)"
          >
            <Text
              as="span"
              family="display"
              weight="semibold"
              tone="faint"
              className="text-[2.5rem] leading-none tabular-nums"
            >
              0{index + 1}
            </Text>
            <Stack gap="2">
              <Text as="h3" family="display" size="lg" weight="semibold" leading="tight">
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
