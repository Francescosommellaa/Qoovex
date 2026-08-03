"use client";

import type { ReactNode } from "react";
import {
  IconBuilding,
  IconCalendarPlus,
  IconChecklist,
  IconPackageExport,
  IconPhotoPlus,
} from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { ChecklistForm } from "../checklists/ChecklistForm";
import { DeadlineForm } from "../deadlines/DeadlineForm";
import { DocumentPackageForm } from "../document-packages/DocumentPackageForm";
import { DocumentCreateDialog } from "../documents/DocumentCreateDialog";
import { EvidenceForm } from "../evidence/EvidenceForm";
import type {
  WorkspaceCapabilities,
  WorkspaceJobSiteRecord,
} from "@/views/workspace/workspace-records";

interface QuickActionDialogProps {
  children: ReactNode;
  contextLabel: string;
  description: string;
  label: string;
  trigger: ReactNode;
}

function JobSiteContext({ name }: { name: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10"><IconBuilding className="size-4" /></span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">Cantiere selezionato</span>
        <strong className="mt-0.5 block [overflow-wrap:anywhere] font-medium">{name}</strong>
      </span>
    </div>
  );
}

function QuickActionDialog({ children, contextLabel, description, label, trigger }: QuickActionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button className="h-10 sm:h-8" type="button" variant="outline" />}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-h-[min(92dvh,54rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <JobSiteContext name={contextLabel} />
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function JobSiteQuickActions({ capabilities, jobSite }: { capabilities: WorkspaceCapabilities; jobSite: WorkspaceJobSiteRecord }) {
  const jobSites = [jobSite];
  const context = { type: "job-site" as const, id: jobSite.id };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {capabilities.canCreateDocuments ? (
        <DocumentCreateDialog className="h-10 sm:h-8" contextLabel={jobSite.name} initialContext={context} jobSites={jobSites} origin="job-site" workers={[]} />
      ) : null}

      {capabilities.canUploadEvidence ? (
        <QuickActionDialog
          description={`La prova viene registrata direttamente in ${jobSite.name}.`}
          contextLabel={jobSite.name}
          label="Aggiungi prova"
          trigger={<><IconPhotoPlus aria-hidden="true" />Aggiungi prova</>}
        >
          <EvidenceForm checklists={[]} checklistItems={[]} initialContext={context} jobSites={jobSites} layout="dialog" origin="job-site" workers={[]} />
        </QuickActionDialog>
      ) : null}

      {capabilities.canCreateDeadlines ? (
        <QuickActionDialog
          description={`La data viene collegata direttamente a ${jobSite.name}.`}
          contextLabel={jobSite.name}
          label="Aggiungi scadenza"
          trigger={<><IconCalendarPlus aria-hidden="true" />Aggiungi scadenza</>}
        >
          <DeadlineForm documents={[]} initialContext={context} jobSites={jobSites} layout="dialog" mode="create" origin="job-site" workers={[]} />
        </QuickActionDialog>
      ) : null}

      {capabilities.canManageChecklists ? (
        <QuickActionDialog
          description={`La checklist viene preparata per ${jobSite.name}.`}
          contextLabel={jobSite.name}
          label="Crea checklist"
          trigger={<><IconChecklist aria-hidden="true" />Crea checklist</>}
        >
          <ChecklistForm initialJobSiteId={jobSite.id} jobSites={jobSites} layout="dialog" mode="create" />
        </QuickActionDialog>
      ) : null}

      {capabilities.canManagePackages ? (
        <QuickActionDialog
          description={`La condivisione viene preparata nel contesto di ${jobSite.name}.`}
          contextLabel={jobSite.name}
          label="Prepara condivisione"
          trigger={<><IconPackageExport aria-hidden="true" />Prepara condivisione</>}
        >
          <DocumentPackageForm initialJobSiteId={jobSite.id} jobSites={jobSites} layout="dialog" mode="create" />
        </QuickActionDialog>
      ) : null}
    </div>
  );
}
