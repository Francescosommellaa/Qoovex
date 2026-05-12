import { Stack, Text } from "@qoovex/ui";
import { HomeSectionShell } from "../_components/index";
import { kitchenProblems } from "../content/index";

export function KitchenRealitySection() {
  return (
    <HomeSectionShell
      title="Prima togli il rumore. Poi il lavoro scorre."
      description="Una cucina non ha bisogno di piu complicazioni. Ha bisogno di vedere subito la cosa giusta, nel momento giusto."
      accent="warning"
    >
      <div className="divide-y divide-(--color-divider) border-y border-(--color-divider)">
        {kitchenProblems.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-1 gap-(--spacing-4) py-(--spacing-5) md:grid-cols-[8rem_1fr_1fr] md:items-start"
          >
            <Text as="h3" size="sm" weight="semibold">
              {item.label}
            </Text>

            <Stack gap="2">
              <Text as="span" size="xs" tone="faint" weight="semibold">
                Oggi
              </Text>
              <Text size="sm" tone="muted" leading="relaxed">
                {item.today}
              </Text>
            </Stack>

            <Stack gap="2">
              <Text as="span" size="xs" tone="success" weight="semibold">
                Con Qoovex
              </Text>
              <Text size="sm" leading="relaxed">
                {item.qoovex}
              </Text>
            </Stack>
          </div>
        ))}
      </div>
    </HomeSectionShell>
  );
}
