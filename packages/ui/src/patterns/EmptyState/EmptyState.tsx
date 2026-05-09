import * as React from "react";
import { Card, CardBody } from "../../components";
import { Stack, Text } from "../../primitives";
import type { EmptyStateProps } from "./EmptyState.types";

export function EmptyState({ title, description, action, icon, ...props }: EmptyStateProps) {
  return (
    <Card variant="panel" tone="neutral" padding="lg" {...props}>
      <CardBody>
        <Stack gap="4" align="center" className="text-center">
          {icon}
          <Text as="h2" family="display" size="lg" weight="semibold">
            {title}
          </Text>
          {description ? (
            <Text size="sm" tone="muted" leading="relaxed">
              {description}
            </Text>
          ) : null}
          {action}
        </Stack>
      </CardBody>
    </Card>
  );
}

