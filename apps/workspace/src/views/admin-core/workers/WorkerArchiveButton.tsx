"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArchive } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { FieldError } from "@qoovex/ui/components/field";
import { submitJson } from "../admin-api-client";

export function WorkerArchiveButton({ workerId, redirectToList = false, disabled }: { workerId: string; redirectToList?: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/workers/${workerId}`, "DELETE");
      if (redirectToList) router.push("/workers");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      {error ? <FieldError>{error}</FieldError> : null}
      <div>
        <Button disabled={disabled || pending} onClick={archive} type="button" variant="destructive">
          <IconArchive aria-hidden="true" />
        {pending ? "Archiviazione..." : "Archivia"}
        </Button>
      </div>
    </div>
  );
}
