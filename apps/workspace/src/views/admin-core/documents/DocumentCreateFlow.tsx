"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconAlertTriangle,
  IconBuilding,
  IconBuildingCommunity,
  IconFilePlus,
  IconInfoCircle,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import type { DocumentCategoryKey, DocumentSensitivity } from "@qoovex/types";
import { documentCategoryRegistry, documentSensitivityLabels } from "@qoovex/types";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { nullableFormValue, submitFormData, submitJson } from "../admin-api-client";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";
import { workspaceResultHref } from "@/views/workspace/workspace-flow-context";
import { documentDetailsHref } from "@shared/lib/document-routes";

type DocumentContextType = "ORGANIZATION" | "WORKER" | "JOB_SITE";

interface DocumentCreateFlowProps {
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  initialContext: WorkspaceCreationContext | null;
  origin: WorkspaceOrigin | null;
  canManageTypes?: boolean;
  layout?: "page" | "dialog";
}

const contextOptions = [
  { value: "ORGANIZATION", label: "Azienda", icon: IconBuildingCommunity, description: "Documenti operativi riferiti all'Azienda attiva." },
  { value: "WORKER", label: "Lavoratore", icon: IconUser, description: "Documenti personali e operativi collegati a una persona." },
  { value: "JOB_SITE", label: "Cantiere", icon: IconBuilding, description: "Documenti operativi collegati a uno specifico cantiere." },
] as const;

