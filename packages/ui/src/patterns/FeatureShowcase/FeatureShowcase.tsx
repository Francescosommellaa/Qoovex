import * as React from "react";
import { Badge, Card, CardBody } from "../../components";
import { cn } from "../../lib/utils";
import { Stack, Text } from "../../primitives";
import type { FeatureShowcaseProps } from "./FeatureShowcase.types";

const PASTEL_CLASSES = [
  "bg-(--color-blush-pink)",
  "bg-(--color-mint-green)",
  "bg-(--color-pale-yellow)",
  "bg-(--color-lilac-wash)",
] as const;

export const FeatureShowcase = React.forwardRef<HTMLDivElement, FeatureShowcaseProps>(
  function FeatureShowcase({ items, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 gap-(--spacing-4) md:grid-cols-2 lg:grid-cols-3",
          className,
        )}
        {...props}
      >
        {items.map((item, index) => (
          <Card
            key={index}
            variant="pastel"
            tone={item.tone ?? "neutral"}
            padding="lg"
            className={PASTEL_CLASSES[index % PASTEL_CLASSES.length]}
          >
            <CardBody>
              <Stack gap="4">
                {item.label ? (
                  <Badge
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    iconLeft={item.icon}
                  >
                    {item.label}
                  </Badge>
                ) : null}
                <Text as="h3" textStyle="subheading" weight="medium">
                  {item.title}
                </Text>
                <Text textStyle="body-sm" tone="muted">
                  {item.body}
                </Text>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  },
);

FeatureShowcase.displayName = "FeatureShowcase";
