import * as React from "react";
import { Badge, Card, CardBody } from "../../components";
import { cn } from "../../lib/utils";
import { Stack, Text } from "../../primitives";
import type { FeatureShowcaseProps } from "./FeatureShowcase.types";

export const FeatureShowcase = React.forwardRef<HTMLDivElement, FeatureShowcaseProps>(
  function FeatureShowcase({ items, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1 gap-(--spacing-4) md:grid-cols-2", className)}
        {...props}
      >
        {items.map((item, index) => (
          <Card key={index} variant="panel" tone={item.tone ?? "neutral"} padding="lg">
            <CardBody>
              <Stack gap="4">
                {item.label ? (
                  <Badge variant="soft" tone={item.tone ?? "neutral"} size="sm" iconLeft={item.icon}>
                    {item.label}
                  </Badge>
                ) : null}
                <Text as="h3" family="display" size="lg" weight="semibold" leading="snug">
                  {item.title}
                </Text>
                <Text size="sm" tone="muted" leading="relaxed">
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

