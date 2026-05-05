"use client";

import { Skeleton } from "@qoovex/ui";

export default function GlobalLoading() {
  return (
    <main className="min-h-dvh bg-bg p-8">
      <div className="w-full max-w-160 space-y-4">
        <Skeleton variant="title" size="md" width="34%" />
        <div className="space-y-2 rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
          <Skeleton variant="text" size="sm" width="92%" />
          <Skeleton variant="text" size="sm" width="88%" />
          <Skeleton variant="text" size="sm" width="84%" />
          <Skeleton variant="text" size="sm" width="90%" />
          <Skeleton variant="text" size="sm" width="80%" />
          <Skeleton variant="text" size="sm" width="86%" />
          <Skeleton variant="text" size="sm" width="82%" />
        </div>
        <Skeleton variant="block" height="2.5rem" width="7rem" radius="full" />
      </div>
    </main>
  );
}
