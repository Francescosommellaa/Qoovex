"use client";

import { IconCheck } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";
import { jobSiteOperationalPhaseLabels, jobSiteOperationalPhases } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import { jobSiteDetailsHref } from "@shared/lib/job-site-routes";
import { formatDateInput } from "@/views/workspace/workspace-format";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface JobSiteFormProps {
  mode: "create" | "update";
  jobSite?: WorkspaceJobSiteRecord;
  disabled?: boolean;
  layout?: "page" | "dialog";
  onCreated?: (jobSite: WorkspaceJobSiteRecord) => void;
}

export function JobSiteForm({ mode, jobSite, disabled, layout = "page", onCreated }: JobSiteFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function completeCreation(created: WorkspaceJobSiteRecord) {
    router.refresh();
    if (onCreated) onCreated(created);
    else router.push(jobSiteDetailsHref(created));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formValue(formData, "name"),
      address: nullableFormValue(formData, "address"),
      clientName: nullableFormValue(formData, "clientName"),
      startDate: nullableFormValue(formData, "startDate"),
      endDate: nullableFormValue(formData, "endDate"),
      notes: nullableFormValue(formData, "notes"),
      operationalPhase: formValue(formData, "operationalPhase"),
    };
    try {
      const response = await submitJson<WorkspaceJobSiteRecord>(
        mode === "create" ? "/api/job-sites" : `/api/job-sites/${jobSite?.id}`,
        mode === "create" ? "POST" : "PATCH",
        payload,
      );
      if (mode === "create") completeCreation(response);
      else router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  const submitButton = (
    <Button className="w-full sm:w-auto" disabled={disabled || pending} type="submit">
      {mode === "create" ? <IconCheck aria-hidden="true" /> : null}
      {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi cantiere" : "Aggiorna cantiere"}
    </Button>
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {error ? <FieldError>{error}</FieldError> : null}

      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${mode}-job-site-phase`}>Fase operativa</FieldLabel>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" defaultValue={jobSite?.operationalPhase ?? "PREPARATION"} disabled={disabled || pending} id={`${mode}-job-site-phase`} name="operationalPhase" required>
              {jobSiteOperationalPhases.map((phase) => <option key={phase} value={phase}>{jobSiteOperationalPhaseLabels[phase]}</option>)}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-job-site-name`}>Nome cantiere</FieldLabel>
            <Input autoFocus defaultValue={jobSite?.name ?? ""} disabled={disabled || pending} id={`${mode}-job-site-name`} maxLength={160} minLength={2} name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-job-site-client`}>Committente</FieldLabel>
            <Input defaultValue={jobSite?.clientName ?? ""} disabled={disabled || pending} id={`${mode}-job-site-client`} maxLength={160} name="clientName" />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor={`${mode}-job-site-address`}>Indirizzo</FieldLabel>
          <Input autoComplete="street-address" defaultValue={jobSite?.address ?? ""} disabled={disabled || pending} id={`${mode}-job-site-address`} maxLength={500} name="address" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${mode}-job-site-start-date`}>Data inizio</FieldLabel>
            <Input defaultValue={formatDateInput(jobSite?.startDate)} disabled={disabled || pending} id={`${mode}-job-site-start-date`} name="startDate" type="date" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-job-site-end-date`}>Data fine</FieldLabel>
            <Input defaultValue={formatDateInput(jobSite?.endDate)} disabled={disabled || pending} id={`${mode}-job-site-end-date`} name="endDate" type="date" />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor={`${mode}-job-site-notes`}>Note operative non sensibili</FieldLabel>
          <Textarea defaultValue={jobSite?.notes ?? ""} disabled={disabled || pending} id={`${mode}-job-site-notes`} maxLength={4000} name="notes" rows={3} />
          <FieldDescription>Non inserire dati sanitari, fiscali, coordinate o segreti.</FieldDescription>
        </Field>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{submitButton}</DialogFooter> : <div className="flex justify-end">{submitButton}</div>}
    </form>
  );
}
