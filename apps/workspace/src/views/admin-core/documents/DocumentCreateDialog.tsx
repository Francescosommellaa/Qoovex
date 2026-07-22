"use client";

import { useRef, useState } from "react";
import { IconAlertTriangle, IconBuilding, IconFilePlus } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";
import type {
  WorkspaceDocumentTypeRecord,
  WorkspaceJobSiteRecord,
  WorkspaceWorkerRecord,
} from "@/views/workspace/workspace-records";
import { DocumentCreateFlow } from "./DocumentCreateFlow";

interface DocumentCreateDialogProps {
  className?: string;
  contextLabel?: string;
  initialContext?: WorkspaceCreationContext | null;
  jobSites: WorkspaceJobSiteRecord[];
  origin?: WorkspaceOrigin | null;
  workers: WorkspaceWorkerRecord[];
}

async function responseError(response: Response) {
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  return payload?.message ?? "Operazione non disponibile. Riprova.";
}

export function DocumentCreateDialog({
  className,
  contextLabel,
  initialContext = null,
  jobSites,
  origin = null,
  workers,
}: DocumentCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<WorkspaceDocumentTypeRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<Promise<void> | null>(null);

  function loadDocumentTypes() {
    if (request.current) return request.current;
    setLoading(true);
    setError(null);
    const nextRequest = (async () => {
      try {
        const response = await fetch("/api/document-types", { cache: "no-store" });
        if (!response.ok) throw new Error(await responseError(response));
        setDocumentTypes(await response.json() as WorkspaceDocumentTypeRecord[]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Non riusciamo a caricare i tipi documento.");
      } finally {
        setLoading(false);
        request.current = null;
      }
    })();
    request.current = nextRequest;
    return nextRequest;
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !documentTypes && !loading) void loadDocumentTypes();
    if (!nextOpen) setError(null);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button className={className} type="button" />}>
        <IconFilePlus aria-hidden="true" />
        Aggiungi documento
      </DialogTrigger>
      <DialogContent className="max-h-[min(92dvh,54rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Aggiungi documento</DialogTitle>
          <DialogDescription>
            {contextLabel ? "Completa le informazioni senza lasciare il cantiere." : "Salva informazioni e file senza lasciare l’elenco documenti."}
          </DialogDescription>
        </DialogHeader>

        {contextLabel ? (
          <div className="flex min-w-0 items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm">
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10"><IconBuilding className="size-4" /></span>
            <span className="min-w-0">
              <span className="block text-xs font-medium text-muted-foreground">Cantiere selezionato</span>
              <strong className="mt-0.5 block [overflow-wrap:anywhere] font-medium">{contextLabel}</strong>
            </span>
          </div>
        ) : null}

        {loading && !documentTypes ? (
          <div aria-label="Caricamento tipi documento" className="grid gap-3" role="status">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <IconAlertTriangle aria-hidden="true" />
            <AlertTitle>Creazione non disponibile</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button onClick={() => void loadDocumentTypes()} type="button" variant="outline">Riprova</Button>
          </Alert>
        ) : null}

        {documentTypes ? (
          <DocumentCreateFlow
            documentTypes={documentTypes}
            initialContext={initialContext}
            jobSites={jobSites}
            layout="dialog"
            origin={origin}
            workers={workers}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