export function DocumentCreateFlow({
  documentTypes,
  workers,
  jobSites,
  initialContext,
  origin,
  canManageTypes = false,
  layout = "page",
}: DocumentCreateFlowProps) {
  const router = useRouter();
  const inheritedType: DocumentContextType = initialContext?.type === "worker" ? "WORKER" : initialContext?.type === "job-site" ? "JOB_SITE" : "ORGANIZATION";
  const [contextType, setContextType] = useState<DocumentContextType>(inheritedType);
  const [workerId, setWorkerId] = useState(initialContext?.type === "worker" ? initialContext.id : "");
  const [jobSiteId, setJobSiteId] = useState(initialContext?.type === "job-site" ? initialContext.id : "");
  const [categoryKey, setCategoryKey] = useState<DocumentCategoryKey | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [availableTypes, setAvailableTypes] = useState(documentTypes);
  const [customTitle, setCustomTitle] = useState("");
  const [createdDocument, setCreatedDocument] = useState<WorkspaceDocumentRecord | null>(null);
  const [pending, setPending] = useState(false);
  const [typePending, setTypePending] = useState(false);
  const [inlineTypeName, setInlineTypeName] = useState("");
  const [inlineTypeDescription, setInlineTypeDescription] = useState("");
  const [inlineTypeRequiresExpiry, setInlineTypeRequiresExpiry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const contextLocked = Boolean(initialContext);

  const categories = useMemo(
    () => Object.values(documentCategoryRegistry).filter((category) => category.appliesTo === contextType && category.availableForNewDocuments),
    [contextType],
  );
  const compatibleTypes = useMemo(
    () => availableTypes.filter((item) => item.appliesTo === contextType && item.categoryKey === categoryKey && item.categoryKey !== "UNCLASSIFIED" && item.sensitivity !== "RESTRICTED"),
    [availableTypes, categoryKey, contextType],
  );
  const selectedType = compatibleTypes.find((item) => item.id === selectedTypeId) ?? null;
  const contextLabel = contextType === "WORKER"
    ? workers.find((item) => item.id === workerId)?.displayName ?? "Lavoratore da scegliere"
    : contextType === "JOB_SITE"
      ? jobSites.find((item) => item.id === jobSiteId)?.name ?? "Cantiere da scegliere"
      : "Azienda attiva";
  const suggestedTitle = selectedType ? `${selectedType.name} · ${contextLabel}` : "";
  const destinationReady = Boolean(categoryKey && selectedType && (contextType === "ORGANIZATION" || (contextType === "WORKER" ? workerId : jobSiteId)));

  function resetClassification(nextContext: DocumentContextType) {
    setContextType(nextContext);
    setCategoryKey(null);
    setSelectedTypeId("");
    setCustomTitle("");
    if (nextContext !== "WORKER") setWorkerId("");
    if (nextContext !== "JOB_SITE") setJobSiteId("");
  }

  async function upload(documentId: string, file: File) {
    const uploadData = new FormData();
    uploadData.set("file", file);
    await submitFormData(`/api/documents/${documentId}/versions`, uploadData);
  }

  function resultHref(document: WorkspaceDocumentRecord, result: "document-created" | "file-uploaded") {
    if (origin === "dashboard") return workspaceResultHref(origin, result, document.id);
    return documentDetailsHref(document, new URLSearchParams({ result }));
  }

  async function createTypeInline() {
    if (!categoryKey) return;
    setTypePending(true);
    setTypeError(null);
    try {
      const sensitivity: DocumentSensitivity = categoryKey === "WORKER_FITNESS_JUDGMENT" ? "HEALTH_JUDGMENT" : "STANDARD";
      const created = await submitJson<WorkspaceDocumentTypeRecord>("/api/document-types", "POST", {
        name: inlineTypeName,
        description: inlineTypeDescription.trim() || null,
        appliesTo: contextType,
        categoryKey,
        sensitivity,
        requiresExpiryDate: inlineTypeRequiresExpiry,
      });
      setAvailableTypes((current) => [...current, created]);
      setSelectedTypeId(created.id);
      setInlineTypeName("");
      setInlineTypeDescription("");
      setInlineTypeRequiresExpiry(false);
    } catch (cause) {
      setTypeError(cause instanceof Error ? cause.message : "Creazione del tipo non riuscita.");
    } finally {
      setTypePending(false);
    }
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destinationReady || !selectedType || !categoryKey) {
      setError("Completa destinazione, categoria e tipo documento prima di salvare.");
      return;
    }
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "upload";
    const file = formData.get("file");
    const payload: Record<string, unknown> = {
      title: customTitle.trim() || suggestedTitle,
      documentTypeId: selectedType.id,
      ownerType: contextType,
      status: "TO_REVIEW",
      expiryDate: nullableFormValue(formData, "expiryDate"),
      notes: nullableFormValue(formData, "notes"),
    };
    if (contextType === "WORKER") payload.workerId = workerId;
    if (contextType === "JOB_SITE") payload.jobSiteId = jobSiteId;

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

  const finalLabel = categoryKey ? `Salva in ${documentCategoryRegistry[categoryKey].label}` : "Salva documento";
  const actions = (
    <>
      <Button className="w-full sm:w-auto" disabled={pending || !destinationReady} name="intent" type="submit" value="later" variant="outline">Salva e carica più tardi</Button>
      <Button className="w-full sm:w-auto" disabled={pending || !destinationReady} name="intent" type="submit" value="upload">{pending ? <><Spinner />Salvataggio…</> : <><IconFilePlus aria-hidden="true" />{finalLabel}</>}</Button>
    </>
  );

  return (
    <form className="grid gap-5" onSubmit={create}>
      {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Salvataggio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {contextLocked ? <Alert variant="info"><IconInfoCircle aria-hidden="true" /><AlertTitle>Destinazione bloccata</AlertTitle><AlertDescription>Il documento resterà collegato al contesto da cui hai avviato il flusso.</AlertDescription></Alert> : null}

      <FieldGroup className="gap-5">
        <section aria-labelledby="document-destination-heading" className="grid gap-3">
          <div><Badge variant="outline">1</Badge><h3 className="mt-2 font-medium" id="document-destination-heading">Dove va il documento?</h3></div>
          <div className="grid gap-2 sm:grid-cols-3">
            {contextOptions.map((option) => {
              const Icon = option.icon;
              const selected = contextType === option.value;
              return <Button aria-pressed={selected} className="h-auto min-h-24 items-start justify-start whitespace-normal p-3 text-left" disabled={pending || contextLocked} key={option.value} onClick={() => resetClassification(option.value)} type="button" variant={selected ? "secondary" : "outline"}><Icon className="mt-0.5 shrink-0" /><span><strong className="block">{option.label}</strong><span className="mt-1 block text-xs font-normal text-muted-foreground">{option.description}</span></span></Button>;
            })}
          </div>
          {contextType === "WORKER" ? <Field><FieldLabel htmlFor="create-document-worker">2. A quale lavoratore appartiene?</FieldLabel><Select disabled={pending || contextLocked} items={workers.map((item) => ({ label: item.displayName, value: item.id }))} onValueChange={(value) => setWorkerId(value ?? "")} value={workerId || null}><SelectTrigger className="h-10 w-full" id="create-document-worker"><SelectValue placeholder="Seleziona lavoratore" /></SelectTrigger><SelectContent><SelectGroup>{workers.map((worker) => <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
          {contextType === "JOB_SITE" ? <Field><FieldLabel htmlFor="create-document-job-site">2. A quale cantiere appartiene?</FieldLabel><Select disabled={pending || contextLocked} items={jobSites.map((item) => ({ label: item.name, value: item.id }))} onValueChange={(value) => setJobSiteId(value ?? "")} value={jobSiteId || null}><SelectTrigger className="h-10 w-full" id="create-document-job-site"><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger><SelectContent><SelectGroup>{jobSites.map((jobSite) => <SelectItem key={jobSite.id} value={jobSite.id}>{jobSite.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
          {contextType === "ORGANIZATION" ? <p className="text-sm text-muted-foreground">2. La destinazione precisa è l'Azienda attiva.</p> : null}
        </section>

        <section aria-labelledby="document-category-heading" className="grid gap-3">
          <div><Badge variant="outline">3</Badge><h3 className="mt-2 font-medium" id="document-category-heading">In quale categoria rientra?</h3></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((category) => <Button aria-pressed={categoryKey === category.key} className="h-auto min-h-20 items-start justify-start whitespace-normal p-3 text-left" disabled={pending} key={category.key} onClick={() => { setCategoryKey(category.key); setSelectedTypeId(""); setCustomTitle(""); }} type="button" variant={categoryKey === category.key ? "secondary" : "outline"}><span><strong className="block">{category.label}</strong><span className="mt-1 block text-xs font-normal text-muted-foreground">{category.description}</span></span></Button>)}
          </div>
        </section>

        <section aria-labelledby="document-type-heading" className="grid gap-3">
          <div><Badge variant="outline">4</Badge><h3 className="mt-2 font-medium" id="document-type-heading">Che tipo di documento è?</h3></div>
          <Field><FieldLabel htmlFor="create-document-type">Tipo documento</FieldLabel><Select disabled={pending || !categoryKey || !compatibleTypes.length} items={compatibleTypes.map((item) => ({ label: item.name, value: item.id }))} onValueChange={(value) => { setSelectedTypeId(value ?? ""); setCustomTitle(""); }} value={selectedTypeId || null}><SelectTrigger className="h-10 w-full" id="create-document-type"><SelectValue placeholder={categoryKey ? "Seleziona un tipo configurato" : "Scegli prima una categoria"} /></SelectTrigger><SelectContent><SelectGroup>{compatibleTypes.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent></Select><FieldDescription>{categoryKey && !compatibleTypes.length ? canManageTypes ? "Non esistono ancora tipi attivi in questa categoria." : "Il tipo necessario non è ancora configurato. Chiedi all'Owner o a un Collaboratore autorizzato di aggiungerlo." : "Sono mostrati solo i tipi attivi e compatibili."}</FieldDescription></Field>

          {canManageTypes && categoryKey ? <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Non trovi il tipo giusto? Crea un nuovo tipo</summary><div className="mt-4 grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="inline-document-type-name">Nome</FieldLabel><Input disabled={typePending} id="inline-document-type-name" maxLength={120} minLength={2} onChange={(event) => setInlineTypeName(event.currentTarget.value)} value={inlineTypeName} /></Field><Field><FieldLabel>Sensibilità</FieldLabel><Input disabled readOnly value={documentSensitivityLabels[categoryKey === "WORKER_FITNESS_JUDGMENT" ? "HEALTH_JUDGMENT" : "STANDARD"]} /></Field></div><Field><FieldLabel htmlFor="inline-document-type-description">Descrizione opzionale</FieldLabel><Textarea disabled={typePending} id="inline-document-type-description" maxLength={2000} onChange={(event) => setInlineTypeDescription(event.currentTarget.value)} rows={3} value={inlineTypeDescription} /></Field>{typeError ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Tipo non creato</AlertTitle><AlertDescription>{typeError}</AlertDescription></Alert> : null}<div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><input checked={inlineTypeRequiresExpiry} onChange={(event) => setInlineTypeRequiresExpiry(event.currentTarget.checked)} type="checkbox" />Scadenza richiesta</label><Button disabled={typePending || inlineTypeName.trim().length < 2} onClick={() => void createTypeInline()} type="button" variant="outline">{typePending ? <><Spinner />Creazione…</> : "Crea e seleziona tipo"}</Button></div></div></details> : null}
        </section>

        <section aria-labelledby="document-file-heading" className="grid gap-4">
          <div><Badge variant="outline">5</Badge><h3 className="mt-2 font-medium" id="document-file-heading">File e scadenza</h3></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="create-document-file">File</FieldLabel><Input accept="application/pdf,image/jpeg,image/png,image/webp" className="h-10 py-1.5" disabled={pending} id="create-document-file" name="file" type="file" /><FieldDescription>PDF o immagine privata. Puoi caricarlo anche in seguito.</FieldDescription></Field><Field><FieldLabel htmlFor="create-document-expiry">Scadenza registrata dall'utente {selectedType?.requiresExpiryDate ? "· richiesta" : "· opzionale"}</FieldLabel><Input disabled={pending} id="create-document-expiry" name="expiryDate" required={selectedType?.requiresExpiryDate} type="date" /></Field></div>
          {selectedType ? <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Personalizza titolo</summary><Field className="mt-4"><FieldLabel htmlFor="create-document-title">Titolo documento</FieldLabel><Input disabled={pending} id="create-document-title" maxLength={160} minLength={2} onChange={(event) => setCustomTitle(event.currentTarget.value)} placeholder={suggestedTitle} value={customTitle} /><FieldDescription>Se lasci vuoto useremo: {suggestedTitle}</FieldDescription></Field></details> : null}
          <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Aggiungi note operative</summary><Field className="mt-4"><FieldLabel htmlFor="create-document-notes">Note</FieldLabel><Textarea disabled={pending} id="create-document-notes" maxLength={4000} name="notes" rows={3} /></Field></details>
        </section>

        <section aria-labelledby="document-review-heading" className="grid gap-3">
          <div><Badge variant="outline">6</Badge><h3 className="mt-2 font-medium" id="document-review-heading">Controllo della destinazione</h3></div>
          <Card size="sm"><CardContent className="grid gap-2 text-sm"><p className="font-medium">Il documento verrà salvato in:</p><ol className="grid gap-1 text-muted-foreground"><li>{contextOptions.find((item) => item.value === contextType)?.label}</li><li>{contextLabel}</li><li>{categoryKey ? documentCategoryRegistry[categoryKey].label : "Categoria da scegliere"}</li><li className="text-foreground">{selectedType?.name ?? "Tipo da scegliere"}</li></ol><div className="mt-2 flex flex-wrap gap-2"><Badge variant="info">Stato iniziale · Da verificare</Badge>{selectedType && selectedType.sensitivity !== "STANDARD" ? <Badge variant="warning">{documentSensitivityLabels[selectedType.sensitivity]}</Badge> : null}</div></CardContent></Card>
        </section>
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{actions}</DialogFooter> : <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">{actions}</div>}
    </form>
  );
}
