import { Badge, Box, Card, CardBody, Icon, Stack, Text } from "@qoovex/ui";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  CookingPot,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const tasks = [
  { time: "08:20", title: "Cuoci fondi e basi", meta: "Mario - 45 min attivi" },
  { time: "09:10", title: "Abbattimento impasti", meta: "Tempo passivo sfruttato" },
  { time: "10:30", title: "Porziona tartare", meta: "Ricetta allegata" },
];

export function WorkPlanBoard() {
  return (
    <Card variant="panel" tone="primary" padding="lg" overflow="hidden">
      <CardBody>
        <Stack gap="6">
          <Stack direction="row" align="center" justify="between" gap="4">
            <Stack gap="1">
              <Text as="span" size="xs" tone="faint" weight="medium">
                Servizio serale
              </Text>
              <Text as="h3" family="display" size="lg" weight="semibold" leading="tight">
                Piano di lavoro
              </Text>
            </Stack>
            <Badge
              variant="soft"
              tone="success"
              size="sm"
              iconLeft={<Icon icon={CheckCircle} size="xs" weight="bold" />}
            >
              Pronto
            </Badge>
          </Stack>

          <Stack gap="3">
            {tasks.map((task) => (
              <Box key={task.title} radius="lg" border="subtle" surface="surface" padding="3">
                <Stack direction="row" align="center" gap="3">
                  <Box
                    radius="md"
                    surface="offset"
                    className="flex h-(--spacing-10) w-(--spacing-12) shrink-0 items-center justify-center"
                  >
                    <Text as="span" size="xs" tone="muted" weight="semibold">
                      {task.time}
                    </Text>
                  </Box>
                  <Stack gap="1" className="min-w-0">
                    <Text as="span" size="sm" weight="semibold" className="truncate">
                      {task.title}
                    </Text>
                    <Text as="span" size="xs" tone="faint" className="truncate">
                      {task.meta}
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>

          <div className="grid grid-cols-1 gap-(--spacing-3) sm:grid-cols-3">
            {[
              { label: "Stock", value: "Crocchette sotto soglia", icon: CookingPot, tone: "warning" as const },
              { label: "Brigata", value: "3 persone allineate", icon: UsersThree, tone: "success" as const },
              { label: "AI", value: "2 task suggeriti", icon: Brain, tone: "primary" as const },
            ].map((item) => (
              <Box key={item.label} radius="lg" border="divider" surface="surface2" padding="3">
                <Stack gap="2">
                  <Icon icon={item.icon} tone={item.tone} size="md" weight="bold" />
                  <Stack gap="1">
                    <Text as="span" size="xs" tone="faint">
                      {item.label}
                    </Text>
                    <Text as="span" size="xs" weight="semibold" leading="snug">
                      {item.value}
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </div>

          <Stack direction="row" align="center" gap="2">
            <Icon icon={Clock} tone="primary" size="sm" weight="bold" />
            <Text size="xs" tone="muted">
              I tempi passivi diventano spazio utile, non attesa confusa.
            </Text>
            <Icon icon={ArrowRight} tone="faint" size="xs" weight="bold" className="ml-auto" />
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
