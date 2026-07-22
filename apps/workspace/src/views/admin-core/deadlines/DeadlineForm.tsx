"use client";

import { deadlineStatuses, deadlineSourceTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconCalendarPlus } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import { deadlineStatusLabels, formatDateInput, formatDateTimeInput } from "@/views/workspace/workspace-format";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";

export function DeadlineForm({
  mode,
  deadline,
  documents,
  workers,
  jobSites,
  disabled,
  initialContext = null,
  origin = null,
  layout = "page",
}: {
  mode: "create" | "update";
  deadline?: WorkspaceDeadlineRecord;
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
  initialContext?: WorkspaceCreationContext | null;
  origin?: WorkspaceOrigin | null;
  layout?: "page" | "dialog";
}) {
  const router = useRouter();
  const initialRelation = initialContext?.type === "document" ? "document" : initialContext?.type === "worker" ? "worker" : initialContext?.type === "job-site" ? "job-site" : deadline?.documentId ? "document" : deadline?.workerId ? "worker" : deadline?.jobSiteId ? "job-site" : "none";
  const [relation, setRelation] = useState<"none" | "document" | "worker" | "job-site">(initialRelation);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedSourceType = relation === "document" ? "DOCUMENT" : mode === "update" ? formValue(formData, "sourceType") ?? "MANUAL" : "MANUAL";
    const payload: Record<string, unknown> = {
      title: formValue(formData, "title"),
      dueDate: formValue(formData, "dueDate"),
      sourceType: selectedSourceType,
      documentId: relation === "document" ? formValue(formData, "documentId") : null,
      workerId: relation === "worker" ? nullableFormValue(formData, "workerId") : null,
      jobSiteId: relation === "job-site" ? nullableFormValue(formData, "jobSiteId") : null,
      status: mode === "update" ? formValue(formData, "status") : undefined,
      remindAt: nullableFormValue(formData, "remindAt"),
    };

    try {
      const response = await submitJson<WorkspaceDeadlineRecord>(mode === "create" ? "/api/deadlines" : `/api/deadlines/${deadline?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      if (mode === "create") {
        if (origin === "dashboard") router.push(`/dashboard?updated=${response.id}`);
        else if (initialContext?.type === "job-site") router.push(`/job-sites/${initialContext.id}`);
        else if (initialContext?.type === "worker") router.push(`/workers/${initialContext.id}`);
        else if (initialContext?.type === "document") router.push(`/documents/${initialContext.id}`);
        else router.push(`/deadlines?updated=${response.id}`);
      } else {
        router.push(`/deadlines?updated=${response.id}`);
      }
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  const formDisabled = disabled || pending;
  const contextLocked = layout === "dialog" && Boolean(initialContext);
  const relationOptions = [
    { label: "Nessun collegamento", value: "none" },
    { label: "Documento", value: "document" },
    { label: "Lavoratore", value: "worker" },
    { label: "Cantiere", value: "job-site" },
  ];
  const sourceTypeOptions = deadlineSourceTypes.map((value) => ({
    label: value === "DOCUMENT" ? "Documento" : value === "CHECKLIST" ? "Checklist" : value === "MANUAL" ? "Manuale" : "Altro",
    value,
  }));
  const statusOptions = deadlineStatuses
    .filter((status) => status !== "ARCHIVED")
    .map((value) => ({ label: deadlineStatusLabels[value], value }));
  const submitButton = (
    <Button className="w-full sm:w-auto" disabled={formDisabled} type="submit">
      {pending ? <><Spinner />Salvataggio…</> : <><IconCalendarPlus aria-hidden="true" />{mode === "create" ? "Aggiungi scadenza" : "Aggiorna scadenza"}</>}
    </Button>
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {initialContext?.type === "document" ? <input name="documentId" type="hidden" value={initialContext.id} /> : null}
      {initialContext?.type === "worker" ? <input name="workerId" type="hidden" value={initialContext.id} /> : null}
      {initialContext?.type === "job-site" ? <input name="jobSiteId" type="hidden" value={initialContext.id} /> : null}

      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${mode}-deadline-title`}>Titolo scadenza</FieldLabel>
            <Input autoFocus defaultValue={deadline?.title ?? ""} disabled={formDisabled} id={`${mode}-deadline-title`} maxLength={160} minLength={2} name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-deadline-date`}>Data scadenza</FieldLabel>
            <Input defaultValue={formatDateInput(deadline?.dueDate)} disabled={formDisabled} id={`${mode}-deadline-date`} name="dueDate" required type="date" />
          </Field>
        </div>

        {mode === "update" ? <Field><FieldLabel htmlFor={`${mode}-deadline-source`}>Origine</FieldLabel><Select defaultValue={deadline?.sourceType ?? "MANUAL"} items={sourceTypeOptions} name="sourceType"><SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`${mode}-deadline-source`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{sourceTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {mode === "create" && !contextLocked ? <Field><FieldLabel htmlFor="create-deadline-relation">Collegato a</FieldLabel><Select disabled={Boolean(initialContext)} items={relationOptions} onValueChange={(value) => value && setRelation(value as typeof relation)} value={relation}><SelectTrigger className="h-10 w-full" id="create-deadline-relation"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{relationOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {relation === "document" && !contextLocked ? <Field><FieldLabel htmlFor={`${mode}-deadline-document`}>Documento collegato</FieldLabel><Select defaultValue={deadline?.documentId ?? (initialContext?.type === "document" ? initialContext.id : undefined)} items={documents.map((item) => ({ label: item.title, value: item.id }))} name={initialContext?.type === "document" ? undefined : "documentId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "document"} id={`${mode}-deadline-document`}><SelectValue placeholder="Seleziona documento" /></SelectTrigger><SelectContent><SelectGroup>{documents.map((document) => <SelectItem key={document.id} value={document.id}>{document.title}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
        {relation === "worker" && !contextLocked ? <Field><FieldLabel htmlFor={`${mode}-deadline-worker`}>Lavoratore collegato</FieldLabel><Select defaultValue={deadline?.workerId ?? (initialContext?.type === "worker" ? initialContext.id : undefined)} items={workers.map((item) => ({ label: item.displayName, value: item.id }))} name={initialContext?.type === "worker" ? undefined : "workerId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "worker"} id={`${mode}-deadline-worker`}><SelectValue placeholder="Seleziona lavoratore" /></SelectTrigger><SelectContent><SelectGroup>{workers.map((worker) => <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
        {relation === "job-site" && !contextLocked ? <Field><FieldLabel htmlFor={`${mode}-deadline-job-site`}>Cantiere collegato</FieldLabel><Select defaultValue={deadline?.jobSiteId ?? (initialContext?.type === "job-site" ? initialContext.id : undefined)} items={jobSites.map((item) => ({ label: item.name, value: item.id }))} name={initialContext?.type === "job-site" ? undefined : "jobSiteId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "job-site"} id={`${mode}-deadline-job-site`}><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger><SelectContent><SelectGroup>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {mode === "update" ? <Field><FieldLabel htmlFor={`${mode}-deadline-status`}>Stato</FieldLabel><Select defaultValue={deadline?.status ?? "SCHEDULED"} items={statusOptions} name="status"><SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`${mode}-deadline-status`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        <Field>
          <FieldLabel htmlFor={`${mode}-deadline-reminder`}>Promemoria</FieldLabel>
          <Input defaultValue={formatDateTimeInput(deadline?.remindAt)} disabled={formDisabled} id={`${mode}-deadline-reminder`} name="remindAt" type="datetime-local" />
        </Field>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{submitButton}</DialogFooter> : <div className="flex justify-end">{submitButton}</div>}
    </form>
  );
}
