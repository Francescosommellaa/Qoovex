"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconCheck, IconCopy, IconFileDescription, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { Input } from "@qoovex/ui/components/input";
import { Label } from "@qoovex/ui/components/label";
import { Spinner } from "@qoovex/ui/components/spinner";
import { cn } from "@qoovex/ui/lib/utils";
import { submitJson } from "../admin-api-client";

function archiveHref(notice: "restored" | "deleted" | "cleanup-pending", preserveDashboardOrigin: boolean) {
  const params = new URLSearchParams({ notice });
  if (preserveDashboardOrigin) params.set("origin", "dashboard");
  return `/documents/archive?${params.toString()}`;
}

export function ArchivedDocumentActions({
  className,
  documentId,
  documentTitle,
  preserveDashboardOrigin,
}: {
  className?: string;
  documentId: string;
  documentTitle: string;
  preserveDashboardOrigin: boolean;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"restore" | "delete" | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [titleCopied, setTitleCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function restore() {
    setPendingAction("restore");
    setError(null);
    try {
      await submitJson(`/api/documents/${documentId}/archive`, "PATCH");
      router.push(archiveHref("restored", preserveDashboardOrigin));
      router.refresh();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Ripristino non riuscito.");
      setPendingAction(null);
    }
  }

  async function permanentlyDelete() {
    if (confirmation !== documentTitle) return;
    setPendingAction("delete");
    setError(null);
    try {
      const result = await submitJson<{ deleted: true; storageCleanupPending: boolean }>(`/api/documents/${documentId}/archive`, "DELETE");
      setDeleteOpen(false);
      router.push(archiveHref(result.storageCleanupPending ? "cleanup-pending" : "deleted", preserveDashboardOrigin));
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Eliminazione definitiva non riuscita.");
      setPendingAction(null);
    }
  }

  async function copyDocumentTitle() {
    try {
      await navigator.clipboard.writeText(documentTitle);
      setTitleCopied(true);
    } catch {
      setTitleCopied(false);
    }
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Button disabled={pendingAction !== null} onClick={() => void restore()} type="button">
          {pendingAction === "restore" ? <><Spinner />Ripristino...</> : <><IconRefresh />Ripristina</>}
        </Button>

        <Dialog
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) {
              setConfirmation("");
              setTitleCopied(false);
            }
          }}
          open={deleteOpen}
        >
          <DialogTrigger render={<Button disabled={pendingAction !== null} type="button" variant="destructive" />}>
            <IconTrash />Elimina definitivamente
          </DialogTrigger>
          <DialogContent className="border border-destructive/50 bg-popover ring-destructive/15 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Elimina documento</DialogTitle>
              <DialogDescription>
                Il documento e i file caricati verranno eliminati definitivamente.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                <IconFileDescription className="size-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">Documento</span>
                <strong
                  className="mt-0.5 block select-all [overflow-wrap:anywhere] text-sm font-medium"
                  id={`delete-document-title-${documentId}`}
                >
                  {documentTitle}
                </strong>
              </div>
              <Button
                aria-label={titleCopied ? "Titolo copiato" : "Copia titolo documento"}
                onClick={() => void copyDocumentTitle()}
                size="icon"
                type="button"
                variant="outline"
              >
                {titleCopied ? <IconCheck /> : <IconCopy />}
              </Button>
              <span aria-live="polite" className="sr-only">{titleCopied ? "Titolo del documento copiato." : ""}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`delete-document-${documentId}`}>Per confermare, incolla il titolo esatto</Label>
              <Input
                aria-describedby={`delete-document-title-${documentId}`}
                aria-invalid={confirmation.length > 0 && confirmation !== documentTitle}
                autoComplete="off"
                id={`delete-document-${documentId}`}
                onChange={(event) => setConfirmation(event.currentTarget.value)}
                placeholder="Incolla qui il titolo del documento"
                value={confirmation}
              />
            </div>

            <DialogFooter className="border-destructive/35 bg-muted/40">
              <Button
                className={confirmation === documentTitle ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-muted text-muted-foreground hover:bg-muted"}
                disabled={confirmation !== documentTitle || pendingAction !== null}
                onClick={() => void permanentlyDelete()}
                type="button"
                variant="destructive"
              >
                {pendingAction === "delete" ? <><Spinner />Eliminazione...</> : <><IconTrash />Elimina definitivamente</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <Alert variant="destructive">
          <IconAlertTriangle />
          <AlertTitle>Operazione non riuscita</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
