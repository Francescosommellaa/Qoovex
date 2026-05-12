import { Button, Icon, ProductPreviewFrame, Stack, Text } from "@qoovex/ui";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { OperatingRail } from "../_components/index";
import { homeHero } from "../content/index";

export function HomeHeroSection() {
  return (
    <section className="grid min-w-0 items-center gap-(--spacing-12) overflow-hidden pb-(--spacing-16) pt-(--spacing-10) lg:min-h-[calc(100dvh-var(--spacing-24))] lg:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.98fr)]">
      <Stack
        gap="8"
        align="start"
        className="w-full md:max-w-(--measure-hero)"
        style={{ width: "min(100%, calc(100vw - var(--spacing-8)))" }}
      >
        <Stack gap="5">
          <span className="h-[3px] w-(--spacing-16) rounded-(--radius-full) bg-(--color-primary)" aria-hidden="true" />
          <Text
            as="h1"
            family="display"
            size="xl"
            weight="semibold"
            leading="tight"
            className="break-words text-wrap md:text-(length:--text-2xl)"
          >
            {homeHero.title}{" "}
            <Text
              as="span"
              family="display"
              size="xl"
              tone="muted"
              weight="semibold"
              leading="tight"
              className="md:text-(length:--text-2xl)"
            >
              {homeHero.highlight}
            </Text>
          </Text>
          <Text size="base" tone="muted" leading="relaxed">
            {homeHero.description}
          </Text>
        </Stack>

        <Stack direction="row" gap="3" wrap>
          <Button
            as="a"
            href={homeHero.primaryAction.href}
            size="lg"
            iconRight={<Icon icon={ArrowRight} size="sm" weight="bold" />}
          >
            {homeHero.primaryAction.label}
          </Button>
        </Stack>

        <Stack gap="3">
          {homeHero.proof.map((item) => (
            <Stack key={item} direction="row" gap="2" align="start">
              <Icon
                icon={CheckCircle}
                tone="success"
                size="sm"
                weight="bold"
                className="mt-[0.22rem]"
              />
              <Text size="sm" tone="muted" leading="snug">
                {item}
              </Text>
            </Stack>
          ))}
        </Stack>

        <div className="w-full sm:hidden">
          <OperatingRail />
        </div>
      </Stack>

      <div className="hidden min-w-0 max-w-full gap-(--spacing-4) overflow-hidden sm:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-end">
        <ProductPreviewFrame activeScreen="recipes" className="max-w-full lg:-mr-(--spacing-6)" />
        <div className="hidden lg:block lg:translate-y-(--spacing-8)">
          <OperatingRail />
        </div>
      </div>
    </section>
  );
}
