import { Badge, Box, Card, CardBody, Icon, Stack, Text } from "@qoovex/ui";
import {
  CheckCircle,
  ClipboardText,
  ForkKnife,
  QrCode,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

const railItems = [
  { label: "Ricette", value: "Fonte unica", icon: ForkKnife, tone: "primary" as const },
  { label: "Menu", value: "Sempre aggiornato", icon: QrCode, tone: "success" as const },
  { label: "Allergeni", value: "Meno rischio", icon: ShieldCheck, tone: "warning" as const },
  { label: "Brigata", value: "Prossimo passo", icon: ClipboardText, tone: "neutral" as const },
];

export function OperatingRail() {
  return (
    <Card variant="panel" tone="primary" padding="lg" overflow="visible">
      <CardBody>
        <Stack gap="5">
          <Stack direction="row" align="center" justify="between" gap="4">
            <Stack gap="1">
              <Text as="span" size="xs" tone="faint" weight="medium">
                Qoovex Workspace
              </Text>
              <Text as="h2" family="display" size="lg" weight="semibold" leading="tight">
                Regia del servizio
              </Text>
            </Stack>
            <Badge
              variant="soft"
              tone="success"
              size="sm"
              iconLeft={<Icon icon={CheckCircle} size="xs" weight="bold" />}
            >
              Live
            </Badge>
          </Stack>

          <Stack gap="3">
            {railItems.map((item) => (
              <Box
                key={item.label}
                radius="lg"
                border="subtle"
                surface="surface"
                padding="3"
                className="transition-colors hover:bg-(--color-surface-2)"
              >
                <Stack direction="row" align="center" gap="3">
                  <Box
                    radius="full"
                    surface="offset"
                    className="flex size-(--spacing-8) shrink-0 items-center justify-center"
                  >
                    <Icon icon={item.icon} tone={item.tone} size="md" weight="bold" />
                  </Box>
                  <Stack gap="1" className="min-w-0">
                    <Text as="span" size="xs" tone="faint" weight="medium">
                      {item.label}
                    </Text>
                    <Text as="span" size="sm" weight="semibold" className="truncate">
                      {item.value}
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
