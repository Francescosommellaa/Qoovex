"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconArrowLeft, IconArrowRight, IconCheck, IconMail, IconUser } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";
import { submitJson } from "../admin-api-client";
import type { WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface JobSiteOption { id: string; name: string }
interface DuplicateCheck { emailMatch: { id: string; displayName: string } | null; similarNames: Array<{ id: string; displayName: string }> }
interface Values { displayName: string; roleLabel: string; email: string; phone: string; notes: string }

const steps = ["Dati operativi", "Accesso", "Cantieri", "Riepilogo"] as const;

export function GuidedWorkerCreateFlow({ jobSites, onCreated }: { jobSites: JobSiteOption[]; onCreated: (worker: WorkspaceWorkerRecord) => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ displayName: "", roleLabel: "", email: "", phone: "", notes: "" });
  const [invite, setInvite] = useState(false);
  const [assignLater, setAssignLater] = useState(true);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCheck | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<WorkspaceWorkerRecord | null>(null);
  const [pendingSiteIds, setPendingSiteIds] = useState<string[]>([]);
  const [invitationPending, setInvitationPending] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) { setValues((current) => ({ ...current, [key]: value })); }

  async function continueStep() {
    setError(null);
    if (step === 0 && values.displayName.trim().length < 2) return setError("Inserisci nome e cognome.");
    if (step === 1 && invite && !values.email.trim()) return setError("L'email e obbligatoria per invitare il lavoratore.");
    if (step === 2 && !assignLater && !siteIds.length) return setError("Seleziona almeno un cantiere oppure scegli di farlo piu tardi.");
    if (step === 2) {
      setPending(true);
      try {
        const result = await submitJson<DuplicateCheck>("/api/workers/duplicate-check", "POST", { displayName: values.displayName, email: values.email || null });
        if (result.emailMatch) return setError(`Esiste gia un lavoratore con questa email: ${result.emailMatch.displayName}.`);
        setDuplicates(result);
      } catch (cause) { return setError(cause instanceof Error ? cause.message : "Controllo duplicati non riuscito."); }
      finally { setPending(false); }
    }
    setStep((current) => Math.min(3, current + 1));
  }

  async function finishRemaining(worker: WorkspaceWorkerRecord, sites: string[], mustInvite: boolean) {
    const failedSites: string[] = [];
    for (const jobSiteId of sites) {
      try { await submitJson("/api/resource-assignments/job-site-worker-assignments", "POST", { jobSiteId, workerId: worker.id }); }
      catch { failedSites.push(jobSiteId); }
    }
    let inviteFailed = false;
    if (mustInvite) {
      try {
        await submitJson("/api/organization/invitations", "POST", {
          email: values.email,
          role: "COLLABORATOR",
          preset: "LIMITED_UPLOAD",
          scopeMode: "ASSIGNED",
          permissions: ["organization:read", "documents:read", "documents:upload", "evidence:read", "evidence:upload"],
          workerId: worker.id,
        });
      }
      catch { inviteFailed = true; }
    }
    setPendingSiteIds(failedSites);
    setInvitationPending(inviteFailed);
    if (failedSites.length || inviteFailed) {
      setCreated(worker);
      setError("Il profilo e stato salvato. Alcuni passaggi non sono riusciti: puoi riprovarli senza creare duplicati.");
      router.refresh();
      return;
    }
    onCreated(worker);
  }

  async function create() {
    setPending(true); setError(null);
    try {
      const worker = await submitJson<WorkspaceWorkerRecord>("/api/workers", "POST", {
        displayName: values.displayName, roleLabel: values.roleLabel || null, email: values.email || null, phone: values.phone || null, notes: values.notes || null,
      });
      await finishRemaining(worker, assignLater ? [] : siteIds, invite);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Creazione non riuscita."); }
    finally { setPending(false); }
  }

  async function retry() {
    if (!created) return;
    setPending(true); setError(null);
    try { await finishRemaining(created, pendingSiteIds, invitationPending); }
    finally { setPending(false); }
  }

  if (created) return <div className="grid gap-4"><Alert variant="warning"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Profilo salvato, configurazione da completare</AlertTitle><AlertDescription>{error}</AlertDescription></Alert><DialogFooter><Button onClick={() => onCreated(created)} type="button" variant="outline">Apri il profilo</Button><Button disabled={pending} onClick={() => void retry()} type="button">{pending ? "Riprovo..." : "Riprova passaggi mancanti"}</Button></DialogFooter></div>;

  return <div className="grid gap-5">
    <ol aria-label="Avanzamento creazione lavoratore" className="grid grid-cols-4 gap-2">{steps.map((label, index) => <li className="min-w-0" key={label}><div className={`h-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} /><p className={`mt-2 truncate text-xs ${index === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{index + 1}. {label}</p></li>)}</ol>
    {error ? <FieldError>{error}</FieldError> : null}

    {step === 0 ? <FieldGroup><div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="guided-worker-name">Nome e cognome</FieldLabel><Input autoFocus id="guided-worker-name" maxLength={160} onChange={(event) => update("displayName", event.target.value)} required value={values.displayName} /></Field><Field><FieldLabel htmlFor="guided-worker-role">Mansione</FieldLabel><Input id="guided-worker-role" maxLength={120} onChange={(event) => update("roleLabel", event.target.value)} placeholder="es. Elettricista" value={values.roleLabel} /></Field><Field><FieldLabel htmlFor="guided-worker-email">Email</FieldLabel><Input autoComplete="email" id="guided-worker-email" onChange={(event) => update("email", event.target.value)} type="email" value={values.email} /></Field><Field><FieldLabel htmlFor="guided-worker-phone">Telefono</FieldLabel><Input autoComplete="tel" id="guided-worker-phone" onChange={(event) => update("phone", event.target.value)} value={values.phone} /></Field></div><Field><FieldLabel htmlFor="guided-worker-notes">Note operative</FieldLabel><Textarea id="guided-worker-notes" maxLength={4000} onChange={(event) => update("notes", event.target.value)} rows={3} value={values.notes} /></Field></FieldGroup> : null}

    {step === 1 ? (
      <FieldSet>
        <FieldLegend>Accesso a Qoovex</FieldLegend>
        <div className="grid gap-3">
          <button aria-pressed={!invite} className={`rounded-xl border p-4 text-left ${!invite ? "border-primary/40 bg-primary/5" : ""}`} onClick={() => setInvite(false)} type="button"><IconUser aria-hidden="true" className="size-5" /><strong className="mt-2 block">Solo profilo operativo</strong><span className="mt-1 block text-sm text-muted-foreground">Nessun account o invito.</span></button>
          <button aria-pressed={invite} className={`rounded-xl border p-4 text-left ${invite ? "border-primary/40 bg-primary/5" : ""}`} onClick={() => setInvite(true)} type="button"><IconMail aria-hidden="true" className="size-5" /><strong className="mt-2 block">Invita con accesso limitato</strong><span className="mt-1 block text-sm text-muted-foreground">Crea un accesso Collaboratore limitato al caricamento e collega il profilo operativo all'accettazione.</span></button>
        </div>
      </FieldSet>
    ) : null}

    {step === 2 ? <div className="grid gap-3"><label className="flex items-start gap-3 rounded-lg border p-3"><Checkbox checked={assignLater} onCheckedChange={(checked) => setAssignLater(checked === true)} /><span><strong className="block text-sm">Assegna i cantieri piu tardi</strong><span className="text-xs text-muted-foreground">Il profilo viene salvato senza ambito operativo.</span></span></label>{!assignLater ? <div className="grid gap-2 sm:grid-cols-2">{jobSites.map((site) => <label className="flex items-center gap-3 rounded-lg border p-3" key={site.id}><Checkbox checked={siteIds.includes(site.id)} onCheckedChange={(checked) => setSiteIds((current) => checked === true ? [...current, site.id] : current.filter((id) => id !== site.id))} /><span className="text-sm">{site.name}</span></label>)}</div> : null}</div> : null}

    {step === 3 ? <div className="grid gap-4"><dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Lavoratore</dt><dd className="mt-1 text-sm font-medium">{values.displayName}</dd></div><div><dt className="text-xs text-muted-foreground">Mansione</dt><dd className="mt-1 text-sm">{values.roleLabel || "Non indicata"}</dd></div><div><dt className="text-xs text-muted-foreground">Accesso</dt><dd className="mt-1 text-sm">{invite ? "Collaboratore con caricamento limitato e collegamento automatico" : "Solo profilo"}</dd></div><div><dt className="text-xs text-muted-foreground">Cantieri</dt><dd className="mt-1 text-sm">{assignLater ? "Da assegnare" : `${siteIds.length} selezionati`}</dd></div></dl>{duplicates?.similarNames.length ? <Alert variant="warning"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Nomi simili trovati</AlertTitle><AlertDescription>Verifica prima di creare: {duplicates.similarNames.map((item) => item.displayName).join(", ")}. Qoovex non unisce mai profili in base al nome.</AlertDescription></Alert> : null}</div> : null}

    <DialogFooter><Button disabled={pending || step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button" variant="outline"><IconArrowLeft aria-hidden="true" />Indietro</Button>{step < 3 ? <Button disabled={pending} onClick={() => void continueStep()} type="button">Continua<IconArrowRight aria-hidden="true" /></Button> : <Button disabled={pending} onClick={() => void create()} type="button"><IconCheck aria-hidden="true" />{pending ? "Salvataggio..." : "Conferma e salva"}</Button>}</DialogFooter>
  </div>;
}
