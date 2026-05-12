import { Box, Card, CardBody, Stack, Text } from "@qoovex/ui";

const tasks = [
  { time: "08:20", title: "Cuoci fondi e basi", meta: "Mario \u00b7 45 min attivi" },
  { time: "09:10", title: "Abbattimento impasti", meta: "Tempo passivo sfruttato" },
  { time: "10:30", title: "Porziona tartare", meta: "Ricetta allegata" },
];

export function WorkPlanBoard() {
  return (
    <Card
      variant="panel"
      tone="primary"
      padding="lg"
      overflow="hidden"
      className="pointer-events-none select-none [box-shadow:none]"
    >
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
            <Text as="span" size="xs" tone="faint" weight="semibold">
              Anteprima app
            </Text>
          </Stack>

          <Stack gap="2">
            {tasks.map((task) => (
              <Box
                key={task.title}
                radius="lg"
                border="subtle"
                surface="surface"
                className="px-(--spacing-4) py-(--spacing-4)"
              >
                <Stack direction="row" align="center" gap="4">
                  <Box
                    radius="md"
                    surface="offset"
                    className="flex h-(--spacing-10) w-(--spacing-14) shrink-0 items-center justify-center"
                  >
                    <Text as="span" size="xs" tone="muted" weight="semibold" className="font-mono">
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

          <Text size="xs" tone="muted" leading="snug">
            I tempi passivi diventano spazio utile, non attesa confusa.
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}
