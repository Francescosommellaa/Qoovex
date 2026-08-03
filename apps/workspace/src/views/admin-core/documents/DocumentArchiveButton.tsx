"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconArchive } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Spinner } from "@qoovex/ui/components/spinner";
import { submitJson } from "../admin-api-client";

export function DocumentArchiveButton({ documentId, redirectToList = false, disabled }: { documentId: string; redirectToList?: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/documents/${documentId}`, "DELETE");
      if (redirectToList) router.push("/documents");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Archiviazione del documento</AlertTitle><AlertDescription>Il documento verrà escluso dalle viste operative standard. I file non vengono esposti o cancellati da questa azione.</AlertDescription></Alert>
      {error ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Archiviazione non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button className="w-full sm:w-fit" disabled={disabled || pending} onClick={() => void archive()} type="button" variant="destructive">
        {pending ? <><Spinner />Archiviazione…</> : <><IconArchive />Archivia documento</>}
      </Button>
    </div>
  );
}
