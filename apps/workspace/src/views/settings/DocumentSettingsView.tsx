"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DocumentCategoryKey, DocumentOwnerType, DocumentSensitivity } from "@qoovex/types";
import { documentCategoryRegistry, documentSensitivityLabels } from "@qoovex/types";
import { IconAlertTriangle, IconCircleCheck, IconFileSettings, IconLock } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import Link from "next/link";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";
import { DocumentRequirementsPanel } from "@/views/admin-core/documents/DocumentRequirementsPanel";
import { submitJson } from "@/views/admin-core/admin-api-client";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";
import { documentDetailsHref } from "@shared/lib/document-routes";

const areas: Array<{ ownerType: DocumentOwnerType; label: string; description: string }> = [
  { ownerType: "ORGANIZATION", label: "Azienda", description: "Tipi e categorie collegati all'Azienda attiva." },
  { ownerType: "WORKER", label: "Lavoratori", description: "Tipi e categorie collegati ai profili lavoratore." },
  { ownerType: "JOB_SITE", label: "Cantieri", description: "Tipi e categorie collegati ai cantieri." },
];

function categoriesFor(ownerType: DocumentOwnerType, includeUnavailable = true) {
  return Object.values(documentCategoryRegistry).filter((category) => category.appliesTo === ownerType && (includeUnavailable || category.availableForNewDocuments));
}

