import * as React from "react";
import { Card, CardBody } from "../../components";
import { Stack, Text } from "../../primitives";
import type { AuthShellProps } from "./AuthShell.types";

export function AuthShell({
  title,
  subtitle,
  children,
  logo,
  steps,
  backAction,
}: AuthShellProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-(--color-bg) px-(--spacing-4) py-(--spacing-6) text-(--color-text)">
      <Card variant="panel" tone="neutral" padding="lg" className="w-full max-w-(--auth-card-width)">
        <CardBody>
          <Stack gap="6">
            <Stack gap="3" align="center" className="text-center">
              {logo}
              <Text as="h1" family="display" size="xl" weight="semibold" leading="tight">
                {title}
              </Text>
              {subtitle ? (
                <Text size="sm" tone="muted" leading="relaxed">
                  {subtitle}
                </Text>
              ) : null}
              {steps && steps.total > 1 ? (
                <div className="flex justify-center gap-(--spacing-2)" aria-label={`Step ${steps.current} di ${steps.total}`}>
                  {Array.from({ length: steps.total }).map((_, index) => (
                    <span
                      key={index}
                      className={
                        index === steps.current - 1
                          ? "h-(--auth-step-dot) w-(--auth-step-dot-active) rounded-(--radius-full) bg-(--color-primary)"
                          : "h-(--auth-step-dot) w-(--auth-step-dot) rounded-(--radius-full) bg-(--color-border)"
                      }
                    />
                  ))}
                </div>
              ) : null}
            </Stack>
            {backAction}
            <Stack gap="6">{children}</Stack>
          </Stack>
        </CardBody>
      </Card>
    </main>
  );
}

