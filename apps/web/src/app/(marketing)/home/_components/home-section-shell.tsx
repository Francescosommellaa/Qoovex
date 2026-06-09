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

const accentColorClass = {
  primary: "bg-(--color-primary)",
  success: "bg-(--color-success)",
  warning: "bg-(--color-warning)",
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
      <Stack gap="10" className="mx-auto max-w-(--container-wide) px-(--page-gutter) py-(--spacing-16) md:py-(--spacing-20)">
        <Stack
          gap="5"
          align={isCentered ? "center" : "start"}
          className={
            isCentered ? "mx-auto max-w-(--measure-copy) text-center" : "max-w-(--qv-marketing-section-intro-max)"
          }
        >
          {/* Accent line — 2px, full color, no opacity reduction */}
          <span
            className={`block h-[2px] w-(--spacing-8) rounded-(--radius-full) ${accentColorClass[accent]}`}
            aria-hidden="true"
          />
          <Text
            as="h2"
            textStyle="display"
            weight="medium"
          >
            {title}
          </Text>
          {description ? (
            <Text textStyle="body" tone="muted">
              {description}
            </Text>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </section>
  );
}
