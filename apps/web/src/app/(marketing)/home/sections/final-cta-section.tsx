import { Button, Icon, Stack, Text } from "@qoovex/ui";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { finalCta } from "../content/index";

export function HomeFinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-(--spacing-24) md:py-(--spacing-32)">
      {/* Radial glow — same atmospheric treatment as hero */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[36rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "var(--qv-marketing-radial-cta)",
            filter: "blur(var(--qv-marketing-blur-cta))",
          }}
        />
      </div>

      <Stack gap="10" align="center" className="mx-auto max-w-(--qv-marketing-section-intro-max) text-center">
        <Stack gap="5" align="center">
          <span
            className="block h-px w-(--spacing-10) rounded-(--radius-full) bg-(--color-success) opacity-70"
            aria-hidden="true"
          />
          <Text
            as="h2"
            family="display"
            size="xl"
            weight="semibold"
            leading="tight"
            className="text-(length:--qv-marketing-cta-title-size)"
          >
            {finalCta.title}{" "}
            <Text
              as="span"
              family="display"
              size="xl"
              tone="muted"
              weight="semibold"
              leading="tight"
              className="text-(length:--qv-marketing-cta-title-size)"
            >
              {finalCta.highlight}
            </Text>
          </Text>
          <Text size="base" tone="muted" leading="relaxed" className="max-w-(--measure-copy)">
            {finalCta.description}
          </Text>
        </Stack>

        <Stack direction="row" gap="3" wrap align="center">
          <Button
            as="a"
            href={finalCta.primaryAction.href}
            size="lg"
            iconRight={<Icon icon={ArrowRight} size="sm" weight="bold" />}
          >
            {finalCta.primaryAction.label}
          </Button>
          <Button
            as="a"
            href={finalCta.secondaryAction.href}
            size="lg"
            variant="ghost"
          >
            {finalCta.secondaryAction.label}
          </Button>
        </Stack>
      </Stack>
    </section>
  );
}
