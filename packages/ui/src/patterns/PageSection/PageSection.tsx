import * as React from "react";
import { cn } from "../../lib/utils";
import { Box, Stack, Text } from "../../primitives";
import { paddingClass, spacingClass } from "../../../config/variants";
import type { PageSectionProps } from "./PageSection.types";

const widthClass = {
  content: "mx-auto w-full max-w-(--container-content)",
  wide: "mx-auto w-full max-w-(--container-wide)",
  full: "w-full",
} as const;

export const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  function PageSection(
    {
      title,
      description,
      eyebrow,
      width = "wide",
      spacing = "16",
      children,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Box
        as="section"
        ref={ref}
        className={cn("qv-page-section", paddingClass[spacing], className)}
        {...props}
      >
        <Stack gap="8" className={widthClass[width]}>
          {title || description || eyebrow ? (
            <Stack gap="3" className="max-w-(--measure-copy)">
              {eyebrow ? (
                <Text as="p" size="xs" tone="primary" weight="semibold" family="mono">
                  {eyebrow}
                </Text>
              ) : null}
              {title ? (
                <Text as="h2" family="display" size="xl" weight="semibold" leading="tight">
                  {title}
                </Text>
              ) : null}
              {description ? (
                <Text size="base" tone="muted" leading="relaxed">
                  {description}
                </Text>
              ) : null}
            </Stack>
          ) : null}
          <div className={cn("min-w-0", spacingClass["4"])}>{children}</div>
        </Stack>
      </Box>
    );
  },
);

PageSection.displayName = "PageSection";

