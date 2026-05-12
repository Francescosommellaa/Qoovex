import { Button, Card, CardBody, Icon, Stack, Text } from "@qoovex/ui";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { finalCta } from "../content/index";

export function HomeFinalCtaSection() {
  return (
    <section className="py-(--spacing-16) md:py-(--spacing-20)">
      <Card variant="bento" tone="primary" padding="lg">
        <CardBody>
          <Stack gap="8" className="mx-auto max-w-(--container-content) text-center" align="center">
            <Stack gap="4" align="center">
              <span className="h-[3px] w-(--spacing-16) rounded-(--radius-full) bg-(--color-success)" aria-hidden="true" />
              <Text as="h2" family="display" size="xl" weight="semibold" leading="tight">
                {finalCta.title}
              </Text>
              <Text size="base" tone="muted" leading="relaxed">
                {finalCta.description}
              </Text>
            </Stack>
            <Button
              as="a"
              href={finalCta.primaryAction.href}
              size="lg"
              iconRight={<Icon icon={ArrowRight} size="sm" weight="bold" />}
            >
              {finalCta.primaryAction.label}
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </section>
  );
}
