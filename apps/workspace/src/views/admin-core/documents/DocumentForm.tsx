"use client";

import type { DocumentOwnerType, DocumentStatus } from "@qoovex/types";
import { documentStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconCheck, IconPlus } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import { documentStatusLabels, formatDateInput } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { documentDetailsHref } from "@shared/lib/document-routes";

interface DocumentFormProps {
  mode: "create" | "update";
  document?: WorkspaceDocumentRecord;
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
}

const EMPTY_VALUE = "__none__";
const ownerTypeOptions = [
  { value: "ORGANIZATION", label: "Azienda" },
  { value: "WORKER", label: "Lavoratore" },
  { value: "JOB_SITE", label: "Cantiere" },
] as const;

export function DocumentForm({ mode, document, documentTypes, workers, jobSites, disabled }: DocumentFormProps) {
  const router = useRouter();
  const [ownerType, setOwnerType] = useState<DocumentOwnerType>(document?.ownerType ?? "ORGANIZATION");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(event.currentTarget);
    const selectedOwnerType = (formValue(formData, "ownerType") ?? "ORGANIZATION") as DocumentOwnerType;
    const documentTypeId = nullableFormValue(formData, "documentTypeId");
    const payload: Record<string, unknown> = {
      title: formValue(formData, "title"),
      documentTypeId: documentTypeId === EMPTY_VALUE ? null : documentTypeId,
      ownerType: selectedOwnerType,
      status: formValue(formData, "status"),
      expiryDate: nullableFormValue(formData, "expiryDate"),
      notes: nullableFormValue(formData, "notes"),
    };
    if (selectedOwnerType === "WORKER") payload.workerId = formValue(formData, "workerId");
    if (selectedOwnerType === "JOB_SITE") payload.jobSiteId = formValue(formData, "jobSiteId");

    try {
      const response = await submitJson<WorkspaceDocumentRecord>(mode === "create" ? "/api/documents" : `/api/documents/${document?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      setSuccess(true);
      if (mode === "create") router.push(documentDetailsHref(response));
      else router.replace(documentDetailsHref(response));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  const formDisabled = disabled || pending;
  const documentTypeOptions = [{ value: EMPTY_VALUE, label: "Senza tipo" }, ...documentTypes.map((item) => ({ value: item.id, label: item.name }))];
  const workerOptions = workers.map((item) => ({ value: item.id, label: item.displayName }));
  const jobSiteOptions = jobSites.map((item) => ({ value: item.id, label: item.name }));
  const statusOptions = documentStatuses.filter((status): status is Exclude<DocumentStatus, "ARCHIVED"> => status !== "ARCHIVED").map((status) => ({ value: status, label: documentStatusLabels[status] }));

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      {error ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {success ? <Alert role="status" variant="success"><IconCheck /><AlertTitle>Documento aggiornato</AlertTitle><AlertDescription>Le informazioni registrate e l’indirizzo della pagina sono stati aggiornati.</AlertDescription></Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`document-title-${document?.id ?? "new"}`}>Titolo documento</FieldLabel>
          <Input defaultValue={document?.title ?? ""} disabled={formDisabled} id={`document-title-${document?.id ?? "new"}`} maxLength={160} minLength={2} name="title" required />
        </Field>

        <Field>
          <FieldLabel htmlFor={`document-type-${document?.id ?? "new"}`}>Tipo documento configurato</FieldLabel>
          <Select defaultValue={document?.documentTypeId ?? EMPTY_VALUE} items={documentTypeOptions} name="documentTypeId">
            <SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`document-type-${document?.id ?? "new"}`}><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value={EMPTY_VALUE}>Senza tipo</SelectItem>{documentTypes.map((documentType) => <SelectItem key={documentType.id} value={documentType.id}>{documentType.name}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor={`document-owner-${document?.id ?? "new"}`}>Collegato a</FieldLabel>
          <Select items={[...ownerTypeOptions]} name="ownerType" onValueChange={(value) => value && setOwnerType(value as DocumentOwnerType)} value={ownerType}>
            <SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`document-owner-${document?.id ?? "new"}`}><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="ORGANIZATION">Azienda</SelectItem><SelectItem value="WORKER">Lavoratore</SelectItem><SelectItem value="JOB_SITE">Cantiere</SelectItem></SelectGroup></SelectContent>
          </Select>
          <FieldDescription>Il contesto determina dove il documento viene mostrato.</FieldDescription>
        </Field>

        {ownerType === "WORKER" ? (
          <Field data-invalid={!workers.length}>
            <FieldLabel htmlFor={`document-worker-${document?.id ?? "new"}`}>Lavoratore</FieldLabel>
            <Select defaultValue={document?.workerId ?? undefined} items={workerOptions} name="workerId" required>
              <SelectTrigger className="h-10 w-full" disabled={formDisabled || !workers.length} id={`document-worker-${document?.id ?? "new"}`}><SelectValue placeholder="Seleziona lavoratore" /></SelectTrigger>
              <SelectContent><SelectGroup>{workers.map((worker) => <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            {!workers.length ? <FieldError>Nessun lavoratore disponibile.</FieldError> : null}
          </Field>
        ) : null}

        {ownerType === "JOB_SITE" ? (
          <Field data-invalid={!jobSites.length}>
            <FieldLabel htmlFor={`document-job-site-${document?.id ?? "new"}`}>Cantiere</FieldLabel>
            <Select defaultValue={document?.jobSiteId ?? undefined} items={jobSiteOptions} name="jobSiteId" required>
              <SelectTrigger className="h-10 w-full" disabled={formDisabled || !jobSites.length} id={`document-job-site-${document?.id ?? "new"}`}><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger>
              <SelectContent><SelectGroup>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            {!jobSites.length ? <FieldError>Nessun cantiere disponibile.</FieldError> : null}
          </Field>
        ) : null}

        {mode === "update" ? (
          <Field>
            <FieldLabel htmlFor={`document-status-${document?.id}`}>Stato documentale</FieldLabel>
            <Select defaultValue={document?.status ?? "TO_REVIEW"} items={statusOptions} name="status">
              <SelectTrigger className="h-10 w-full" disabled={formDisabled} id={`document-status-${document?.id}`}><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor={`document-expiry-${document?.id ?? "new"}`}>Scadenza registrata</FieldLabel>
          <Input defaultValue={formatDateInput(document?.expiryDate)} disabled={formDisabled} id={`document-expiry-${document?.id ?? "new"}`} name="expiryDate" type="date" />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor={`document-notes-${document?.id ?? "new"}`}>Note operative</FieldLabel>
        <Textarea defaultValue={document?.notes ?? ""} disabled={formDisabled} id={`document-notes-${document?.id ?? "new"}`} maxLength={4000} name="notes" rows={5} />
        <FieldDescription>Inserisci solo informazioni utili alla gestione operativa.</FieldDescription>
      </Field>

      <Button className="w-full sm:w-fit" disabled={formDisabled || (ownerType === "WORKER" && !workers.length) || (ownerType === "JOB_SITE" && !jobSites.length)} type="submit">
        {pending ? <><Spinner />Salvataggio…</> : mode === "create" ? <><IconPlus />Aggiungi documento</> : <><IconCheck />Aggiorna documento</>}
      </Button>
    </form>
  );
}
