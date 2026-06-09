import Image from "next/image";
import heroIllustration from "@qoovex/brand/illustrations/kitchen-service-line.png";
import { Badge, Button, Stack, Text } from "@qoovex/ui";
import { HeroEmailCapture } from "../_components/index";
import { homeHero } from "../content/index";

const reviewPhotos = [
  "/review-photos/chef-1.svg",
  "/review-photos/chef-2.svg",
  "/review-photos/chef-3.svg",
] as const;

export function HomeHeroSection() {
  return (
    <section className="relative min-w-0 overflow-hidden pb-(--spacing-16) pt-(--spacing-24) md:pb-(--spacing-20) md:pt-(--spacing-32)">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{ background: "var(--qv-marketing-radial-hero)" }}
      />

      <div className="mx-auto grid w-full max-w-(--container-wide) items-center gap-(--spacing-12) px-(--page-gutter) lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
        <Stack gap="8" align="start">
          <Badge variant="announcement" tone="neutral" size="sm">
            Il workspace operativo per la cucina
          </Badge>

          <Stack gap="5" className="max-w-(--qv-marketing-hero-inner-max)">
          <Text as="h1" textStyle="hero" weight="medium" className="break-words text-wrap">
            {homeHero.title}{" "}
            <Text as="span" textStyle="hero" tone="muted" weight="medium">
              {homeHero.highlight}
            </Text>
          </Text>
          <Text textStyle="subheading" tone="muted" className="max-w-(--measure-copy)">
            {homeHero.description}
          </Text>
          </Stack>

          <HeroEmailCapture />

          <Button
            as="a"
            href={homeHero.secondaryAction.href}
            size="sm"
            variant="ghost"
          >
            {homeHero.secondaryAction.label}
          </Button>

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
          <Text textStyle="caption" tone="muted">
            Oltre 100 chef e brigate risparmiano gia piu di 2 ore al giorno con Qoovex.
          </Text>
          </div>
        </Stack>

        <div className="relative hidden min-h-[30rem] lg:block">
          <Image
            src={heroIllustration}
            alt="Chef professionista che coordina il servizio con una checklist"
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 0px"
            className="object-contain object-right"
          />
        </div>
      </div>
    </section>
  );
}
