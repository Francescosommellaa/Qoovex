"use client";

import type { DocumentPackageStatus } from "@qoovex/types";
import { documentPackageStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconPackageExport } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import { documentPackageStatusLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentPackageRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface DocumentPackageFormProps {
  mode: "create" | "update";
  documentPackage?: WorkspaceDocumentPackageRecord;
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
  initialJobSiteId?: string;
  layout?: "page" | "dialog";
}

const EMPTY_VALUE = "__none__";

export function DocumentPackageForm({ mode, documentPackage, jobSites, disabled, initialJobSiteId, layout = "page" }: DocumentPackageFormProps) {
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
      title: formValue(formData, "title"),
      description: nullableFormValue(formData, "description"),
      jobSiteId: jobSiteId === EMPTY_VALUE ? null : jobSiteId,
      status: formValue(formData, "status") ?? "DRAFT",
    };

    try {
      const response = await submitJson<WorkspaceDocumentPackageRecord>(mode === "create" ? "/api/document-packages" : `/api/document-packages/${documentPackage?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/document-packages/${response.id}?result=share-created`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  const formDisabled = disabled || pending;
  const jobSiteOptions = [{ label: "Nessun cantiere", value: EMPTY_VALUE }, ...jobSites.map((item) => ({ label: item.name, value: item.id }))];
  const statusOptions = documentPackageStatuses
    .filter((status): status is Exclude<DocumentPackageStatus, "ARCHIVED"> => status !== "ARCHIVED")
    .map((value) => ({ label: documentPackageStatusLabels[value], value }));
  const submitButton = (
    <Button className="w-full sm:w-auto" disabled={formDisabled} type="submit">
      {pending ? <><Spinner />Salvataggio…</> : <><IconPackageExport aria-hidden="true" />{mode === "create" ? "Continua alla selezione" : "Aggiorna condivisione"}</>}
    </Button>
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {initialJobSiteId ? <input name="jobSiteId" type="hidden" value={initialJobSiteId} /> : null}

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={`${mode}-document-package-title`}>Titolo condivisione</FieldLabel>
          <Input autoFocus defaultValue={documentPackage?.title ?? ""} disabled={formDisabled} id={`${mode}-document-package-title`} maxLength={160} minLength={2} name="title" required />
        </Field>

        {!(layout === "dialog" && initialJobSiteId) ? <Field><FieldLabel htmlFor={`${mode}-document-package-job-site`}>Cantiere collegato</FieldLabel><Select defaultValue={documentPackage?.jobSiteId ?? initialJobSiteId ?? EMPTY_VALUE} items={jobSiteOptions} name={initialJobSiteId ? undefined : "jobSiteId"}><SelectTrigger className="h-10 w-full" disabled={formDisabled || Boolean(initialJobSiteId)} id={`${mode}-document-package-job-site`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value={EMPTY_VALUE}>Nessun cantiere</SelectItem>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {mode === "update" ? <Field><FieldLabel htmlFor={`${mode}-document-package-status`}>Stato pacchetto</FieldLabel><Select defaultValue={documentPackage?.status ?? "DRAFT"} items={statusOptions} name="status"><SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`${mode}-document-package-status`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        <Field>
          <FieldLabel htmlFor={`${mode}-document-package-description`}>Descrizione</FieldLabel>
          <Textarea defaultValue={documentPackage?.description ?? ""} disabled={formDisabled} id={`${mode}-document-package-description`} maxLength={4000} name="description" rows={4} />
        </Field>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{submitButton}</DialogFooter> : <div className="flex justify-end">{submitButton}</div>}
    </form>
  );
}
