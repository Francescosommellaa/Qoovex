"use client";

import type { EvidenceType } from "@qoovex/types";
import { evidenceTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconInfoCircle, IconPhotoPlus } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { formValue, nullableFormValue, submitFormData, submitJson } from "../admin-api-client";
import { evidenceTypeLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";

interface EvidenceFormProps {
  jobSites: WorkspaceJobSiteRecord[];
  workers: WorkspaceWorkerRecord[];
  checklistItems: WorkspaceChecklistItemRecord[];
  checklists: WorkspaceChecklistRecord[];
  disabled?: boolean;
  initialContext?: WorkspaceCreationContext | null;
  origin?: WorkspaceOrigin | null;
  layout?: "page" | "dialog";
}

function checklistItemLabel(item: WorkspaceChecklistItemRecord, checklists: WorkspaceChecklistRecord[]) {
  const checklist = checklists.find((candidate) => candidate.id === item.checklistId);
  return `${checklist?.name ?? "Checklist"} - ${item.label}`;
}

export function EvidenceForm({ jobSites, workers, checklistItems, checklists, disabled, initialContext = null, origin = null, layout = "page" }: EvidenceFormProps) {
  const router = useRouter();
  const [type, setType] = useState<EvidenceType>("PHOTO");
  const availableContextTypes = [jobSites.length ? "job-site" : null, workers.length ? "worker" : null, checklistItems.length ? "checklist-item" : null].filter((value): value is "job-site" | "worker" | "checklist-item" => Boolean(value));
  const initialContextType = initialContext?.type === "job-site" || initialContext?.type === "worker" || initialContext?.type === "checklist-item" ? initialContext.type : availableContextTypes[0] ?? "job-site";
  const [contextType, setContextType] = useState<"job-site" | "worker" | "checklist-item">(initialContextType);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedType = (formValue(formData, "type") ?? "PHOTO") as EvidenceType;

    try {
      if (selectedType === "NOTE") {
        const payload = {
          type: selectedType,
          title: formValue(formData, "title"),
          description: nullableFormValue(formData, "description"),
          jobSiteId: nullableFormValue(formData, "jobSiteId"),
          workerId: nullableFormValue(formData, "workerId"),
          checklistItemId: nullableFormValue(formData, "checklistItemId"),
        };
        const response = await submitJson<{ evidence: WorkspaceEvidenceRecord }>("/api/evidence", "POST", payload);
        finish(response.evidence.id);
      } else {
        const selectedFile = formData.get("file");
        const cameraFile = formData.get("cameraFile");
        if ((!(selectedFile instanceof File) || selectedFile.size === 0) && cameraFile instanceof File && cameraFile.size > 0) {
          formData.set("file", cameraFile);
        }
        formData.delete("cameraFile");
        const upload = formData.get("file");
        if (!(upload instanceof File) || upload.size === 0) {
          throw new Error(selectedType === "PHOTO" ? "Scegli un’immagine o scatta una foto." : "Scegli un file da caricare.");
        }
        const response = await submitFormData<{ evidence: WorkspaceEvidenceRecord }>("/api/evidence", formData);
        finish(response.evidence.id);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  function finish(evidenceId: string) {
    const result = "result=evidence-created";
    if (origin === "dashboard") router.push(`/dashboard?${result}&updated=${encodeURIComponent(evidenceId)}`);
    else if (initialContext?.type === "job-site") router.push(`/job-sites/${encodeURIComponent(initialContext.id)}?${result}`);
    else if (initialContext?.type === "worker") router.push(`/workers/${encodeURIComponent(initialContext.id)}?${result}`);
    else router.push(`/evidence?${result}`);
    router.refresh();
  }

  const formDisabled = disabled || pending;
  const contextLocked = layout === "dialog" && Boolean(initialContext);
  const evidenceTypeOptions = evidenceTypes.map((value) => ({ label: evidenceTypeLabels[value], value }));
  const contextTypeOptions = availableContextTypes.map((value) => ({ label: value === "job-site" ? "Cantiere" : value === "worker" ? "Lavoratore" : "Voce checklist", value }));
  const jobSiteOptions = jobSites.map((item) => ({ label: item.name, value: item.id }));
  const workerOptions = workers.map((item) => ({ label: item.displayName, value: item.id }));
  const checklistItemOptions = checklistItems.map((item) => ({ label: checklistItemLabel(item, checklists), value: item.id }));
  const submitButton = (
    <Button className="w-full sm:w-auto" disabled={formDisabled || !availableContextTypes.length} type="submit">
      {pending ? <><Spinner />Salvataggio…</> : <><IconPhotoPlus aria-hidden="true" />Salva prova</>}
    </Button>
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {initialContext && layout === "page" ? <Alert variant="info"><IconInfoCircle aria-hidden="true" /><AlertTitle>Contesto già selezionato</AlertTitle><AlertDescription>La prova sarà registrata nel contesto da cui sei partito.</AlertDescription></Alert> : null}
      {initialContext?.type === "job-site" ? <input name="jobSiteId" type="hidden" value={initialContext.id} /> : null}
      {initialContext?.type === "worker" ? <input name="workerId" type="hidden" value={initialContext.id} /> : null}
      {initialContext?.type === "checklist-item" ? <input name="checklistItemId" type="hidden" value={initialContext.id} /> : null}

      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="create-evidence-type">Tipo prova</FieldLabel>
            <Select items={evidenceTypeOptions} name="type" onValueChange={(value) => value && setType(value as EvidenceType)} value={type}>
              <SelectTrigger className="h-10 w-full" disabled={formDisabled} id="create-evidence-type"><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>{evidenceTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="create-evidence-title">Titolo prova</FieldLabel>
            <Input autoFocus disabled={formDisabled} id="create-evidence-title" maxLength={160} minLength={2} name="title" required />
          </Field>
        </div>

        {!initialContext ? <Field><FieldLabel htmlFor="create-evidence-context-type">Registra per</FieldLabel><Select items={contextTypeOptions} onValueChange={(value) => value && setContextType(value as typeof contextType)} value={contextType}><SelectTrigger className="h-10 w-full" disabled={formDisabled} id="create-evidence-context-type"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{contextTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {contextType === "job-site" && !contextLocked ? <Field><FieldLabel htmlFor="create-evidence-job-site">Cantiere</FieldLabel><Select defaultValue={initialContext?.type === "job-site" ? initialContext.id : undefined} items={jobSiteOptions} name={initialContext?.type === "job-site" ? undefined : "jobSiteId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "job-site"} id="create-evidence-job-site"><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger><SelectContent><SelectGroup>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
        {contextType === "worker" && !contextLocked ? <Field><FieldLabel htmlFor="create-evidence-worker">Lavoratore</FieldLabel><Select defaultValue={initialContext?.type === "worker" ? initialContext.id : undefined} items={workerOptions} name={initialContext?.type === "worker" ? undefined : "workerId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "worker"} id="create-evidence-worker"><SelectValue placeholder="Seleziona lavoratore" /></SelectTrigger><SelectContent><SelectGroup>{workers.map((worker) => <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
        {contextType === "checklist-item" && !contextLocked ? <Field><FieldLabel htmlFor="create-evidence-checklist-item">Voce checklist</FieldLabel><Select defaultValue={initialContext?.type === "checklist-item" ? initialContext.id : undefined} items={checklistItemOptions} name={initialContext?.type === "checklist-item" ? undefined : "checklistItemId"} required><SelectTrigger className="h-10 w-full" disabled={formDisabled || initialContext?.type === "checklist-item"} id="create-evidence-checklist-item"><SelectValue placeholder="Seleziona voce" /></SelectTrigger><SelectContent><SelectGroup>{checklistItems.map((item) => <SelectItem key={item.id} value={item.id}>{checklistItemLabel(item, checklists)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}

        {type !== "NOTE" ? (
          <>
            <Field>
              <FieldLabel htmlFor="create-evidence-file">{type === "PHOTO" ? "Scegli immagine" : "File prova"}</FieldLabel>
              <Input accept={type === "PHOTO" ? "image/jpeg,image/png,image/webp" : "application/pdf,image/jpeg,image/png,image/webp"} className="h-10 py-1.5" disabled={formDisabled} id="create-evidence-file" name="file" required={type === "FILE"} type="file" />
              <FieldDescription>{type === "PHOTO" ? "Da computer scegli un’immagine; da mobile puoi usare anche la libreria fotografica. JPEG, PNG o WebP, massimo 4 MB." : "PDF o immagine JPEG, PNG o WebP, massimo 4 MB."}</FieldDescription>
            </Field>
            {type === "PHOTO" ? (
              <Field className="md:hidden">
                <FieldLabel htmlFor="create-evidence-camera">Scatta una foto</FieldLabel>
                <Input accept="image/jpeg,image/png,image/webp" capture="environment" className="h-10 py-1.5" disabled={formDisabled} id="create-evidence-camera" name="cameraFile" type="file" />
                <FieldDescription>Apri la fotocamera posteriore del dispositivo e usa lo scatto come prova.</FieldDescription>
              </Field>
            ) : null}
          </>
        ) : null}

        <Field>
          <FieldLabel htmlFor="create-evidence-description">Descrizione</FieldLabel>
          <Textarea disabled={formDisabled} id="create-evidence-description" maxLength={4000} name="description" rows={4} />
        </Field>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{submitButton}</DialogFooter> : <div className="flex justify-end">{submitButton}</div>}
    </form>
  );
}
