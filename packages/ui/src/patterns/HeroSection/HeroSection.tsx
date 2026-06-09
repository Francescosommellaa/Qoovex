import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Badge, Button } from "../../components";
import { cn } from "../../lib/utils";
import { Box, Icon, Stack, Text } from "../../primitives";
import type { HeroProofItem, HeroSectionProps } from "./HeroSection.types";

function isProofList(proof: HeroSectionProps["proof"]): proof is HeroProofItem[] {
  return Array.isArray(proof);
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection(
    { eyebrow, title, description, actions = [], visual, proof, className, ...props },
    ref,
  ) {
    return (
      <Box
        as="section"
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          style={{ background: "var(--gradient-warm)" }}
        />
        <Box className="mx-auto grid w-full max-w-(--container-wide) items-center gap-(--spacing-12) px-(--page-gutter) py-(--spacing-20) lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <Stack gap="6" align="start" className="max-w-(--measure-hero)">
            {eyebrow ? (
              <Badge variant="outline" tone="neutral" size="sm">
                {eyebrow}
              </Badge>
            ) : null}
            <Text as="h1" textStyle="hero" weight="medium">
              {title}
            </Text>
            <Text textStyle="subheading" tone="muted">
              {description}
            </Text>
            {actions.length > 0 ? (
              <Stack direction="row" gap="3" wrap>
                {actions.map((action) => (
                  <Button
                    key={String(action.label)}
                    as="a"
                    href={action.href}
                    variant={action.variant === "secondary" ? "secondary" : "primary"}
                    size="lg"
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
            {isProofList(proof) ? (
              proof.length > 0 ? (
                <Box className="grid w-full grid-cols-1 gap-(--spacing-4) border-t border-(--color-divider) pt-(--spacing-4) sm:grid-cols-3">
                  {proof.map((item, index) => (
                    <Stack key={index} gap="1">
                      <Text textStyle="subheading" weight="medium">
                        {item.value}
                      </Text>
                      <Text textStyle="caption" tone="muted">
                        {item.label}
                      </Text>
                    </Stack>
                  ))}
                </Box>
              ) : null
            ) : (
              proof
            )}
          </Stack>
          {visual ? <Box className="min-w-0">{visual}</Box> : null}
        </Box>
      </Box>
    );
  },
);

HeroSection.displayName = "HeroSection";
