import * as React from "react";
import { Stack, Text, cn } from "@qoovex/ui";

interface WorkspacePageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  width?: "content" | "wide" | "full";
  className?: string;
  contentClassName?: string;
}

const widthClass: Record<NonNullable<WorkspacePageProps["width"]>, string> = {
  content: "mx-auto w-full max-w-(--container-content)",
  wide: "mx-auto w-full max-w-(--container-wide)",
  full: "w-full",
};

export function WorkspacePage({
  title,
  description,
  actions,
  children,
  width = "wide",
  className,
  contentClassName,
}: WorkspacePageProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn("py-(--spacing-3) md:py-(--spacing-5)", className)}>
      <Stack gap="5" className={widthClass[width]}>
        {hasHeader ? (
          <div className="flex flex-col gap-(--spacing-3) border-b border-(--color-divider) pb-(--spacing-4) md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 max-w-(--measure-copy)">
              {title ? (
                <Text as="h1" family="display" size="lg" weight="semibold" leading="tight">
                  {title}
                </Text>
              ) : null}
              {description ? (
                <Text
                  size="sm"
                  tone="muted"
                  leading="relaxed"
                  className="mt-(--spacing-1) line-clamp-2"
                >
                  {description}
                </Text>
              ) : null}
            </div>
            {actions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-(--spacing-2)">
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={cn("min-w-0", contentClassName)}>{children}</div>
      </Stack>
    </section>
  );
}
