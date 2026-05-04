"use client";

import { Card, CardBody, CardHeader, Skeleton } from "@qoovex/ui";

export default function GlobalLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-6">
      <Card variant="panel" tone="neutral" className="w-full max-w-120">
        <CardHeader className="gap-3">
          <Skeleton variant="title" size="md" width="46%" />
          <Skeleton variant="text" size="sm" width="74%" />
        </CardHeader>
        <CardBody className="gap-3">
          <Skeleton variant="block" height="3rem" radius="lg" />
          <Skeleton variant="block" height="3rem" radius="lg" />
          <Skeleton variant="block" height="2.75rem" radius="full" tone="primary" />
        </CardBody>
      </Card>
    </main>
  );
}
