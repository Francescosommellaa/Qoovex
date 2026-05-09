import * as React from "react";
import { Card, CardBody, Skeleton } from "../../components";
import { Stack, Text } from "../../primitives";
import type { LoadingStateProps } from "./LoadingState.types";

export function LoadingState({ title, description, rows = 6, ...props }: LoadingStateProps) {
  return (
    <Card variant="panel" tone="neutral" padding="lg" {...props}>
      <CardBody>
        <Stack gap="4">
          {title || description ? (
            <Stack gap="2">
              {title ? (
                <Text as="h2" family="display" size="lg" weight="semibold">
                  {title}
                </Text>
              ) : null}
              {description ? (
                <Text size="sm" tone="muted" leading="relaxed">
                  {description}
                </Text>
              ) : null}
            </Stack>
          ) : null}
          <Skeleton variant="title" size="md" width="40%" />
          <Stack gap="2">
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton key={index} variant="text" size="sm" width={index % 2 === 0 ? "92%" : "84%"} />
            ))}
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
