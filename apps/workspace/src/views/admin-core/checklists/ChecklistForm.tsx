"use client";

import { recordStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconChecklist } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import { recordStatusLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface ChecklistFormProps {
  mode: "create" | "update";
  checklist?: WorkspaceChecklistRecord;
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
  initialJobSiteId?: string;
  layout?: "page" | "dialog";
}

const EMPTY_VALUE = "__none__";

export function ChecklistForm({ mode, checklist, jobSites, disabled, initialJobSiteId, layout = "page" }: ChecklistFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const jobSiteId = nullableFormValue(formData, "jobSiteId");
    const payload = {
      name: formValue(formData, "name"),
      description: nullableFormValue(formData, "description"),
      jobSiteId: jobSiteId === EMPTY_VALUE ? null : jobSiteId,
      status: formValue(formData, "status") ?? "ACTIVE",
    };

    try {
      const response = await submitJson<WorkspaceChecklistRecord>(mode === "create" ? "/api/checklists" : `/api/checklists/${checklist?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/checklists/${response.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  const formDisabled = disabled || pending;
  const statusOptions = recordStatuses
    .filter((status) => status !== "ARCHIVED")
    .map((value) => ({ label: recordStatusLabels[value], value }));
  const jobSiteOptions = [{ label: "Nessun cantiere", value: EMPTY_VALUE }, ...jobSites.map((item) => ({ label: item.name, value: item.id }))];
  const submitButton = (
    <Button className="w-full sm:w-auto" disabled={formDisabled} type="submit">
      {pending ? <><Spinner />Salvataggio…</> : <><IconChecklist aria-hidden="true" />{mode === "create" ? "Crea checklist" : "Aggiorna checklist"}</>}
    </Button>
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {initialJobSiteId ? <input name="jobSiteId" type="hidden" value={initialJobSiteId} /> : null}

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={`${mode}-checklist-name`}>Nome checklist</FieldLabel>
          <Input autoFocus defaultValue={checklist?.name ?? ""} disabled={formDisabled} id={`${mode}-checklist-name`} maxLength={160} minLength={2} name="name" required />
        </Field>

        {!(layout === "dialog" && initialJobSiteId) ? <Field><FieldLabel htmlFor={`${mode}-checklist-job-site`}>Cantiere collegato</FieldLabel><Select defaultValue={checklist?.jobSiteId ?? initialJobSiteId ?? EMPTY_VALUE} items={jobSiteOptions} name={initialJobSiteId ? undefined : "jobSiteId"}><SelectTrigger className="h-10 w-full" disabled={formDisabled || Boolean(initialJobSiteId)} id={`${mode}-checklist-job-site`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value={EMPTY_VALUE}>Nessun cantiere</SelectItem>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {mode === "update" ? <Field><FieldLabel htmlFor={`${mode}-checklist-status`}>Stato</FieldLabel><Select defaultValue={checklist?.status ?? "ACTIVE"} items={statusOptions} name="status"><SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`${mode}-checklist-status`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        <Field>
          <FieldLabel htmlFor={`${mode}-checklist-description`}>Descrizione</FieldLabel>
          <Textarea defaultValue={checklist?.description ?? ""} disabled={formDisabled} id={`${mode}-checklist-description`} maxLength={4000} name="description" rows={4} />
        </Field>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{submitButton}</DialogFooter> : <div className="flex justify-end">{submitButton}</div>}
    </form>
  );
}
