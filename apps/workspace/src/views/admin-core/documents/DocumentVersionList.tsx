"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconArchive, IconDownload, IconFileDescription } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { Spinner } from "@qoovex/ui/components/spinner";
import { cn } from "@qoovex/ui/lib/utils";
import { submitJson } from "../admin-api-client";
import { fileSizeLabel, formatDate } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentVersionRecord } from "@/views/workspace/workspace-records";

export function DocumentVersionList({ documentId, versions, canArchive }: { documentId: string; versions: WorkspaceDocumentVersionRecord[]; canArchive: boolean }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function archive(versionId: string) {
    setPendingId(versionId);
    setError(null);
    try {
      await submitJson(`/api/documents/${documentId}/versions/${versionId}`, "DELETE");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione versione non riuscita.");
    } finally {
      setPendingId(null);
    }
  }

  if (!versions.length) {
    return (
      <Empty className="min-h-44 border">
        <EmptyHeader><EmptyMedia variant="icon"><IconFileDescription /></EmptyMedia><EmptyTitle>Nessun file caricato</EmptyTitle><EmptyDescription>Il documento esiste, ma non contiene ancora versioni file.</EmptyDescription></EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-3">
      {error ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Archiviazione non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      <ul className="m-0 grid list-none gap-2 p-0">
        {versions.map((version) => (
          <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={version.id}>
            <div className="flex min-w-0 items-start gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"><IconFileDescription className="size-4" /></span>
              <div className="min-w-0">
                <strong className="block [overflow-wrap:anywhere] text-sm font-medium">{version.originalFileName}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">{version.mimeType} · {fileSizeLabel(version.size)} · caricato il {formatDate(version.createdAt)}</span>
              </div>
            </div>
            <div className="flex w-full flex-col-reverse gap-2 min-[420px]:flex-row sm:w-auto">
              {canArchive ? (
                <Button disabled={pendingId === version.id} onClick={() => void archive(version.id)} size="sm" type="button" variant="destructive">
                  {pendingId === version.id ? <><Spinner />Archiviazione…</> : <><IconArchive />Archivia</>}
                </Button>
              ) : null}
              <a className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full min-[420px]:w-auto")} href={`/api/documents/${documentId}/versions/${version.id}/download`}><IconDownload />Scarica</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
