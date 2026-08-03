"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArchive } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { submitJson } from "../admin-api-client";

export function DeadlineArchiveButton({ deadlineId, title, disabled }: { deadlineId: string; title?: string; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/deadlines/${deadlineId}`, "DELETE");
      setOpen(false);
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setError(null); }} open={open}>
      <DialogTrigger render={<Button disabled={disabled} size="sm" variant="destructive" />}><IconArchive />Archivia</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archivia scadenza</DialogTitle>
          <DialogDescription>La scadenza “{title ?? "selezionata"}” verrà rimossa dalle viste operative. La cronologia audit resta conservata.</DialogDescription>
        </DialogHeader>
        {error ? <Alert variant="destructive"><AlertTitle>Archiviazione non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
        <DialogFooter>
          <DialogClose render={<Button disabled={pending} variant="outline" />}>Annulla</DialogClose>
          <Button disabled={pending} onClick={archive} variant="destructive">{pending ? "Archiviazione..." : "Archivia scadenza"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
