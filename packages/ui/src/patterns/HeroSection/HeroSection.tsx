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
        className={cn("qv-hero-section", className)}
        {...props}
      >
        <Box className="mx-auto grid w-full max-w-(--container-wide) items-center gap-(--spacing-12) py-(--spacing-16) lg:grid-cols-2">
          <Stack gap="6" align="start" className="max-w-(--measure-hero)">
            {eyebrow ? (
              <Badge variant="soft" tone="primary" size="sm">
                {eyebrow}
              </Badge>
            ) : null}
            <Text as="h1" family="display" size="2xl" weight="semibold" leading="tight">
              {title}
            </Text>
            <Text size="base" tone="muted" leading="relaxed">
              {description}
            </Text>
            {actions.length > 0 ? (
              <Stack direction="row" gap="3" wrap>
                {actions.map((action) => (
                  <Button
                    key={String(action.label)}
                    as="a"
                    href={action.href}
                    variant={action.variant === "secondary" ? "ghost" : "primary"}
                    size="md"
                    iconRight={action.variant === "secondary" ? undefined : <Icon icon={ArrowRight} size="sm" weight="bold" />}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            ) : null}
            {isProofList(proof) ? (
              proof.length > 0 ? (
                <Box className="grid w-full grid-cols-1 gap-(--spacing-4) sm:grid-cols-3">
                  {proof.map((item, index) => (
                    <Stack key={index} gap="1">
                      <Text family="display" size="lg" weight="semibold">
                        {item.value}
                      </Text>
                      <Text size="xs" tone="faint">
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
