"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconShieldLock } from "@tabler/icons-react";
import type { OrganizationAccessPreset, OrganizationPermission, OrganizationResourceType, OrganizationScopeMode } from "@qoovex/types";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { submitJson } from "@/views/admin-core/admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";

interface ResourceOption { id: string; label: string; resourceType: OrganizationResourceType }
interface ResourceOptions { jobSites: ResourceOption[]; workers: ResourceOption[]; documentTypes: ResourceOption[]; documentPackages: ResourceOption[] }
interface MemberAccess {
  id: string;
  preset: OrganizationAccessPreset | null;
  permissionKeys: OrganizationPermission[];
  scopeMode: OrganizationScopeMode;
  expiresAt: string | null;
  accessVersion: number;
  revokedAt: string | null;
  user: { email: string; firstName: string | null; lastName: string | null };
  resourceGrants: Array<{ resourceType: OrganizationResourceType; resourceId: string }>;
}

const presets: OrganizationAccessPreset[] = ["READ_ONLY", "OPERATIONAL_COLLABORATION", "SITE_MANAGER", "DOCUMENT_REVIEWER", "LIMITED_UPLOAD", "CUSTOM"];
const presetLabels: Record<OrganizationAccessPreset, string> = {
  READ_ONLY: "Sola lettura",
  OPERATIONAL_COLLABORATION: "Collaborazione operativa",
  SITE_MANAGER: "Cantieri assegnati",
  DOCUMENT_REVIEWER: "Revisione documenti",
  LIMITED_UPLOAD: "Caricamento limitato",
  CUSTOM: "Personalizzato",
};
const permissionGroups: Array<{ label: string; sensitive?: boolean; values: OrganizationPermission[] }> = [
  { label: "Documenti", values: ["documents:read", "documents:file:read", "documents:upload", "documents:update", "documents:verify", "documents:expiry:manage", "documents:packages:add", "documents:sensitive:read", "documents:archive"] },
  { label: "Lavoratori e cantieri", values: ["workers:read", "workers:create", "workers:update", "workers:archive", "jobSites:read", "jobSites:create", "jobSites:update", "jobSites:archive", "assignments:read", "assignments:manage"] },
  { label: "Controlli operativi", values: ["deadlines:read", "deadlines:manage", "calendar:read", "calendar:manage", "checklists:read", "checklists:manage", "checklists:complete", "evidence:read", "evidence:upload", "evidence:delete"] },
  { label: "Processi", values: ["processes:read", "processes:timeline:read", "processes:decide", "processes:exceptions:resolve", "processes:retry"] },
  { label: "Pacchetti e condivisioni", sensitive: true, values: ["documentPackages:read", "documentPackages:create", "documentPackages:update", "documentPackages:review", "documentPackages:approve", "documentPackages:share", "documentPackages:revoke", "documentPackages:access:read"] },
  { label: "Impostazioni operative", values: ["settings:update"] },
];

