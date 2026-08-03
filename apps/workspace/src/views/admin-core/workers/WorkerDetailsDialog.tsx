"use client";

import { IconArrowUpRight, IconAt, IconPhone, IconUser } from "@tabler/icons-react";
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
import { cn } from "@qoovex/ui/lib/utils";
import Link from "next/link";
import { WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { workerDetailsHref } from "@shared/lib/worker-routes";

interface WorkerDetailsDialogProps {
  className?: string;
  canManage: boolean;
  worker: WorkspaceWorkerRecord;
}

export function WorkerDetailsDialog({ className, canManage, worker }: WorkerDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            aria-label={`Apri profilo di ${worker.displayName}`}
            className={className}
            type="button"
            variant="outline"
          />
        }
      >
        <IconUser aria-hidden="true" />
        Apri profilo
      </DialogTrigger>

      <DialogContent className="max-h-[min(92dvh,46rem)] sm:max-w-xl">
        <DialogHeader>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <WorkspaceState label={recordStatusLabels[worker.status]} tone={statusTone(worker.status)} />
          </div>
          <DialogTitle className="[overflow-wrap:anywhere] text-lg leading-snug">{worker.displayName}</DialogTitle>
          <DialogDescription>{worker.roleLabel || "Mansione non indicata"}</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconAt aria-hidden="true" className="size-4" />Email</dt>
            <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] font-medium">
              {worker.email ? <a data-link="quiet" href={`mailto:${worker.email}`}>{worker.email}</a> : "Non registrata"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconPhone aria-hidden="true" className="size-4" />Telefono</dt>
            <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] font-medium">
              {worker.phone ? <a data-link="quiet" href={`tel:${worker.phone}`}>{worker.phone}</a> : "Non registrato"}
            </dd>
          </div>
          <div><dt className="text-xs font-medium text-muted-foreground">Aggiunto</dt><dd className="mt-1 font-medium">{formatDate(worker.createdAt)}</dd></div>
          <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-1 font-medium">{formatDate(worker.updatedAt)}</dd></div>
        </dl>

        <section aria-labelledby={`worker-notes-${worker.id}`} className="rounded-lg border p-3">
          <h3 className="text-sm font-medium" id={`worker-notes-${worker.id}`}>Note operative</h3>
          <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed text-muted-foreground">{worker.notes || "Nessuna nota operativa registrata."}</p>
        </section>

        {canManage ? (
          <DialogFooter>
            <Link className={cn(buttonVariants(), "w-full sm:w-auto")} data-link="plain" href={workerDetailsHref(worker)}>
              Gestisci lavoratore
              <IconArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
