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
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-(--radius-xl) border border-(--color-divider) bg-(--color-divider) md:grid-cols-2 xl:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <Stack
            key={step.label}
            gap="8"
            className="bg-(--color-bg) px-(--spacing-8) py-(--spacing-8)"
          >
            {/* Step number: piccolo, monospace, faint — orientamento, non gerarchia */}
            <Text
              as="span"
              size="xs"
              tone="faint"
              weight="semibold"
              className="font-mono tracking-widest uppercase"
            >
              0{index + 1}
            </Text>
            <Stack gap="3">
              {/* Title: display font grande — questo è il primario */}
              <Text
                as="h3"
                family="display"
                size="lg"
                weight="semibold"
                leading="tight"
                className="md:text-(length:--text-xl)"
              >
                {step.title}
              </Text>
              {/* Description: muted, supporto */}
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
