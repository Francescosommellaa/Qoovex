"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconFilePlus, IconInfoCircle, IconUpload } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { formValue, nullableFormValue, submitFormData, submitJson } from "../admin-api-client";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";
import { workspaceResultHref } from "@/views/workspace/workspace-flow-context";
import { documentDetailsHref } from "@shared/lib/document-routes";

type DocumentContextType = "ORGANIZATION" | "WORKER" | "JOB_SITE";

const EMPTY_VALUE = "__none__";

interface DocumentCreateFlowProps {
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  initialContext: WorkspaceCreationContext | null;
  origin: WorkspaceOrigin | null;
  layout?: "page" | "dialog";
}

export function DocumentCreateFlow({ documentTypes, workers, jobSites, initialContext, origin, layout = "page" }: DocumentCreateFlowProps) {
  const router = useRouter();
  const inheritedType: DocumentContextType = initialContext?.type === "worker" ? "WORKER" : initialContext?.type === "job-site" ? "JOB_SITE" : "ORGANIZATION";
  const [contextType, setContextType] = useState<DocumentContextType>(inheritedType);
  const [selectedTypeId, setSelectedTypeId] = useState(EMPTY_VALUE);
  const [createdDocument, setCreatedDocument] = useState<WorkspaceDocumentRecord | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedType = useMemo(() => documentTypes.find((item) => item.id === selectedTypeId), [documentTypes, selectedTypeId]);

  async function upload(documentId: string, file: File) {
    const uploadData = new FormData();
    uploadData.set("file", file);
    await submitFormData(`/api/documents/${documentId}/versions`, uploadData);
  }

  function resultHref(document: WorkspaceDocumentRecord, result: "document-created" | "file-uploaded") {
    if (origin === "dashboard") return workspaceResultHref(origin, result, document.id);
    return documentDetailsHref(document, new URLSearchParams({ result }));
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "upload";
    const file = formData.get("file");
    const title = formValue(formData, "title") || selectedType?.name;
    const payload: Record<string, unknown> = {
      title,
      documentTypeId: selectedTypeId === EMPTY_VALUE ? null : selectedTypeId,
      ownerType: contextType,
      status: "TO_REVIEW",
      expiryDate: nullableFormValue(formData, "expiryDate"),
      notes: nullableFormValue(formData, "notes"),
    };
    if (contextType === "WORKER") payload.workerId = formValue(formData, "workerId");
    if (contextType === "JOB_SITE") payload.jobSiteId = formValue(formData, "jobSiteId");

    try {
      const document = await submitJson<WorkspaceDocumentRecord>("/api/documents", "POST", payload);
      setCreatedDocument(document);
      if (intent === "later" || !(file instanceof File) || file.size === 0) {
        router.push(resultHref(document, "document-created"));
        router.refresh();
        return;
      }
      await upload(document.id, file);
      router.push(resultHref(document, "file-uploaded"));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Salvataggio non riuscito.");
      setPending(false);
    }
  }

  async function retryUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createdDocument) return;
    setPending(true);
    setError(null);
    const file = new FormData(event.currentTarget).get("file");
    try {
      if (!(file instanceof File) || !file.size) throw new Error("Scegli un file da caricare.");
      await upload(createdDocument.id, file);
      router.push(resultHref(createdDocument, "file-uploaded"));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Caricamento non riuscito.");
      setPending(false);
    }
  }

  const formDisabled = pending;
  const contextLocked = layout === "dialog" && Boolean(initialContext);
  const ownerTypeOptions = [
    { label: "Azienda", value: "ORGANIZATION" },
    { label: "Lavoratore", value: "WORKER" },
    { label: "Cantiere", value: "JOB_SITE" },
  ];
  const documentTypeOptions = [
    { label: "Senza tipo", value: EMPTY_VALUE },
    ...documentTypes.filter((item) => item.appliesTo === contextType).map((item) => ({ label: item.name, value: item.id })),
  ];
  const workerOptions = workers.map((item) => ({ label: item.displayName, value: item.id }));
  const jobSiteOptions = jobSites.map((item) => ({ label: item.name, value: item.id }));

  if (createdDocument) {
    const retryButton = <Button className="w-full sm:w-auto" disabled={pending} type="submit">{pending ? <><Spinner />Caricamento…</> : <><IconUpload aria-hidden="true" />Riprova caricamento</>}</Button>;
    return (
      <form className="grid gap-4" onSubmit={retryUpload}>
        <Alert variant="warning"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Documento salvato, file non caricato</AlertTitle><AlertDescription>{error ? `${error} Puoi riprovare senza creare un duplicato.` : "Scegli nuovamente il file e completa il caricamento."}</AlertDescription></Alert>
        <Field><FieldLabel htmlFor="retry-document-file">File da caricare</FieldLabel><Input accept="application/pdf,image/jpeg,image/png,image/webp" className="h-10 py-1.5" id="retry-document-file" name="file" required type="file" /></Field>
        {layout === "dialog" ? <DialogFooter>{retryButton}</DialogFooter> : <div className="flex justify-end">{retryButton}</div>}
      </form>
    );
  }

  const actions = (
    <>
      <Button className="w-full sm:w-auto" disabled={pending} name="intent" type="submit" value="later" variant="outline">Salva e carica più tardi</Button>
      <Button className="w-full sm:w-auto" disabled={pending} name="intent" type="submit" value="upload">{pending ? <><Spinner />Salvataggio…</> : <><IconFilePlus aria-hidden="true" />Salva documento</>}</Button>
    </>
  );

  return (
    <form className="grid gap-4" onSubmit={create}>
      {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {initialContext && layout === "page" ? <Alert variant="info"><IconInfoCircle aria-hidden="true" /><AlertTitle>Contesto già selezionato</AlertTitle><AlertDescription>Il documento sarà collegato al punto da cui sei partito.</AlertDescription></Alert> : null}
      {initialContext?.type === "worker" ? <input name="workerId" type="hidden" value={initialContext.id} /> : null}
      {initialContext?.type === "job-site" ? <input name="jobSiteId" type="hidden" value={initialContext.id} /> : null}

      <FieldGroup className="gap-4">
        {!contextLocked ? <div className="grid gap-4 sm:grid-cols-2">
          <Field><FieldLabel htmlFor="create-document-owner-type">Collegato a</FieldLabel><Select disabled={Boolean(initialContext)} items={ownerTypeOptions} onValueChange={(value) => { if (!value) return; setContextType(value as DocumentContextType); setSelectedTypeId(EMPTY_VALUE); }} value={contextType}><SelectTrigger className="h-10 w-full" id="create-document-owner-type"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{ownerTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
          {contextType === "WORKER" ? <Field><FieldLabel htmlFor="create-document-worker">Lavoratore</FieldLabel><Select defaultValue={initialContext?.type === "worker" ? initialContext.id : undefined} items={workerOptions} name={initialContext?.type === "worker" ? undefined : "workerId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "worker"} id="create-document-worker"><SelectValue placeholder="Seleziona lavoratore" /></SelectTrigger><SelectContent><SelectGroup>{workers.map((worker) => <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
          {contextType === "JOB_SITE" ? <Field><FieldLabel htmlFor="create-document-job-site">Cantiere</FieldLabel><Select defaultValue={initialContext?.type === "job-site" ? initialContext.id : undefined} items={jobSiteOptions} name={initialContext?.type === "job-site" ? undefined : "jobSiteId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "job-site"} id="create-document-job-site"><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger><SelectContent><SelectGroup>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
        </div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field><FieldLabel htmlFor="create-document-type">Tipo documento</FieldLabel><Select items={documentTypeOptions} onValueChange={(value) => value && setSelectedTypeId(value)} value={selectedTypeId}><SelectTrigger className="h-10 w-full" disabled={formDisabled} id="create-document-type"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{documentTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
          <Field><FieldLabel htmlFor="create-document-title">Titolo {selectedType ? "opzionale" : "documento"}</FieldLabel><Input autoFocus defaultValue="" disabled={formDisabled} id="create-document-title" maxLength={160} minLength={2} name="title" required={!selectedType} /></Field>
          <Field><FieldLabel htmlFor="create-document-file">File</FieldLabel><Input accept="application/pdf,image/jpeg,image/png,image/webp" className="h-10 py-1.5" disabled={formDisabled} id="create-document-file" name="file" type="file" /><FieldDescription>PDF o immagine. Puoi caricarlo anche in seguito.</FieldDescription></Field>
          <Field><FieldLabel htmlFor="create-document-expiry">Scadenza {selectedType?.requiresExpiryDate ? "richiesta" : "opzionale"}</FieldLabel><Input disabled={formDisabled} id="create-document-expiry" name="expiryDate" required={selectedType?.requiresExpiryDate} type="date" /></Field>
        </div>

        <details className="group rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-medium">Altre opzioni</summary>
          <Field className="mt-4"><FieldLabel htmlFor="create-document-notes">Note operative</FieldLabel><Textarea disabled={formDisabled} id="create-document-notes" maxLength={4000} name="notes" rows={4} /><FieldDescription>Il documento viene salvato come da verificare. Lo stato può essere aggiornato in seguito.</FieldDescription></Field>
        </details>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{actions}</DialogFooter> : <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">{actions}</div>}
    </form>
  );
}
