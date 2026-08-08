"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";

type ApiFailure = { error?: { message?: string; fieldErrors?: Record<string, string[]> } };

async function requestJson(endpoint: string, body: unknown, options?: { method?: string; idempotent?: boolean; formData?: FormData }) {
  const headers = new Headers();
  if (options?.idempotent) headers.set("Idempotency-Key", crypto.randomUUID());
  if (!options?.formData) headers.set("Content-Type", "application/json");
  const response = await fetch(endpoint, { method: options?.method ?? "POST", headers, body: options?.formData ?? JSON.stringify(body) });
  const payload = await response.json().catch(() => ({})) as ApiFailure;
  if (!response.ok) throw Object.assign(new Error(payload.error?.message ?? "Operazione non disponibile."), { fieldErrors: payload.error?.fieldErrors });
  return payload;
}

function useMutation() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<{ pending: boolean; error: string | null; success: string | null }>({ pending: false, error: null, success: null });
  async function run(operation: () => Promise<unknown>, success: string) {
    if (state.pending) return;
    setState({ pending: true, error: null, success: null });
    try { await operation(); setState({ pending: false, error: null, success }); router.refresh(); }
    catch (error) {
      const failure = error as Error & { fieldErrors?: Record<string, string[]> };
      const first = failure.fieldErrors ? Object.keys(failure.fieldErrors)[0] : null;
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`)?.focus();
      setState({ pending: false, error: failure.message, success: null });
    }
  }
  return { formRef, state, run };
}

function FormShell({ title, children, state }: { title: string; children: ReactNode; state: { pending: boolean; error: string | null; success: string | null } }) {
  return <div className="space-y-3"><h3 className="font-medium">{title}</h3>{children}{state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}{state.success ? <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{state.success}</p> : null}</div>;
}

export function CreateJobSiteForm({ organizationId }: { organizationId: string }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(`/api/org/${organizationId}/job-sites`, { name: data.get("name"), address: data.get("address") || null, description: data.get("description") || null }, { idempotent: true }), "Cantiere creato."); }}>
    <FormShell title="Nuovo cantiere" state={mutation.state}><div className="grid gap-3 sm:grid-cols-2"><Input required name="name" placeholder="Nome del cantiere" /><Input name="address" placeholder="Indirizzo" /><Textarea className="sm:col-span-2" name="description" placeholder="Descrizione" /></div><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Creazione…" : "Crea cantiere"}</Button></FormShell>
  </form>;
}

export function TimelineForm({ endpoint, revision, client = false }: { endpoint: string; revision: number; client?: boolean }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, type: client ? "COMMENT" : "WORK_UPDATE", audience: "SHARED", disclosure: "GENERAL", stepId: null, payload: { schemaVersion: 1, title: data.get("title"), body: data.get("body") || null }, attachmentIds: [] }, { idempotent: true }), "Aggiornamento registrato."); }}>
    <FormShell title={client ? "Aggiungi un commento" : "Pubblica un aggiornamento"} state={mutation.state}><Input required name="title" placeholder="Titolo" /><Textarea name="body" placeholder="Dettagli" /><Button disabled={mutation.state.pending} type="submit">Pubblica</Button></FormShell>
  </form>;
}

export function InviteClientForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { email: data.get("email"), expectedRevision: revision }, { idempotent: true }), "Invito inviato."); }}><FormShell title="Cliente principale" state={mutation.state}><Input required name="email" type="email" placeholder="cliente@example.com" /><Button disabled={mutation.state.pending} type="submit">Invita cliente</Button></FormShell></form>;
}

export function AgreementForm({ endpoint, revision, name, address, description, participants }: { endpoint: string; revision: number; name: string; address: string | null; description: string | null; participants: Array<{ id: string; publicRoleLabel: string | null }> }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, payload: { schemaVersion: 1, name, address, description, participantSummary: participants.map((value) => ({ participantId: value.id, publicRoleLabel: value.publicRoleLabel })), initialEstimateMinor: data.get("initialEstimateMinor") || null, estimatedCompletionAt: null, sharedCommercialNotes: data.get("notes") || null } }, { idempotent: true }), "Riepilogo pubblicato."); }}><FormShell title="Riepilogo iniziale" state={mutation.state}><Input name="initialEstimateMinor" inputMode="numeric" placeholder="Stima in centesimi (facoltativa)" /><Textarea name="notes" placeholder="Note economiche condivise" /><Button disabled={mutation.state.pending} type="submit">Pubblica per conferma</Button></FormShell></form>;
}

export function StepForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, title: data.get("title"), description: data.get("description") || null, expectedOutcome: data.get("expectedOutcome") || null, sortOrder: 0, indicativeDate: null, estimatedCompletionAt: null, economicValueMinor: null }, { idempotent: true }), "Step creato."); }}><FormShell title="Nuovo step opzionale" state={mutation.state}><Input required name="title" placeholder="Titolo" /><Textarea name="description" placeholder="Descrizione" /><Textarea name="expectedOutcome" placeholder="Risultato atteso" /><Button disabled={mutation.state.pending} type="submit">Crea step</Button></FormShell></form>;
}

export function ProposalForm({ endpoint, revision, side }: { endpoint: string; revision: number; side: "ORGANIZATION_MEMBER" | "CLIENT" }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const priceMode = String(data.get("priceMode")); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, representedSide: side, payload: { schemaVersion: 1, priceMode, changeSummary: data.get("summary"), reason: data.get("reason"), affectedStepIds: [], previousPriceMinor: data.get("previousPriceMinor") || null, economicDeltaMinor: priceMode === "FIXED_DELTA" ? data.get("economicDeltaMinor") || null : null, rangeMinimumMinor: priceMode === "RANGE" ? data.get("rangeMinimumMinor") || null : null, rangeMaximumMinor: priceMode === "RANGE" ? data.get("rangeMaximumMinor") || null : null, scheduleImpact: data.get("scheduleImpact") || null, estimatedCompletionAt: null, collaboratorParticipantIds: [], conditions: data.get("conditions") || null }, effects: [], expiresAt: null }, { idempotent: true }), "Proposta registrata."); }}><FormShell title="Proponi una modifica" state={mutation.state}><Textarea required name="summary" placeholder="Che cosa cambia" /><Textarea required name="reason" placeholder="Motivazione" /><select className="h-9 rounded-md border bg-background px-3 text-sm" name="priceMode"><option value="NO_PRICE_CHANGE">Nessuna variazione economica</option><option value="FIXED_DELTA">Variazione fissa</option><option value="RANGE">Intervallo economico</option></select><Input name="previousPriceMinor" inputMode="numeric" placeholder="Prezzo precedente in centesimi (facoltativo)" /><Input name="economicDeltaMinor" inputMode="numeric" placeholder="Variazione in centesimi, anche negativa" /><div className="grid grid-cols-2 gap-2"><Input name="rangeMinimumMinor" inputMode="numeric" placeholder="Minimo" /><Input name="rangeMaximumMinor" inputMode="numeric" placeholder="Massimo" /></div><Textarea name="scheduleImpact" placeholder="Impatto sui tempi" /><Textarea name="conditions" placeholder="Condizioni" /><Button disabled={mutation.state.pending} type="submit">Crea proposta</Button></FormShell></form>;
}

export function DisputeForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, title: data.get("title"), description: data.get("description"), references: [] }, { idempotent: true }), "Segnalazione registrata."); }}><FormShell title="Segnala un problema" state={mutation.state}><Input required name="title" placeholder="Titolo" /><Textarea required name="description" placeholder="Descrizione" /><Button disabled={mutation.state.pending} type="submit">Apri segnalazione</Button></FormShell></form>;
}

export function RequestForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, type: data.get("type"), title: data.get("title"), body: data.get("body"), blocking: data.get("blocking") === "on", stepId: null, proposalId: null, paymentRequestId: null, timelineEventId: null }, { idempotent: true }), "Richiesta registrata."); }}><FormShell title="Nuova richiesta" state={mutation.state}><select className="h-9 rounded-md border bg-background px-3 text-sm" name="type"><option value="CLARIFICATION">Chiarimento</option><option value="INFORMATION">Informazione</option><option value="WORK_UPDATE">Aggiornamento</option><option value="DOCUMENT">Documento</option><option value="ISSUE">Problema</option><option value="OTHER">Altro</option></select><Input required name="title" placeholder="Titolo" /><Textarea required name="body" placeholder="Dettagli" /><label className="flex items-center gap-2 text-sm"><input name="blocking" type="checkbox" />Blocca la chiusura finché aperta</label><Button disabled={mutation.state.pending} type="submit">Crea richiesta</Button></FormShell></form>;
}

export function ActionButton({ endpoint, body, label, success, confirmMessage, method }: { endpoint: string; body: Record<string, unknown>; label: string; success: string; confirmMessage?: string; method?: string }) {
  const mutation = useMutation();
  return <div><Button disabled={mutation.state.pending} onClick={() => { if (confirmMessage && !window.confirm(confirmMessage)) return; void mutation.run(() => requestJson(endpoint, body, { idempotent: true, method }), success); }} type="button">{mutation.state.pending ? "Attendi…" : label}</Button>{mutation.state.error ? <p role="alert" className="mt-2 text-sm text-destructive">{mutation.state.error}</p> : null}{mutation.state.success ? <p role="status" className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{mutation.state.success}</p> : null}</div>;
}

export function AttachmentForm({ endpoint, revision, client = false }: { endpoint: string; revision: number; client?: boolean }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); data.set("expectedRevision", String(revision)); if (client) data.set("audience", "SHARED"); void mutation.run(() => requestJson(endpoint, null, { idempotent: true, formData: data }), "File caricato."); }}><FormShell title="Aggiungi file" state={mutation.state}><Input required name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov" /><select className="h-9 rounded-md border bg-background px-3 text-sm" name="category">{client ? <><option value="REQUEST">Allegato richiesta</option><option value="PROPOSAL">Allegato proposta</option><option value="DISPUTE">Allegato disputa</option><option value="PAYMENT_RECEIPT">Ricevuta pagamento</option></> : <><option value="GENERAL">File generico</option><option value="PHOTO">Fotografia</option><option value="VIDEO">Video</option><option value="EVIDENCE">Prova</option><option value="EXPENSE_RECEIPT">Scontrino o spesa</option><option value="DOCUMENT">Documento</option><option value="PAYMENT_RECEIPT">Ricevuta pagamento</option></>}</select>{client ? <Input required name="relatedId" placeholder="ID della richiesta, proposta, disputa o pagamento" /> : null}{!client ? <select className="h-9 rounded-md border bg-background px-3 text-sm" name="audience"><option value="INTERNAL">Interno</option><option value="SHARED">Condiviso</option></select> : null}<Button disabled={mutation.state.pending} type="submit">Carica</Button></FormShell></form>;
}

export function PropertyForm() {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson("/api/client/properties", { displayName: data.get("displayName"), addressLine: data.get("addressLine") || null, city: data.get("city") || null, postalCode: data.get("postalCode") || null, countryCode: String(data.get("countryCode") || "").toUpperCase() || null, privateNotes: data.get("notes") || null }), "Immobile creato."); }}><FormShell title="Nuovo immobile privato" state={mutation.state}><Input required name="displayName" placeholder="Nome scelto" /><Input name="addressLine" placeholder="Indirizzo" /><div className="grid grid-cols-2 gap-2"><Input name="city" placeholder="Città" /><Input name="postalCode" placeholder="CAP" /></div><Input maxLength={2} name="countryCode" placeholder="Paese (IT)" /><Textarea name="notes" placeholder="Note private" /><Button disabled={mutation.state.pending} type="submit">Crea immobile</Button></FormShell></form>;
}

export function LinkPropertyForm({ propertyId, jobSites }: { propertyId: string; jobSites: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  if (!jobSites.length) return null;
  return <form ref={mutation.formRef} className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(`/api/client/properties/${propertyId}/job-sites`, { jobSiteId: data.get("jobSiteId") }), "Cantiere collegato."); }}><select className="h-9 min-w-48 rounded-md border bg-background px-3 text-sm" name="jobSiteId">{jobSites.map((site) => <option key={site.id} value={site.id}>{site.label}</option>)}</select><Button disabled={mutation.state.pending} size="sm" type="submit">Collega</Button>{mutation.state.error ? <p role="alert" className="w-full text-sm text-destructive">{mutation.state.error}</p> : null}</form>;
}

export function PaymentProfileForm({ endpoint, revision }: { endpoint: string; revision: number | null }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { accountHolder: data.get("accountHolder"), iban: data.get("iban"), expectedRevision: revision }, { method: "PUT" }), "Profilo pagamento aggiornato."); }}><FormShell title="Profilo pagamento protetto da MFA" state={mutation.state}><Input required name="accountHolder" placeholder="Intestatario" /><Input required name="iban" autoComplete="off" placeholder="IBAN" /><Button disabled={mutation.state.pending} type="submit">Salva profilo</Button></FormShell></form>;
}

export function PostClosureForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, title: data.get("title"), body: data.get("body") }, { idempotent: true }), "Richiesta post-chiusura registrata."); }}><FormShell title="Richiesta post-chiusura" state={mutation.state}><Input required name="title" placeholder="Titolo" /><Textarea required name="body" placeholder="Dettagli" /><Button disabled={mutation.state.pending} type="submit">Invia richiesta</Button></FormShell></form>;
}

export function ReopeningForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, postClosureRequestId: null, reason: data.get("reason") }, { idempotent: true }), "Proposta di riapertura registrata."); }}><FormShell title="Proponi riapertura" state={mutation.state}><Textarea required name="reason" placeholder="Motivazione" /><Button disabled={mutation.state.pending} type="submit">Proponi riapertura</Button></FormShell></form>;
}

export function CollaboratorInviteForm({ endpoint }: { endpoint: string }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { email: data.get("email"), recipientName: data.get("recipientName") || null }), "Invito Collaborator inviato."); }}><FormShell title="Invita Collaborator" state={mutation.state}><Input name="recipientName" placeholder="Nome (facoltativo)" /><Input required name="email" type="email" placeholder="collaboratore@example.com" /><Button disabled={mutation.state.pending} type="submit">Invita</Button></FormShell></form>;
}

export function ParticipantForm({ endpoint, memberships }: { endpoint: string; memberships: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  if (!memberships.length) return <p className="text-sm text-muted-foreground">Nessun membro Azienda disponibile.</p>;
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { membershipId: data.get("membershipId"), publicRoleLabel: data.get("publicRoleLabel") }), "Collaborator aggiunto al cantiere."); }}><FormShell title="Aggiungi membro esistente" state={mutation.state}><select className="h-9 rounded-md border bg-background px-3 text-sm" name="membershipId">{memberships.map((membership) => <option key={membership.id} value={membership.id}>{membership.label}</option>)}</select><Input required name="publicRoleLabel" placeholder="Ruolo operativo pubblico" /><Button disabled={mutation.state.pending} type="submit">Aggiungi</Button></FormShell></form>;
}

export function PaymentRequestForm({ endpoint, revision, paymentProfileId }: { endpoint: string; revision: number; paymentProfileId: string | null }) {
  const mutation = useMutation();
  if (!paymentProfileId) return <p className="text-sm text-muted-foreground">Configura prima il profilo pagamento.</p>;
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { action: "PAYMENT_REQUEST_CREATE@1", expectedRevision: revision, paymentProfileId, amountMinor: data.get("amountMinor"), reason: data.get("reason"), dueAt: null, stepIds: [], proposalIds: [] }, { idempotent: true }), "Richiesta di pagamento pubblicata."); }}><FormShell title="Nuova richiesta di pagamento" state={mutation.state}><Input required name="amountMinor" inputMode="numeric" placeholder="Importo in centesimi" /><Textarea required name="reason" placeholder="Motivazione" /><Button disabled={mutation.state.pending} type="submit">Presenta richiesta</Button></FormShell></form>;
}

export function PaymentDeclarationForm({ endpoint, revision, paymentRequestId, amountMinor, receiptAttachments }: { endpoint: string; revision: number; paymentRequestId: string; amountMinor: string; receiptAttachments: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); if (!window.confirm("Confermi di aver disposto l'intero importo richiesto?")) return; void mutation.run(() => requestJson(endpoint, { action: "PAYMENT_TRANSFER_DECLARE@1", expectedRevision: revision, paymentRequestId, amountMinor, transferredAt: new Date(String(data.get("transferredAt"))).toISOString(), method: data.get("method"), reference: data.get("reference") || null, note: data.get("note") || null, receiptAttachmentId: data.get("receiptAttachmentId") || null }, { idempotent: true }), "Invio dichiarato."); }}><Input required name="transferredAt" type="datetime-local" /><Input required name="method" placeholder="Metodo" /><Input name="reference" placeholder="Riferimento" />{receiptAttachments.length ? <select className="h-9 rounded-md border bg-background px-3 text-sm" name="receiptAttachmentId"><option value="">Nessuna ricevuta</option>{receiptAttachments.map((attachment) => <option key={attachment.id} value={attachment.id}>{attachment.label}</option>)}</select> : null}<Textarea name="note" placeholder="Nota" /><Button disabled={mutation.state.pending} type="submit">Dichiara invio</Button>{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}</form>;
}

export function PaymentReviewForm({ endpoint, revision, paymentRequestId }: { endpoint: string; revision: number; paymentRequestId: string }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); if (!window.confirm("Registrare questo esito della verifica dell'Azienda?")) return; void mutation.run(() => requestJson(endpoint, { action: "PAYMENT_RECEIPT_CONFIRM@1", expectedRevision: revision, paymentRequestId, outcome: data.get("outcome"), note: data.get("note") || null }, { idempotent: true }), "Verifica registrata."); }}><select className="h-9 rounded-md border bg-background px-3 text-sm" name="outcome"><option value="CONFIRMED_RECEIVED">Ricezione confermata</option><option value="NOT_RECEIVED">Non ricevuto</option><option value="AMOUNT_MISMATCH">Importo non corrispondente</option><option value="CLARIFICATION_REQUIRED">Chiarimento richiesto</option></select><Textarea name="note" placeholder="Nota della verifica" /><Button disabled={mutation.state.pending} type="submit">Registra esito</Button>{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}</form>;
}

export function AuthorityGrantForm({ endpoint, revision, participants }: { endpoint: string; revision: number; participants: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  if (!participants.length) return <p className="text-sm text-muted-foreground">Nessun partecipante Azienda disponibile.</p>;
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); if (!window.confirm("Confermi questa delega economica esplicita?")) return; void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, participantId: data.get("participantId"), capabilities: data.getAll("capabilities"), validFrom: new Date().toISOString(), expiresAt: data.get("expiresAt") ? new Date(String(data.get("expiresAt"))).toISOString() : null, reason: data.get("reason") }, { idempotent: true }), "Delega aggiornata."); }}><FormShell title="Concedi autorità economica" state={mutation.state}><select className="h-9 rounded-md border bg-background px-3 text-sm" name="participantId">{participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.label}</option>)}</select><div className="grid gap-2 text-sm">{[["COMMERCIAL_NEGOTIATE", "Negoziare"], ["COMMERCIAL_ACCEPT", "Accettare"], ["PAYMENT_REQUEST", "Richiedere pagamenti"], ["PAYMENT_CONFIRM_RECEIPT", "Confermare ricezione"], ["CLOSURE_PROPOSE", "Proporre chiusura"]].map(([value, label]) => <label className="flex items-center gap-2" key={value}><input name="capabilities" type="checkbox" value={value} />{label}</label>)}</div><label className="grid gap-1 text-sm">Scadenza facoltativa<Input name="expiresAt" type="datetime-local" /></label><Textarea required minLength={10} name="reason" placeholder="Motivazione" /><Button disabled={mutation.state.pending} type="submit">Concedi delega</Button></FormShell></form>;
}

export function RecordTransitionForm({ endpoint, revision, actions }: { endpoint: string; revision: number; actions: Array<{ value: string; label: string }> }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, action: data.get("action"), message: data.get("message") }, { idempotent: true }), "Aggiornamento registrato."); }}><select className="h-9 rounded-md border bg-background px-3 text-sm" name="action">{actions.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}</select><Textarea required name="message" placeholder="Messaggio registrato nella cronologia" /><Button disabled={mutation.state.pending} size="sm" type="submit">Registra</Button>{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}</form>;
}

export function ProposalCounterForm({ endpoint, revision, currentVersion }: { endpoint: string; revision: number; currentVersion: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, expectedCurrentVersion: currentVersion, payload: { schemaVersion: 1, priceMode: "NO_PRICE_CHANGE", changeSummary: data.get("summary"), reason: data.get("reason"), affectedStepIds: [], previousPriceMinor: null, economicDeltaMinor: null, rangeMinimumMinor: null, rangeMaximumMinor: null, scheduleImpact: null, estimatedCompletionAt: null, collaboratorParticipantIds: [], conditions: null }, effects: [], expiresAt: null }, { idempotent: true }), "Controproposta registrata."); }}><Textarea required name="summary" placeholder="Nuova versione della modifica" /><Textarea required name="reason" placeholder="Motivazione" /><Button disabled={mutation.state.pending} size="sm" type="submit">Controproponi</Button>{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}</form>;
}

export function DeleteActionButton({ endpoint, body, label, success, confirmMessage }: { endpoint: string; body: Record<string, unknown>; label: string; success: string; confirmMessage: string }) {
  const mutation = useMutation();
  return <div><Button disabled={mutation.state.pending} variant="outline" size="sm" type="button" onClick={() => { if (!window.confirm(confirmMessage)) return; void mutation.run(() => requestJson(endpoint, body, { method: "DELETE", idempotent: true }), success); }}>{label}</Button>{mutation.state.error ? <p role="alert" className="mt-2 text-sm text-destructive">{mutation.state.error}</p> : null}</div>;
}

export function LegalHoldForm({ endpoint }: { endpoint: string }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!window.confirm("Bloccare la conservazione dei contenuti collegati a questo cantiere?")) return;
    void mutation.run(() => requestJson(endpoint, { reason: data.get("reason") }), "Conservazione bloccata.");
  }}><FormShell title="Conservazione" state={mutation.state}><Textarea required minLength={10} name="reason" placeholder="Motivazione della conservazione" /><Button disabled={mutation.state.pending} type="submit">Blocca conservazione</Button></FormShell></form>;
}

export function ReleaseLegalHoldButton({ endpoint, holdId }: { endpoint: string; holdId: string }) {
  const mutation = useMutation();
  return <div><Button variant="outline" disabled={mutation.state.pending} onClick={() => {
    const releaseReason = window.prompt("Motivazione del rilascio (almeno 10 caratteri)");
    if (!releaseReason || releaseReason.trim().length < 10) return;
    void mutation.run(() => requestJson(endpoint, { holdId, releaseReason }, { method: "DELETE" }), "Conservazione rilasciata.");
  }} type="button">Rilascia</Button>{mutation.state.error ? <p role="alert" className="mt-2 text-sm text-destructive">{mutation.state.error}</p> : null}</div>;
}
