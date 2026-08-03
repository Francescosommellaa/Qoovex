"use client";

import { IconArchive } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { FieldError } from "@qoovex/ui/components/field";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";

export function JobSiteArchiveButton({ jobSiteId, redirectToList = false, disabled }: { jobSiteId: string; redirectToList?: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/job-sites/${jobSiteId}`, "DELETE");
      if (redirectToList) router.push("/job-sites");
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
          {pending ? "Archiviazione..." : "Archivia cantiere"}
        </Button>
      </div>
    </div>
  );
}