export function CollaboratorAccessView({ member, resourceOptions }: { member: MemberAccess; resourceOptions: ResourceOptions }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState<OrganizationAccessPreset | null>(member.preset);
  const [scopeMode, setScopeMode] = useState<OrganizationScopeMode>(member.scopeMode);
  const [permissions, setPermissions] = useState<OrganizationPermission[]>(member.permissionKeys);
  const [grants, setGrants] = useState(member.resourceGrants);
  const [expiresAt, setExpiresAt] = useState(member.expiresAt ? member.expiresAt.slice(0, 16) : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim() || member.user.email;
  const resources = [
    { label: "Cantieri", items: resourceOptions.jobSites },
    { label: "Lavoratori", items: resourceOptions.workers },
    { label: "Categorie documentali", items: resourceOptions.documentTypes },
    { label: "Pacchetti", items: resourceOptions.documentPackages },
  ];
  const diff = useMemo(() => ({
    added: permissions.filter((permission) => !member.permissionKeys.includes(permission)),
    removed: member.permissionKeys.filter((permission) => !permissions.includes(permission)),
    grantsAdded: grants.filter((grant) => !member.resourceGrants.some((current) => current.resourceType === grant.resourceType && current.resourceId === grant.resourceId)),
    grantsRemoved: member.resourceGrants.filter((grant) => !grants.some((current) => current.resourceType === grant.resourceType && current.resourceId === grant.resourceId)),
  }), [grants, member.permissionKeys, member.resourceGrants, permissions]);

  async function save() {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/organization/members", "PATCH", {
        memberId: member.id,
        expectedVersion: member.accessVersion,
        preset,
        permissions,
        scopeMode,
        expiresAt: expiresAt || null,
        grants: scopeMode === "ASSIGNED" ? grants : [],
      });
      router.push("/people/access?result=access-updated");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Aggiornamento non riuscito.");
      setPending(false);
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader title={`Accesso di ${name}`} description="Modifica permessi, perimetro e scadenza. Le modifiche revocano le sessioni correnti e richiedono una nuova autorizzazione." action={<Link className={buttonVariants({ variant: "outline" })} data-link="plain" href="/people/access">Annulla</Link>} />
      <Card><CardContent className="mx-auto grid max-w-4xl gap-5">
        <ol className="grid grid-cols-3 gap-2" aria-label="Avanzamento modifica accesso">{["Perimetro", "Permessi", "Conferma"].map((label, index) => <li key={label}><div className={`h-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} /><p className="mt-2 text-xs text-muted-foreground">{index + 1}. {label}</p></li>)}</ol>
        {error ? <FieldError role="alert">{error}</FieldError> : null}
        {step === 0 ? (
          <div className="grid gap-5">
            <Field>
              <FieldLabel htmlFor="member-preset">Profilo di accesso iniziale</FieldLabel>
              <select className="h-9 rounded-md border bg-background px-3 text-sm" id="member-preset" onChange={(event) => setPreset(event.target.value as OrganizationAccessPreset)} value={preset ?? "CUSTOM"}>
                {presets.map((value) => <option key={value} value={value}>{presetLabels[value]}</option>)}
              </select>
              <FieldDescription>Il profilo descrive la configurazione iniziale; l'autorizzazione usa sempre i permessi persistiti.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Perimetro</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-2">{(["FULL", "ASSIGNED"] as const).map((value) => <button className={`rounded-lg border p-3 text-left text-sm ${scopeMode === value ? "border-primary/40 bg-primary/5" : ""}`} key={value} onClick={() => setScopeMode(value)} type="button">{value === "FULL" ? "Tutta l'Azienda" : "Solo risorse selezionate"}</button>)}</div>
            </Field>
            {scopeMode === "ASSIGNED" ? resources.map((group) => (
              <fieldset className="grid gap-2 rounded-xl border p-4" key={group.label}>
                <legend className="px-1 text-sm font-medium">{group.label}</legend>
                {group.items.length ? <div className="grid gap-2 sm:grid-cols-2">{group.items.map((item) => {
                  const checked = grants.some((grant) => grant.resourceType === item.resourceType && grant.resourceId === item.id);
                  return <label className="flex items-center gap-2 text-sm" key={`${item.resourceType}:${item.id}`}><Checkbox checked={checked} onCheckedChange={(next) => setGrants((current) => next === true ? [...current, { resourceType: item.resourceType, resourceId: item.id }] : current.filter((grant) => grant.resourceType !== item.resourceType || grant.resourceId !== item.id))} />{item.label}</label>;
                })}</div> : <p className="text-sm text-muted-foreground">Nessuna risorsa disponibile.</p>}
              </fieldset>
            )) : null}
            <Field><FieldLabel htmlFor="member-access-expiry">Scadenza accesso opzionale</FieldLabel><Input id="member-access-expiry" onChange={(event) => setExpiresAt(event.target.value)} type="datetime-local" value={expiresAt} /></Field>
          </div>
        ) : null}
        {step === 1 ? <div className="grid gap-4">{permissionGroups.map((group) => <fieldset className={`grid gap-2 rounded-xl border p-4 ${group.sensitive ? "border-warning/50" : ""}`} key={group.label}><legend className="flex items-center gap-2 px-1 text-sm font-medium">{group.sensitive ? <IconShieldLock aria-hidden className="size-4 text-warning" /> : null}{group.label}</legend>{group.sensitive ? <p className="text-sm text-muted-foreground">Approvazione, pubblicazione e revoca sono capacità sensibili: non abilitarle se basta preparare il pacchetto.</p> : null}<div className="grid gap-2 sm:grid-cols-2">{group.values.map((permission) => <label className="flex items-center gap-2 text-sm" key={permission}><Checkbox checked={permissions.includes(permission)} onCheckedChange={(checked) => setPermissions((current) => checked === true ? [...new Set([...current, permission])] : current.filter((item) => item !== permission))} />{permission}</label>)}</div></fieldset>)}</div> : null}
        {step === 2 ? <div className="grid gap-4"><Card size="sm"><CardHeader><CardTitle><h2>Riepilogo modifiche</h2></CardTitle><CardDescription>Il server applica dipendenze, rimuove capacità riservate all'Owner e verifica ogni risorsa nell'Azienda.</CardDescription></CardHeader><CardContent><dl className="grid gap-3 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Perimetro</dt><dd className="text-sm font-medium">{scopeMode === "FULL" ? "Tutta l'Azienda" : `${grants.length} risorse selezionate`}</dd></div><div><dt className="text-xs text-muted-foreground">Scadenza</dt><dd className="text-sm font-medium">{expiresAt || "Nessuna"}</dd></div><div><dt className="text-xs text-muted-foreground">Permessi aggiunti</dt><dd className="text-sm">{diff.added.join(", ") || "Nessuno"}</dd></div><div><dt className="text-xs text-muted-foreground">Permessi rimossi</dt><dd className="text-sm">{diff.removed.join(", ") || "Nessuno"}</dd></div><div><dt className="text-xs text-muted-foreground">Risorse aggiunte</dt><dd className="text-sm">{diff.grantsAdded.length}</dd></div><div><dt className="text-xs text-muted-foreground">Risorse rimosse</dt><dd className="text-sm">{diff.grantsRemoved.length}</dd></div></dl></CardContent></Card></div> : null}
        <div className="flex flex-col-reverse justify-between gap-2 border-t pt-4 sm:flex-row"><Button disabled={pending || step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button" variant="outline"><IconArrowLeft aria-hidden />Indietro</Button>{step < 2 ? <Button disabled={pending} onClick={() => setStep((current) => Math.min(2, current + 1))} type="button">Continua<IconArrowRight aria-hidden /></Button> : <Button disabled={pending} onClick={() => void save()} type="button"><IconCheck aria-hidden />{pending ? "Aggiornamento..." : "Conferma modifiche"}</Button>}</div>
      </CardContent></Card>
    </WorkspacePage>
  );
}
