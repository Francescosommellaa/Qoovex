import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button, Card, CardBody } from "../../components";
import { cn } from "../../lib/utils";
import { Icon, Stack, Text } from "../../primitives";
import type { CtaBandProps } from "./CtaBand.types";

export const CtaBand = React.forwardRef<HTMLElement, CtaBandProps>(
  function CtaBand({ title, description, actions = [], className, ...props }, ref) {
    return (
      <Stack as="section" ref={ref} className={cn("py-(--spacing-10)", className)} {...props}>
        <Card variant="bento" tone="primary" padding="lg">
          <CardBody>
            <Stack gap="8" className="lg:flex-row lg:items-center lg:justify-between">
              <Stack gap="3" className="max-w-(--measure-copy)">
                <Text as="h2" family="display" size="xl" weight="semibold" leading="tight">
                  {title}
                </Text>
                <Text size="base" tone="muted" leading="relaxed">
                  {description}
                </Text>
              </Stack>
              {actions.length > 0 ? (
                <Stack gap="3" className="shrink-0 sm:flex-row lg:flex-col">
                  {actions.map((action) => (
                    <Button
                      key={String(action.label)}
                      as="a"
                      href={action.href}
                      variant={action.variant === "secondary" ? "ghost" : "primary"}
                      size="md"
                      className="w-full"
                      iconRight={action.variant === "secondary" ? undefined : <Icon icon={ArrowRight} size="sm" weight="bold" />}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    );
  },
);

CtaBand.displayName = "CtaBand";
