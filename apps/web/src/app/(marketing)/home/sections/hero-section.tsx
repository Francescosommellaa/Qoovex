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
    <section className="min-w-0 overflow-hidden pb-(--spacing-8) pt-(--spacing-8) md:pb-(--spacing-10) md:pt-(--spacing-8)">
      <Stack
        gap="6"
        align="start"
        className="w-full md:max-w-[58rem]"
        style={{ width: "min(100%, calc(100vw - var(--spacing-8)))" }}
      >
        <Stack gap="5">
          <Text
            as="h1"
            family="display"
            size="xl"
            weight="semibold"
            leading="tight"
            className="break-words text-wrap md:text-[4rem] lg:text-[4.5rem]"
          >
            {homeHero.title}{" "}
            <Text
              as="span"
              family="display"
              size="xl"
              tone="muted"
              weight="semibold"
              leading="tight"
              className="md:text-[4rem] lg:text-[4.5rem]"
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
            Piccole brigate e chef usano Qoovex per vedere subito cosa fare.
          </Text>
        </div>
      </Stack>
    </section>
  );
}
