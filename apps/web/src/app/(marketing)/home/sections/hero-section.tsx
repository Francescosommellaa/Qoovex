import Image from "next/image";
import { Button, Icon, Stack, Text } from "@qoovex/ui";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { homeHero } from "../content/index";

const reviewPhotos = [
  "/review-photos/chef-1.svg",
  "/review-photos/chef-2.svg",
  "/review-photos/chef-3.svg",
] as const;

export function HomeHeroSection() {
  return (
    <section className="relative min-w-0 overflow-hidden pb-(--spacing-4) pt-(--spacing-24) md:pb-(--spacing-6) md:pt-(--spacing-32)">
      {/* Atmospheric radial glow — Linear-style background depth */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-0 h-[40rem] w-[70rem] -translate-x-1/2 -translate-y-1/4 rounded-full"
          style={{
            background: "var(--qv-marketing-radial-hero)",
            filter: "blur(var(--qv-marketing-blur-hero))",
          }}
        />
      </div>

      <Stack
        gap="8"
        align="start"
        className="w-full max-w-(--qv-marketing-hero-inner-max)"
      >
        <Stack gap="5">
          <Text
            as="h1"
            family="display"
            size="xl"
            weight="semibold"
            leading="tight"
            className="break-words text-wrap text-(length:--qv-marketing-hero-title-size)"
          >
            {homeHero.title}{" "}
            <Text
              as="span"
              family="display"
              size="xl"
              tone="muted"
              weight="semibold"
              leading="tight"
              className="text-(length:--qv-marketing-hero-title-size)"
            >
              {homeHero.highlight}
            </Text>
          </Text>
          <Text size="base" tone="muted" leading="relaxed" className="max-w-(--measure-copy)">
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
          <Button
            as="a"
            href={homeHero.secondaryAction.href}
            size="lg"
            variant="ghost"
          >
            {homeHero.secondaryAction.label}
          </Button>
        </Stack>

        <div className="flex max-w-(--measure-copy) items-center gap-(--spacing-3)">
          <div className="flex shrink-0 -space-x-2" aria-hidden="true">
            {reviewPhotos.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={34}
                height={34}
                className="size-[34px] rounded-(--radius-full) border border-(--color-bg) bg-(--color-surface-2)"
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
          <Text size="xs" tone="faint" leading="snug">
            Oltre 100 chef e brigate risparmiano già più di 2 ore al giorno grazie a Qoovex.
          </Text>
        </div>
      </Stack>
    </section>
  );
}