export function DocumentSettingsView({
  canManage,
  documentTypes,
  documents,
  jobSites,
}: {
  canManage: boolean;
  documentTypes: WorkspaceDocumentTypeRecord[];
  documents: WorkspaceDocumentRecord[];
  jobSites: WorkspaceJobSiteRecord[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newArea, setNewArea] = useState<DocumentOwnerType>("ORGANIZATION");
  const [newCategory, setNewCategory] = useState<DocumentCategoryKey>("COMPANY_IDENTITY_REGISTRATIONS");
  const unclassifiedTypes = documentTypes.filter((type) => type.categoryKey === "UNCLASSIFIED");
  const unclassifiedDocuments = documents.filter((document) => !document.documentTypeId || document.categoryKey === "UNCLASSIFIED");
  const availableNewCategories = useMemo(() => categoriesFor(newArea, false), [newArea]);

  async function createType(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const sensitivity: DocumentSensitivity = newCategory === "WORKER_FITNESS_JUDGMENT" ? "HEALTH_JUDGMENT" : "STANDARD";
      await submitJson("/api/document-types", "POST", {
        name: formData.get("name"),
        description: formData.get("description") || null,
        appliesTo: newArea,
        categoryKey: newCategory,
        sensitivity,
        requiresExpiryDate: formData.get("requiresExpiryDate") === "on",
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Creazione tipo documento non riuscita.");
    } finally {
      setPending(false);
    }
  }

  async function classifyType(type: WorkspaceDocumentTypeRecord, formData: FormData) {
    const categoryKey = String(formData.get("categoryKey")) as DocumentCategoryKey;
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/document-types/${type.id}`, "PATCH", {
        categoryKey,
        sensitivity: categoryKey === "WORKER_FITNESS_JUDGMENT" ? "HEALTH_JUDGMENT" : "STANDARD",
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Classificazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Impostazioni documenti" description="Gestisci tipi e requisiti dentro categorie organizzative stabili. Le categorie non definiscono obblighi normativi." />
      {error ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Operazione non completata</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}

      {areas.map((area) => <section aria-labelledby={`settings-${area.ownerType}`} className="grid gap-3" key={area.ownerType}><div><h2 className="text-lg font-medium" id={`settings-${area.ownerType}`}>{area.label}</h2><p className="mt-1 text-sm text-muted-foreground">{area.description}</p></div><div className="grid gap-3 xl:grid-cols-2">{categoriesFor(area.ownerType).map((category) => { const types = documentTypes.filter((type) => type.categoryKey === category.key); return <Card key={category.key} size="sm"><CardHeader><CardTitle><h3>{category.label}</h3></CardTitle><CardDescription>{category.description}</CardDescription><CardAction>{category.availableForNewDocuments ? <Badge variant="outline">{types.length} tipi</Badge> : <Badge variant="warning"><IconLock />Non disponibile</Badge>}</CardAction></CardHeader><CardContent className="grid gap-2">{!types.length ? <p className="text-sm text-muted-foreground">Nessun tipo configurato.</p> : types.map((type) => <article className="rounded-lg border p-3" key={type.id}><div className="flex flex-wrap items-start justify-between gap-2"><div><strong className="text-sm font-medium">{type.name}</strong><p className="mt-1 text-xs text-muted-foreground">{type.requiresExpiryDate ? "Scadenza richiesta" : "Scadenza facoltativa"} · {documentSensitivityLabels[type.sensitivity]}</p></div><Badge variant="outline">{type.documentCount ?? 0} documenti</Badge></div></article>)}</CardContent></Card>; })}</div></section>)}

      {canManage ? <Card size="sm"><CardHeader><CardTitle><h2>Aggiungi tipo documento</h2></CardTitle><CardDescription>Macroarea e categoria restano parte della classificazione, non vengono dedotte dal nome.</CardDescription></CardHeader><CardContent><form action={createType} className="grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field><FieldLabel htmlFor="new-document-type-area">Macroarea</FieldLabel><Select disabled={pending} items={areas.map((area) => ({ label: area.label, value: area.ownerType }))} onValueChange={(value) => { if (!value) return; const next = value as DocumentOwnerType; setNewArea(next); setNewCategory(categoriesFor(next, false)[0]!.key); }} value={newArea}><SelectTrigger className="w-full" id="new-document-type-area"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{areas.map((area) => <SelectItem key={area.ownerType} value={area.ownerType}>{area.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Field><FieldLabel htmlFor="new-document-type-category">Categoria</FieldLabel><Select disabled={pending} items={availableNewCategories.map((category) => ({ label: category.label, value: category.key }))} onValueChange={(value) => value && setNewCategory(value as DocumentCategoryKey)} value={newCategory}><SelectTrigger className="w-full" id="new-document-type-category"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{availableNewCategories.map((category) => <SelectItem key={category.key} value={category.key}>{category.label}</SelectItem>)}</SelectGroup></SelectContent></Select><FieldDescription>{documentCategoryRegistry[newCategory].description}</FieldDescription></Field><Field><FieldLabel htmlFor="new-document-type-name">Nome</FieldLabel><Input disabled={pending} id="new-document-type-name" maxLength={120} minLength={2} name="name" required /></Field><Field><FieldLabel>Sensibilità</FieldLabel><Input disabled readOnly value={documentSensitivityLabels[newCategory === "WORKER_FITNESS_JUDGMENT" ? "HEALTH_JUDGMENT" : "STANDARD"]} /></Field></div><Field><FieldLabel htmlFor="new-document-type-description">Descrizione opzionale</FieldLabel><Textarea disabled={pending} id="new-document-type-description" maxLength={2000} name="description" rows={3} /></Field><div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><Checkbox name="requiresExpiryDate" />Scadenza richiesta</label><Button disabled={pending} type="submit">{pending ? <><Spinner />Salvataggio…</> : "Salva tipo"}</Button></div></form></CardContent></Card> : null}

      <section aria-labelledby="unclassified" className="grid gap-3" id="unclassified"><div><h2 className="text-lg font-medium">Da classificare</h2><p className="mt-1 text-sm text-muted-foreground">Dati preesistenti mantenuti visibili senza attribuire automaticamente una categoria.</p></div><Card size="sm"><CardHeader><CardTitle><h3>Tipi senza categoria</h3></CardTitle><CardDescription>{unclassifiedTypes.length} tipi richiedono una scelta autorizzata.</CardDescription></CardHeader><CardContent className="grid gap-3">{!unclassifiedTypes.length ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><IconCircleCheck className="size-4" />Nessun tipo da classificare.</p> : unclassifiedTypes.map((type) => { const legacyCategories = categoriesFor(type.appliesTo as DocumentOwnerType, false); return <form action={classifyType.bind(null, type)} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,1fr)_auto] sm:items-end" key={type.id}><div><strong className="text-sm font-medium">{type.name}</strong><p className="mt-1 text-xs text-muted-foreground">Macroarea bloccata: {areas.find((area) => area.ownerType === type.appliesTo)?.label ?? type.appliesTo}</p></div>{legacyCategories.length ? <Field><FieldLabel htmlFor={`classify-${type.id}`}>Categoria confermata</FieldLabel><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" disabled={pending} id={`classify-${type.id}`} name="categoryKey">{legacyCategories.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}</select></Field> : <p className="text-xs text-muted-foreground">Il tipo preesistente non appartiene a una macroarea canonica: richiede una decisione separata.</p>}{canManage && legacyCategories.length ? <Button disabled={pending} type="submit" variant="outline">Classifica tipo</Button> : <Badge variant="warning"><IconLock />Flusso separato</Badge>}</form>; })}</CardContent></Card><Card size="sm"><CardHeader><CardTitle><h3>Documenti senza tipo classificato</h3></CardTitle><CardDescription>{unclassifiedDocuments.length} documenti restano recuperabili e non sono disponibili nel nuovo flusso di creazione.</CardDescription></CardHeader><CardContent className="grid gap-2">{!unclassifiedDocuments.length ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><IconCircleCheck className="size-4" />Nessun documento da classificare.</p> : unclassifiedDocuments.map((document) => <article className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={document.id}><div><strong className="text-sm font-medium">{document.title}</strong><p className="mt-1 text-xs text-muted-foreground">{document.documentTypeName ?? "Tipo non assegnato"} · {document.categoryLabel}</p></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={documentDetailsHref(document)}><IconFileSettings />Apri e classifica</Link></article>)}</CardContent></Card></section>

      <Card size="sm"><CardHeader><CardTitle><h2>Requisiti documentali</h2></CardTitle><CardDescription>Gli elementi mancanti derivano esclusivamente da requisiti configurati dall'Azienda.</CardDescription></CardHeader><CardContent><DocumentRequirementsPanel canManage={canManage} documentTypes={documentTypes.filter((type) => type.categoryKey !== "UNCLASSIFIED" && type.sensitivity === "STANDARD")} jobSites={jobSites} /></CardContent></Card>

      <Alert variant="info"><IconFileSettings /><AlertTitle>Confine futuro documenti riservati</AlertTitle><AlertDescription>Amministrazione riservata, buste paga e contratti non sono attivi: servono entitlement commerciali e una matrice permessi canonica separata dai ruoli organizzativi.</AlertDescription></Alert>
    </WorkspacePage>
  );
}
