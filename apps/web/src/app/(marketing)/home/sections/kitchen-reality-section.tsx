import { Badge, Box, Icon, Stack, Text } from "@qoovex/ui";
import { ArrowRight, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { HomeSectionShell } from "../_components/index";
import { kitchenProblems } from "../content/index";

export function KitchenRealitySection() {
  return (
    <HomeSectionShell
      title="Prima togli il rumore. Poi il lavoro scorre."
      description="Una cucina non ha bisogno di piu complicazioni. Ha bisogno di vedere subito la cosa giusta, nel momento giusto."
      accent="warning"
    >
      <Box radius="2xl" border="subtle" surface="surface" padding="3">
        {kitchenProblems.map((item, index) => (
          <Box key={item.label} className={index > 0 ? "border-t border-(--color-divider)" : ""}>
            <div className="grid grid-cols-1 gap-(--spacing-4) p-(--spacing-4) md:grid-cols-[9rem_1fr_1fr] md:items-center md:p-(--spacing-5)">
              <Stack direction="row" align="center" gap="2">
                <Badge
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  iconLeft={<Icon icon={WarningCircle} size="xs" weight="bold" />}
                >
                  {item.label}
                </Badge>
              </Stack>

              <Stack gap="2">
                <Text as="span" size="xs" tone="faint" weight="semibold">
                  Oggi
                </Text>
                <Text size="sm" tone="muted" leading="relaxed">
                  {item.today}
                </Text>
              </Stack>

              <Stack gap="2">
                <Stack direction="row" align="center" gap="2">
                  <Icon icon={CheckCircle} tone="success" size="sm" weight="bold" />
                  <Text as="span" size="xs" tone="success" weight="semibold">
                    Con Qoovex
                  </Text>
                  <Icon icon={ArrowRight} tone="faint" size="xs" weight="bold" className="ml-auto" />
                </Stack>
                <Text size="sm" leading="relaxed">
                  {item.qoovex}
                </Text>
              </Stack>
            </div>
          </Box>
        ))}
      </Box>
    </HomeSectionShell>
  );
}
