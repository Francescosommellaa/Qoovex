import * as React from "react";
import { Card, CardBody } from "../../components";
import { cn } from "../../lib/utils";
import { Text } from "../../primitives";
import type { AuthShellProps } from "./AuthShell.types";

function AuthStepIndicator({ steps }: Pick<AuthShellProps, "steps">) {
  if (!steps || steps.total <= 1) return null;

  const items = Array.from({ length: steps.total });
  const hasLabels = Boolean(steps.labels?.some(Boolean));

  if (!hasLabels) {
    return (
      <div
        className="qv-auth-shell__step-dots"
        aria-label={`Step ${steps.current} di ${steps.total}`}
      >
        {items.map((_, index) => {
          const isCurrent = index === steps.current - 1;

          return (
            <span
              key={index}
              className={cn(
                "qv-auth-shell__step-dot",
                isCurrent && "qv-auth-shell__step-dot--current",
              )}
            />
          );
        })}
      </div>
    );
  }

  return (
    <ol
      className="qv-auth-shell__steps"
      aria-label={`Step ${steps.current} di ${steps.total}`}
    >
      {items.map((_, index) => {
        const stepNumber = index + 1;
        const isCurrent = stepNumber === steps.current;
        const isComplete = stepNumber < steps.current;
        const label = steps.labels?.[index] ?? `Step ${stepNumber}`;

        return (
          <li
            key={stepNumber}
            className={cn(
              "qv-auth-shell__step",
              isCurrent && "qv-auth-shell__step--current",
              isComplete && "qv-auth-shell__step--complete",
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="qv-auth-shell__step-marker">{stepNumber}</span>
            <span className="qv-auth-shell__step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  logo,
  steps,
  backAction,
  variant = "card",
  aside,
}: AuthShellProps) {
  const isSplit =
    (variant === "split" || variant === "split-open") && Boolean(aside);
  const isSplitOpen = variant === "split-open" && Boolean(aside);

  return (
    <main
      className={cn(
        "qv-auth-shell",
        isSplit && "qv-auth-shell--split",
        isSplitOpen && "qv-auth-shell--split-open",
      )}
    >
      <div
        className={cn(
          "qv-auth-shell__frame",
          isSplit && "qv-auth-shell__frame--split",
        )}
      >
        <Card
          variant="panel"
          tone="neutral"
          padding="lg"
          className="qv-auth-shell__card"
        >
          <CardBody>
            <div className="qv-auth-shell__content">
              <div className="qv-auth-shell__header">
                {logo}
                <Text as="h1" family="display" size="xl" weight="semibold" leading="tight">
                  {title}
                </Text>
                {subtitle ? (
                  <Text size="sm" tone="muted" leading="relaxed">
                    {subtitle}
                  </Text>
                ) : null}
                {!isSplitOpen ? <AuthStepIndicator steps={steps} /> : null}
              </div>
              {backAction}
              <div className="qv-auth-shell__body">{children}</div>
            </div>
          </CardBody>
        </Card>
        {isSplit ? (
          <aside className="qv-auth-shell__aside" aria-hidden="true">
            {aside}
          </aside>
        ) : null}
      </div>
    </main>
  );
}
