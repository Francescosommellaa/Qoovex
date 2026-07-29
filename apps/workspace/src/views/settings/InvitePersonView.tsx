"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react";
import type { OrganizationAccessPreset, OrganizationPermission, OrganizationResourceType, OrganizationRole, OrganizationScopeMode } from "@qoovex/types";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";
import { submitJson } from "@/views/admin-core/admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";

type InviteRole = Exclude<OrganizationRole, "OWNER">;
const presets: Array<{ value: OrganizationAccessPreset; label: string; description: string; permissions: OrganizationPermission[] }> = [
  { value: "OPERATIONAL_COLLABORATION", label: "Collaborazione operativa", description: "Operatività controllata sulle risorse assegnate.", permissions: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "documents:upload", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:upload", "processes:read", "processes:timeline:read"] },
  { value: "SITE_MANAGER", label: "Cantieri assegnati", description: "Collaborazione operativa limitata ai cantieri assegnati.", permissions: ["organization:read", "workers:read", "jobSites:read", "documents:read", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:upload"] },
  { value: "DOCUMENT_REVIEWER", label: "Revisore documenti", description: "Controlla documenti e preparazione dei pacchetti.", permissions: ["organization:read", "documents:read", "documents:file:read", "documents:update", "documents:verify", "documents:expiry:manage", "documents:packages:add", "documentPackages:read", "documentPackages:review", "processes:read", "processes:timeline:read", "processes:decide"] },
  { value: "LIMITED_UPLOAD", label: "Caricamento limitato", description: "Carica contenuti nel perimetro assegnato.", permissions: ["organization:read", "documents:read", "documents:upload", "evidence:read", "evidence:upload"] },
  { value: "READ_ONLY", label: "Sola lettura", description: "Consulta metadati e file autorizzati senza mutazioni.", permissions: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "deadlines:read", "calendar:read", "documentPackages:read", "processes:read", "processes:timeline:read"] },
];

const permissionGroups: Array<{ label: string; values: OrganizationPermission[] }> = [
  { label: "Organizzazione e persone", values: ["organization:read", "members:read", "workers:read", "workers:create", "workers:update", "jobSites:read", "jobSites:create", "jobSites:update"] },
  { label: "Documenti e controlli", values: ["documents:read", "documents:file:read", "documents:upload", "documents:update", "documents:verify", "documents:expiry:manage", "documents:packages:add", "deadlines:read", "calendar:read"] },
  { label: "Esecuzione operativa", values: ["checklists:read", "checklists:complete", "evidence:read", "evidence:upload", "processes:read", "processes:timeline:read", "processes:decide"] },
  { label: "Condivisioni", values: ["documentPackages:read", "documentPackages:create", "documentPackages:update", "documentPackages:review", "documentPackages:approve", "documentPackages:share"] },
];

interface AccessResourceOption { id: string; label: string; resourceType: OrganizationResourceType }
interface AccessResourceOptions {
  jobSites: AccessResourceOption[];
  workers: AccessResourceOption[];
  documentTypes: AccessResourceOption[];
  documentPackages: AccessResourceOption[];
}

export function InvitePersonView({ invitableRoles, resourceOptions }: { invitableRoles: InviteRole[]; resourceOptions: AccessResourceOptions }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [recipientName, setRecipientName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [preset, setPreset] = useState<OrganizationAccessPreset>(presets[0]!.value);
  const [scopeMode, setScopeMode] = useState<OrganizationScopeMode>("ASSIGNED");
  const [permissions, setPermissions] = useState<OrganizationPermission[]>(presets[0]!.permissions);
  const [accessExpiresAt, setAccessExpiresAt] = useState("");
  const [grants, setGrants] = useState<Array<{ resourceType: OrganizationResourceType; resourceId: string }>>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = presets.find((option) => option.value === preset)!;
  const canInvite = invitableRoles.includes("COLLABORATOR");
  const groupedResources = [
    { label: "Cantieri", items: resourceOptions.jobSites },
    { label: "Lavoratori", items: resourceOptions.workers },
    { label: "Categorie documentali", items: resourceOptions.documentTypes },
    { label: "Pacchetti", items: resourceOptions.documentPackages },
  ];

  function selectPreset(nextPreset: OrganizationAccessPreset) {
    const option = presets.find((item) => item.value === nextPreset)!;
    setPreset(nextPreset);
    setPermissions(option.permissions);
  }

  function next() {
    setError(null);
    if (step === 0 && (!recipientName.trim() || !email.includes("@"))) return setError("Inserisci nome ed email validi.");
    setStep((current) => Math.min(3, current + 1));
  }

  async function invite() {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/organization/invitations", "POST", {
        recipientName, email, message: message || null, role: "COLLABORATOR", preset,
        permissions, scopeMode, accessExpiresAt: accessExpiresAt || null,
        grants: scopeMode === "ASSIGNED" ? grants : [],
        workerId: preset === "LIMITED_UPLOAD" ? grants.find((grant) => grant.resourceType === "WORKER")?.resourceId ?? null : null,
      });
      router.push("/people/access?result=invitation-sent");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invito non riuscito.");
      setPending(false);
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Invita una persona" description="Configura il Collaboratore con perimetro e permessi espliciti. Il lavoratore resta un record operativo separato." action={<Link className={buttonVariants({ variant: "outline" })} data-link="plain" href="/people/access">Annulla</Link>} />
      <Card><CardContent className="mx-auto grid max-w-3xl gap-5">
        <ol className="grid grid-cols-4 gap-2">{["Persona", "Accesso", "Permessi", "Conferma"].map((label, index) => <li key={label}><div className={`h-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} /><p className="mt-2 text-xs text-muted-foreground">{index + 1}. {label}</p></li>)}</ol>
        {error ? <FieldError>{error}</FieldError> : null}
        {step === 0 ? <div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="invite-name">Nome</FieldLabel><Input autoFocus id="invite-name" onChange={(event) => setRecipientName(event.target.value)} value={recipientName} /></Field><Field><FieldLabel htmlFor="invite-email">Email</FieldLabel><Input autoComplete="email" id="invite-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} /></Field><Field className="sm:col-span-2"><FieldLabel htmlFor="invite-message">Messaggio opzionale</FieldLabel><Textarea id="invite-message" maxLength={500} onChange={(event) => setMessage(event.target.value)} value={message} /></Field></div> : null}
         {step === 1 ? <div className="grid gap-4"><div className="grid gap-2 sm:grid-cols-2">{presets.map((option) => <button className={`rounded-xl border p-4 text-left ${preset === option.value ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"}`} key={option.value} onClick={() => selectPreset(option.value)} type="button"><strong className="block text-sm">{option.label}</strong><span className="mt-1 block text-sm text-muted-foreground">{option.description}</span></button>)}</div><Field><FieldLabel>Perimetro</FieldLabel><div className="grid gap-2 sm:grid-cols-2">{(["ASSIGNED", "FULL"] as const).map((value) => <button className={`rounded-lg border p-3 text-left text-sm ${scopeMode === value ? "border-primary/40 bg-primary/5" : ""}`} key={value} onClick={() => setScopeMode(value)} type="button">{value === "ASSIGNED" ? "Solo risorse selezionate" : "Tutta l'Azienda"}</button>)}</div><FieldDescription>Le assegnazioni non ampliano mai i permessi selezionati. Le nuove risorse non vengono incluse automaticamente nello scope selezionato.</FieldDescription></Field>{scopeMode === "ASSIGNED" ? <div className="grid gap-3">{groupedResources.map((group) => <fieldset className="grid gap-2 rounded-xl border p-4" key={group.label}><legend className="px-1 text-sm font-medium">{group.label}</legend>{group.items.length ? <div className="grid gap-2 sm:grid-cols-2">{group.items.map((item) => { const selected = grants.some((grant) => grant.resourceType === item.resourceType && grant.resourceId === item.id); return <label className="flex items-center gap-2 text-sm" key={`${item.resourceType}:${item.id}`}><Checkbox checked={selected} onCheckedChange={(checked) => setGrants((current) => checked === true ? [...current, { resourceType: item.resourceType, resourceId: item.id }] : current.filter((grant) => grant.resourceType !== item.resourceType || grant.resourceId !== item.id))} />{item.label}</label>; })}</div> : <p className="text-sm text-muted-foreground">Nessuna risorsa disponibile.</p>}</fieldset>)}</div> : null}<Field><FieldLabel htmlFor="invite-access-expiry">Scadenza accesso opzionale</FieldLabel><Input id="invite-access-expiry" onChange={(event) => setAccessExpiresAt(event.target.value)} type="datetime-local" value={accessExpiresAt} /></Field></div> : null}
        {step === 2 ? <div className="grid gap-4">{permissionGroups.map((group) => <fieldset className="grid gap-2 rounded-xl border p-4" key={group.label}><legend className="px-1 text-sm font-medium">{group.label}</legend><div className="grid gap-2 sm:grid-cols-2">{group.values.map((permission) => <label className="flex items-center gap-2 text-sm" key={permission}><Checkbox checked={permissions.includes(permission)} onCheckedChange={(checked) => setPermissions((current) => checked === true ? [...new Set([...current, permission])] : current.filter((item) => item !== permission))} />{permission}</label>)}</div></fieldset>)}</div> : null}
         {step === 3 ? <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Persona</dt><dd className="mt-1 text-sm font-medium">{recipientName} · {email}</dd></div><div><dt className="text-xs text-muted-foreground">Profilo</dt><dd className="mt-1 text-sm font-medium">Collaboratore · {selected.label}</dd></div><div><dt className="text-xs text-muted-foreground">Perimetro</dt><dd className="mt-1 text-sm font-medium">{scopeMode === "ASSIGNED" ? `${grants.length} risorse selezionate` : "Tutta l'Azienda"}</dd></div><div><dt className="text-xs text-muted-foreground">Permessi</dt><dd className="mt-1 text-sm font-medium">{permissions.length} selezionati</dd></div><div><dt className="text-xs text-muted-foreground">Esclusioni</dt><dd className="mt-1 text-sm">Nessuna gestione collaboratori; nessun ruolo interno; condivisione esterna solo se selezionata esplicitamente.</dd></div><div><dt className="text-xs text-muted-foreground">Scadenza</dt><dd className="mt-1 text-sm">{accessExpiresAt || "Nessuna"}</dd></div></dl> : null}
        <div className="flex flex-col-reverse justify-between gap-2 border-t pt-4 sm:flex-row"><Button disabled={pending || step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button" variant="outline"><IconArrowLeft aria-hidden />Indietro</Button>{step < 3 ? <Button disabled={pending || !canInvite} onClick={next} type="button">Continua<IconArrowRight aria-hidden /></Button> : <Button disabled={pending || !canInvite} onClick={() => void invite()} type="button"><IconCheck aria-hidden />{pending ? "Invio..." : "Invia invito"}</Button>}</div>
      </CardContent></Card>
    </WorkspacePage>
  );
}
