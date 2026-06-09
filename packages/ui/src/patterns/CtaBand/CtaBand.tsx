import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components";
import { cn } from "../../lib/utils";
import { Box, Icon, Stack, Text } from "../../primitives";
import type { CtaBandProps } from "./CtaBand.types";

export const CtaBand = React.forwardRef<HTMLElement, CtaBandProps>(
  function CtaBand({ title, description, actions = [], className, ...props }, ref) {
    return (
      <Box
        as="section"
        ref={ref}
        className={cn("bg-(--surface-obsidian) text-(--color-paper-white)", className)}
        {...props}
      >
        <Stack
          gap="8"
          align="center"
          className="mx-auto max-w-(--container-wide) px-(--page-gutter) py-(--spacing-20) text-center"
        >
          <Stack gap="4" align="center" className="max-w-(--measure-copy)">
            <Text as="h2" textStyle="display" tone="inverse" weight="medium">
              {title}
            </Text>
            <Text textStyle="body" tone="inverse" className="opacity-75">
              {description}
            </Text>
          </Stack>
          {actions.length > 0 ? (
            <Stack direction="row" gap="3" wrap justify="center">
              {actions.map((action) => (
                <Button
                  key={String(action.label)}
                  as="a"
                  href={action.href}
                  variant={action.variant === "secondary" ? "ghost" : "inverse"}
                  size="lg"
                  className={
                    action.variant === "secondary"
                      ? "text-(--color-paper-white) hover:bg-white/10"
                      : undefined
                  }
                  iconRight={
                    action.variant === "secondary" ? undefined : (
                      <Icon icon={ArrowRight} size="sm" weight="bold" />
                    )
                  }
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Box>
    );
  },
);

CtaBand.displayName = "CtaBand";
