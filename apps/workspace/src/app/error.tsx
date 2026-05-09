"use client";

import { Button, EmptyState, PageSection } from "@qoovex/ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageSection width="content" spacing="16">
      <EmptyState
        title="Qualcosa non ha funzionato"
        description="Non siamo riusciti a completare la richiesta. Riprova tra qualche istante."
        action={
          <Button type="button" variant="primary" size="md" onClick={reset}>
            Riprova
          </Button>
        }
      />
    </PageSection>
  );
}
