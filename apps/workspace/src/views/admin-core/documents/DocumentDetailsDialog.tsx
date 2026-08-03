"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconDownload,
  IconFileDescription,
  IconRefresh,
  IconUpload,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { cn } from "@qoovex/ui/lib/utils";
import { DocumentVersionUploadForm } from "./DocumentVersionUploadForm";
import { documentStatusLabels, fileSizeLabel, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentRecord, WorkspaceDocumentVersionRecord } from "@/views/workspace/workspace-records";

interface DocumentDetailsDialogProps {
  canUploadDocumentVersions: boolean;
  className?: string;
  contextLabel: string;
  document: WorkspaceDocumentRecord;
  fullPageHref?: string;
  includeFiles?: boolean;
  intentUpload: boolean;
  readOnly?: boolean;
}

function responseMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") return payload.message;
  return "Non riusciamo a caricare i file del documento.";
}

function statusVariant(status: WorkspaceDocumentRecord["status"]) {
  if (status === "ARCHIVED") return "outline" as const;
  const tone = statusTone(status);
  if (tone === "danger") return "destructive" as const;
  if (tone === "good") return "success" as const;
  if (tone === "warning") return "warning" as const;
  return "info" as const;
}

export function DocumentDetailsDialog({
  canUploadDocumentVersions,
  className,
  contextLabel,
  document,
  fullPageHref,
  includeFiles = true,
  intentUpload,
  readOnly = false,
}: DocumentDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<WorkspaceDocumentVersionRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadVersions() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${document.id}/versions`, { cache: "no-store" });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload));
      if (!Array.isArray(payload)) throw new Error("La risposta dei file non è valida.");
      setVersions(payload as WorkspaceDocumentVersionRecord[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Non riusciamo a caricare i file del documento.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && includeFiles && versions === null && !loading) void loadVersions();
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={`${intentUpload ? "Scegli" : "Apri"} ${document.title}`}
            className={className}
            type="button"
            variant={intentUpload ? "default" : "outline"}
          />
        }
      >
        {intentUpload ? <IconUpload /> : null}
        {intentUpload ? "Scegli documento" : "Apri documento"}
      </DialogTrigger>

      <DialogContent className="max-h-[min(92dvh,52rem)] sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(document.status)}>{documentStatusLabels[document.status]}</Badge>
            {intentUpload ? <Badge variant="info"><IconUpload />Selezione file</Badge> : null}
          </div>
          <DialogTitle className="[overflow-wrap:anywhere] text-lg leading-snug">{document.title}</DialogTitle>
          <DialogDescription className={readOnly ? "sr-only" : undefined}>{readOnly ? "Riepilogo del documento archiviato." : "Dettagli registrati e file disponibili, senza lasciare la lista Documenti."}</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-2">
          <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">Contesto</dt><dd className="mt-1 [overflow-wrap:anywhere] font-medium">{contextLabel}</dd></div>
          <div><dt className="text-xs font-medium text-muted-foreground">Scadenza registrata</dt><dd className="mt-1 font-medium">{document.expiryDate ? <time dateTime={document.expiryDate}>{formatDate(document.expiryDate)}</time> : "Non registrata"}</dd></div>
          <div><dt className="text-xs font-medium text-muted-foreground">Creato</dt><dd className="mt-1 font-medium">{document.createdAt ? <time dateTime={document.createdAt}>{formatDate(document.createdAt)}</time> : "Non registrato"}</dd></div>
          <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-1 font-medium">{document.updatedAt ? <time dateTime={document.updatedAt}>{formatDate(document.updatedAt)}</time> : "Non registrato"}</dd></div>
        </dl>

        <section aria-labelledby={`document-notes-${document.id}`} className="w-full rounded-lg border p-3">
          <h3 className="text-sm font-medium" id={`document-notes-${document.id}`}>Note operative</h3>
          <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed text-muted-foreground">{document.notes || "Nessuna nota operativa registrata."}</p>
        </section>

        {!readOnly && intentUpload && canUploadDocumentVersions ? (
          <section aria-labelledby={`document-upload-${document.id}`} className="rounded-lg border p-3">
            <div className="mb-3">
              <h3 className="text-sm font-medium" id={`document-upload-${document.id}`}>Aggiungi file</h3>
              <p className="mt-1 text-sm text-muted-foreground">Il file viene collegato al documento e resta da verificare.</p>
            </div>
            <DocumentVersionUploadForm documentId={document.id} onUploaded={loadVersions} />
          </section>
        ) : null}

        {includeFiles ? <section aria-labelledby={`document-files-${document.id}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium" id={`document-files-${document.id}`}>File caricati</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Download protetto, senza URL permanenti.</p>
            </div>
            {versions ? <Badge variant="outline">{versions.length} file</Badge> : null}
          </div>

          {loading && versions === null ? (
            <div aria-label="Caricamento file" className="grid gap-2" role="status">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <IconAlertTriangle />
              <AlertTitle>File non disponibili</AlertTitle>
              <AlertDescription>
                <p>{error}</p>
                <Button className="mt-3" onClick={() => void loadVersions()} size="sm" type="button" variant="outline"><IconRefresh />Riprova</Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {versions && versions.length === 0 && !error ? (
            <Empty className="min-h-36 border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><IconFileDescription /></EmptyMedia>
                <EmptyTitle>Nessun file caricato</EmptyTitle>
                <EmptyDescription>Il documento esiste, ma non contiene ancora versioni file.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {versions && versions.length > 0 ? (
            <ul className="m-0 grid list-none gap-2 p-0">
              {versions.map((version) => (
                <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={version.id}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><IconFileDescription className="size-4" /></span>
                    <div className="min-w-0">
                      <strong className="block [overflow-wrap:anywhere] text-sm font-medium">{version.originalFileName}</strong>
                      <span className="mt-1 block text-xs text-muted-foreground">{fileSizeLabel(version.size)} · caricato il {formatDate(version.createdAt)}</span>
                    </div>
                  </div>
                  <a className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full sm:w-auto")} href={`/api/documents/${document.id}/versions/${version.id}/download`}><IconDownload />Scarica</a>
                </li>
              ))}
            </ul>
          ) : null}
        </section> : null}

        {!readOnly && fullPageHref ? (
          <DialogFooter>
            <Link className={cn(buttonVariants(), "w-full sm:w-auto")} data-link="plain" href={fullPageHref}>Gestisci documento<IconArrowUpRight data-icon="inline-end" /></Link>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
