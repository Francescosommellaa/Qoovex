import type { ReactNode } from "react";
import { Stack, Text } from "@qoovex/ui";

type HomeSectionShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  align?: "start" | "center";
  accent?: "primary" | "success" | "warning" | "neutral";
  className?: string;
};

const accentClass = {
  primary: "bg-(--color-border)",
  success: "bg-(--color-border)",
  warning: "bg-(--color-border)",
  neutral: "bg-(--color-text-faint)",
} as const;

export function HomeSectionShell({
  title,
  description,
  children,
  align = "start",
  accent = "primary",
  className,
}: HomeSectionShellProps) {
  const isCentered = align === "center";

  return (
    <section className={className}>
      <Stack gap="8" className="py-(--spacing-14) md:py-(--spacing-16)">
        <Stack
          gap="3"
          align={isCentered ? "center" : "start"}
          className={isCentered ? "mx-auto max-w-(--measure-copy) text-center" : "max-w-(--measure-copy)"}
        >
          <span
            className={`h-px w-(--spacing-12) rounded-(--radius-full) ${accentClass[accent]}`}
            aria-hidden="true"
          />
          <Text
            as="h2"
            family="display"
            size="xl"
            weight="semibold"
            leading="tight"
            className="md:text-(length:--text-2xl)"
          >
            {title}
          </Text>
          {description ? (
            <Text size="base" tone="muted" leading="relaxed">
              {description}
            </Text>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </section>
  );
}
