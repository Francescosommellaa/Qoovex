"use client";

import { IconArrowUpRight, IconBuilding, IconCalendar, IconMapPin } from "@tabler/icons-react";
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
import { jobSiteOperationalPhaseLabels, legacyJobSiteOperationalPhaseLabel } from "@qoovex/types";
import { jobSiteDetailsHref } from "@shared/lib/job-site-routes";
import { WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface JobSiteDetailsDialogProps {
  canManage: boolean;
  className?: string;
  jobSite: WorkspaceJobSiteRecord;
}

export function JobSiteDetailsDialog({ canManage, className, jobSite }: JobSiteDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={(
          <Button
            aria-label={`Apri dettagli di ${jobSite.name}`}
            className={className}
            type="button"
            variant="outline"
          />
        )}
      >
        <IconBuilding aria-hidden="true" />
        Apri cantiere
      </DialogTrigger>

      <DialogContent className="max-h-[min(92dvh,46rem)] sm:max-w-xl">
        <DialogHeader>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <WorkspaceState label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} />
            <WorkspaceState label={jobSite.operationalPhase ? jobSiteOperationalPhaseLabels[jobSite.operationalPhase] : legacyJobSiteOperationalPhaseLabel} tone="info" />
          </div>
          <DialogTitle className="[overflow-wrap:anywhere] text-lg leading-snug">{jobSite.name}</DialogTitle>
          <DialogDescription>{jobSite.clientName || "Committente non indicato"}</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconMapPin aria-hidden="true" className="size-4" />Indirizzo</dt>
            <dd className="mt-1 [overflow-wrap:anywhere] font-medium">{jobSite.address || "Non registrato"}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconCalendar aria-hidden="true" className="size-4" />Inizio</dt>
            <dd className="mt-1 font-medium">{formatDate(jobSite.startDate)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconCalendar aria-hidden="true" className="size-4" />Fine</dt>
            <dd className="mt-1 font-medium">{formatDate(jobSite.endDate)}</dd>
          </div>
          <div><dt className="text-xs font-medium text-muted-foreground">Creato</dt><dd className="mt-1 font-medium">{formatDate(jobSite.createdAt)}</dd></div>
          <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-1 font-medium">{formatDate(jobSite.updatedAt)}</dd></div>
        </dl>

        <section aria-labelledby={`job-site-notes-${jobSite.id}`} className="rounded-lg border p-3">
          <h3 className="text-sm font-medium" id={`job-site-notes-${jobSite.id}`}>Note operative</h3>
          <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed text-muted-foreground">{jobSite.notes || "Nessuna nota operativa registrata."}</p>
        </section>

        <DialogFooter>
          <Link className={cn(buttonVariants(), "w-full sm:w-auto")} data-link="plain" href={jobSiteDetailsHref(jobSite)}>
            {canManage ? "Gestisci cantiere" : "Apri attività cantiere"}
            <IconArrowUpRight aria-hidden="true" data-icon="inline-end" />
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
