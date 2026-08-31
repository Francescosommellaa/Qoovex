"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@qoovex/ui/components/dialog";
import { Field, FieldDescription, FieldError, FieldLegend, FieldSet } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Textarea } from "@qoovex/ui/components/textarea";
import type { JobSiteStatus, JobSiteSummaryResponse } from "@qoovex/types";
import { formatEuroFromMinorUnits, parseEuroInputToMinorUnits } from "@shared/lib/money";
import { jobSiteRequestTypeOptions } from "@shared/lib/product-state-presentation";
import { formatDateTime } from "@shared/lib/product-metadata-presentation";
import { captureRefreshFocus, updateWithFocusGuard } from "@shared/lib/focus-management";

type ApiFailure = { error?: { message?: string; fieldErrors?: Record<string, string[]> } };
type FieldErrors = Record<string, string[]>;
type MutationFailure = { message: string; fieldErrors?: FieldErrors };
type MutationState = { pending: boolean; error: string | null; fieldErrors: FieldErrors; success: string | null };
type MutationOptions<TResult> = { focusFallbackId?: string; onSuccess?: (result: TResult) => void; mapError?: (message: string) => string };
type CreatedJobSiteResponse = Pick<JobSiteSummaryResponse, "id">;

const FIELD_NAME_ALIASES: Record<string, string> = {
  changeSummary: "summary",
  privateNotes: "notes",
  sharedCommercialNotes: "notes",
};

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  accountHolder: "Inserisci un intestatario valido.",
  action: "Seleziona un'azione valida.",
  address: "Controlla l'indirizzo.",
  addressLine: "Controlla l'indirizzo.",
  amountMinor: "Inserisci un importo in euro valido, usando al massimo due cifre decimali.",
  audience: "Seleziona una visibilità valida.",
  blocking: "Controlla questa scelta.",
  body: "Inserisci i dettagli richiesti.",
  capabilities: "Seleziona almeno un permesso economico.",
  category: "Seleziona un tipo valido.",
  city: "Controlla la città.",
  conditions: "Controlla le condizioni.",
  countryCode: "Inserisci il codice paese con due lettere, per esempio IT.",
  description: "Controlla la descrizione.",
  displayName: "Inserisci un nome valido per l'immobile.",
  economicDeltaMinor: "Inserisci una variazione valida in euro.",
  email: "Inserisci un indirizzo email valido.",
  expectedOutcome: "Controlla il risultato atteso.",
  expiresAt: "Indica una scadenza successiva all'inizio della delega.",
  file: "Scegli un file valido.",
  iban: "Inserisci un IBAN valido.",
  initialEstimateMinor: "Inserisci una stima iniziale valida in euro.",
  jobSiteId: "Seleziona un cantiere valido.",
  membershipId: "Seleziona una persona valida.",
  message: "Inserisci un messaggio valido.",
  method: "Inserisci un metodo di pagamento valido.",
  name: "Inserisci un nome del cantiere valido.",
  note: "Controlla la nota.",
  notes: "Controlla le note.",
  channel: "Seleziona un canale valido.",
  frequency: "Seleziona una frequenza valida.",
  organizationId: "Seleziona un'Azienda valida.",
  outcome: "Seleziona un esito valido.",
  participantId: "Seleziona una persona valida.",
  postalCode: "Controlla il CAP.",
  previousPriceMinor: "Inserisci un importo precedente valido in euro.",
  priceMode: "Seleziona una variazione economica valida.",
  publicRoleLabel: "Inserisci un ruolo valido per il cantiere.",
  query: "Inserisci almeno due caratteri per la ricerca.",
  rangeMaximumMinor: "Inserisci un importo massimo valido in euro.",
  rangeMinimumMinor: "Inserisci un importo minimo valido in euro.",
  reason: "Inserisci una motivazione valida.",
  receiptAttachmentId: "Seleziona una ricevuta valida.",
  recipientName: "Controlla il nome.",
  reference: "Controlla il riferimento.",
  scheduleImpact: "Controlla l'impatto sui tempi.",
  summary: "Descrivi la modifica proposta.",
  title: "Inserisci un titolo valido.",
  transferredAt: "Inserisci una data e un'ora valide.",
  type: "Seleziona un tipo di richiesta valido.",
};

function presentGeneralMutationError(message: string) {
  if (/Idempotency-Key|expectedRevision|schemaVersion|fieldErrors|payload|\brevision\b/i.test(message)) {
    return "Non è stato possibile completare l'operazione. Aggiorna la pagina e riprova.";
  }
  return message
    .replace(/\bDisputa\b/g, "Disaccordo")
    .replace(/\bdisputa\b/g, "disaccordo")
    .replace(/\bDispute\b/g, "Disaccordi")
    .replace(/\bdispute\b/g, "disaccordi");
}

function formControls(form: HTMLFormElement | null) {
  if (!form) return [];
  return Array.from(form.elements) as Array<Element & { focus?: () => void; name?: string }>;
}

function formControl(form: HTMLFormElement | null, name: string) {
  return formControls(form).find((control) => control.name === name) ?? null;
}

export function resolveMutationFailure(form: HTMLFormElement | null, failure: MutationFailure) {
  const availableNames = new Set(formControls(form).map((control) => control.name).filter((name): name is string => Boolean(name)));
  const pendingErrors = new Map<string, string>();
  for (const [technicalName, messages] of Object.entries(failure.fieldErrors ?? {})) {
    const name = FIELD_NAME_ALIASES[technicalName] ?? technicalName;
    if (!messages.length || !availableNames.has(name) || pendingErrors.has(name)) continue;
    pendingErrors.set(name, FIELD_ERROR_MESSAGES[name] ?? "Controlla questo campo.");
  }

  const fieldErrors: FieldErrors = {};
  for (const control of formControls(form)) {
    if (!control.name || fieldErrors[control.name] || !pendingErrors.has(control.name)) continue;
    fieldErrors[control.name] = [pendingErrors.get(control.name)!];
  }
  const firstFieldName = Object.keys(fieldErrors)[0] ?? null;
  const hadUnattributedFieldErrors = Object.keys(failure.fieldErrors ?? {}).length > 0 && !firstFieldName;
  return {
    error: firstFieldName ? null : hadUnattributedFieldErrors ? "Controlla i dati inseriti e riprova." : presentGeneralMutationError(failure.message),
    fieldErrors,
    firstFieldName,
  };
}

export function focusFormField(form: HTMLFormElement | null, name: string | null) {
  if (!name) return;
  const visibleControls = typeof form?.querySelectorAll === "function" ? form.querySelectorAll<HTMLElement>("[data-field-name]") : [];
  const visibleControl = Array.from(visibleControls)
    .find((control) => control.dataset.fieldName === name);
  (visibleControl ?? formControl(form, name))?.focus?.();
}

async function requestJson<TResult = Record<string, unknown>>(endpoint: string, body: unknown, options?: { method?: string; idempotent?: boolean; formData?: FormData }): Promise<TResult> {
  const headers = new Headers();
  if (options?.idempotent) headers.set("Idempotency-Key", crypto.randomUUID());
  if (!options?.formData) headers.set("Content-Type", "application/json");
  const response = await fetch(endpoint, { method: options?.method ?? "POST", headers, body: options?.formData ?? JSON.stringify(body) });
  const payload = await response.json().catch(() => ({})) as ApiFailure;
  if (!response.ok) throw Object.assign(new Error(payload.error?.message ?? "Operazione non disponibile."), { fieldErrors: payload.error?.fieldErrors });
  return payload as TResult;
}

function useMutation() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mutationInFlight = useRef(false);
  const [state, setState] = useState<MutationState>({ pending: false, error: null, fieldErrors: {}, success: null });
  const [focusFieldName, setFocusFieldName] = useState<string | null>(null);
  useEffect(() => {
    if (!focusFieldName) return;
    focusFormField(formRef.current, focusFieldName);
    setFocusFieldName(null);
  }, [focusFieldName, state.fieldErrors]);
  async function run<TResult>(operation: () => Promise<TResult>, success: string, options: MutationOptions<TResult> = {}) {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    let navigationStarted = false;
    const focusSnapshot = typeof document === "undefined"
      ? null
      : captureRefreshFocus(document, options.focusFallbackId, { allowOriginOnly: true });
    updateWithFocusGuard(
      () => setState({ pending: true, error: null, fieldErrors: {}, success: null }),
      { snapshot: focusSnapshot },
    );
    try {
      const result = await operation();
      if (options.onSuccess) {
        setState({ pending: true, error: null, fieldErrors: {}, success });
        options.onSuccess(result);
        navigationStarted = true;
        return;
      }
      setState({ pending: false, error: null, fieldErrors: {}, success });
      router.refresh();
    }
    catch (error) {
      const failure = error as Error & { fieldErrors?: Record<string, string[]> };
      const resolved = resolveMutationFailure(formRef.current, { ...failure, message: options.mapError ? options.mapError(failure.message) : failure.message });
      setState({ pending: false, error: resolved.error, fieldErrors: resolved.fieldErrors, success: null });
      setFocusFieldName(resolved.firstFieldName);
    } finally {
      if (!navigationStarted) mutationInFlight.current = false;
    }
  }
  return { formRef, state, run };
}

const FormErrorContext = createContext<FieldErrors>({});

export function FormErrorProvider({ children, fieldErrors }: { children: ReactNode; fieldErrors: FieldErrors }) {
  return <FormErrorContext.Provider value={fieldErrors}>{children}</FormErrorContext.Provider>;
}

function useFieldErrors(name: string | undefined) {
  const fieldErrors = useContext(FormErrorContext);
  return name ? fieldErrors[name] ?? [] : [];
}

function describedBy(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(" ") || undefined;
}

function FormShell({ title, children, state }: { title: string; children: ReactNode; state: MutationState }) {
  return <FormErrorProvider fieldErrors={state.fieldErrors}><div className="space-y-3"><h3 className="font-medium">{title}</h3>{children}{state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}{state.success ? <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{state.success}</p> : null}</div></FormErrorProvider>;
}

type LabeledControlProps = {
  description?: ReactNode;
  fieldClassName?: string;
  label: ReactNode;
  optional?: boolean;
};

export function selectedFileDescription(fileName: string | null) {
  return fileName ? `File selezionato: ${fileName}` : "Nessun file selezionato.";
}

export function InputField({ "aria-describedby": providedDescribedBy, description, fieldClassName, id: providedId, label, onChange, optional, ...props }: LabeledControlProps & ComponentProps<typeof Input>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const isFileInput = props.type === "file";
  const selectionId = isFileInput ? `${id}-selection` : undefined;
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const errors = useFieldErrors(props.name);
  const errorId = errors.length ? `${id}-error` : undefined;
  const invalid = errors.length > 0;
  return <Field className={fieldClassName} data-invalid={invalid || undefined}><Label htmlFor={id} required={props.required} optional={optional}>{label}</Label><Input {...props} aria-describedby={describedBy(providedDescribedBy, descriptionId, errorId)} aria-invalid={invalid || undefined} id={id} onChange={(event) => { if (isFileInput) setSelectedFileName(event.currentTarget.files?.[0]?.name ?? null); onChange?.(event); }} />{description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}{selectionId ? <p aria-live="polite" className="min-w-0 text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]" id={selectionId}>{selectedFileDescription(selectedFileName)}</p> : null}{errors.length ? <FieldError errors={errors.map((message) => ({ message }))} id={errorId} /> : null}</Field>;
}

export function TextareaField({ "aria-describedby": providedDescribedBy, description, fieldClassName, id: providedId, label, optional, ...props }: LabeledControlProps & ComponentProps<typeof Textarea>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errors = useFieldErrors(props.name);
  const errorId = errors.length ? `${id}-error` : undefined;
  const invalid = errors.length > 0;
  return <Field className={fieldClassName} data-invalid={invalid || undefined}><Label htmlFor={id} required={props.required} optional={optional}>{label}</Label><Textarea {...props} aria-describedby={describedBy(providedDescribedBy, descriptionId, errorId)} aria-invalid={invalid || undefined} id={id} />{description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}{errors.length ? <FieldError errors={errors.map((message) => ({ message }))} id={errorId} /> : null}</Field>;
}

export type SelectFieldOption = { disabled?: boolean; label: string; value: string };

type SelectFieldProps = LabeledControlProps & {
  "aria-describedby"?: string;
  className?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  id?: string;
  name: string;
  onValueChange?: (value: string | null | undefined) => void;
  options: readonly SelectFieldOption[];
  placeholder?: string;
  required?: boolean;
  value?: string | null;
};

export function SelectField({ "aria-describedby": providedDescribedBy, className, defaultValue, description, disabled, fieldClassName, id: providedId, label, name, onValueChange, optional, options, placeholder, required, value }: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errors = useFieldErrors(name);
  const errorId = errors.length ? `${id}-error` : undefined;
  const invalid = errors.length > 0;
  const uncontrolledDefault = defaultValue === undefined ? (placeholder ? null : options[0]?.value ?? null) : defaultValue;
  const [internalValue, setInternalValue] = useState<string | null>(uncontrolledDefault);
  useEffect(() => {
    if (value !== undefined) return;
    setInternalValue((current) => options.some((option) => option.value === current && !option.disabled) ? current : uncontrolledDefault);
  }, [options, uncontrolledDefault, value]);
  const selectedValue = value === undefined ? internalValue : value;
  return <Field className={fieldClassName} data-invalid={invalid || undefined}><Label htmlFor={id} required={required} optional={optional}>{label}</Label><Select items={options} name={name} onValueChange={(nextValue) => { if (value === undefined) setInternalValue(nextValue ?? null); onValueChange?.(nextValue); }} required={required} disabled={disabled} value={selectedValue}><SelectTrigger aria-describedby={describedBy(providedDescribedBy, descriptionId, errorId)} aria-invalid={invalid || undefined} aria-required={required || undefined} className={className} data-field-name={name} disabled={disabled} id={id}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent align="start"><SelectGroup>{options.map((option) => <SelectItem disabled={option.disabled} key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select>{description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}{errors.length ? <FieldError errors={errors.map((message) => ({ message }))} id={errorId} /> : null}</Field>;
}

type CheckboxFieldProps = LabeledControlProps & {
  "aria-describedby"?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  name: string;
  required?: boolean;
  value?: string;
};

function CheckboxField({ "aria-describedby": providedDescribedBy, defaultChecked, description, disabled, fieldClassName, id: providedId, label, name, required, value }: CheckboxFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errors = useFieldErrors(name);
  const errorId = errors.length ? `${id}-error` : undefined;
  const invalid = errors.length > 0;
  const labelId = `${id}-label`;
  return <Field className={fieldClassName} data-invalid={invalid || undefined}><div className="flex items-center gap-2"><Checkbox aria-describedby={describedBy(providedDescribedBy, descriptionId, errorId)} aria-invalid={invalid || undefined} aria-labelledby={labelId} data-field-name={name} defaultChecked={defaultChecked} disabled={disabled} id={id} name={name} required={required} value={value} /><Label htmlFor={id} id={labelId} required={required}>{label}</Label></div>{description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}{errors.length ? <FieldError errors={errors.map((message) => ({ message }))} id={errorId} /> : null}</Field>;
}

export function CheckboxGroupField({ description, disabled, legend, name, options }: { description?: ReactNode; disabled?: boolean; legend: string; name: string; options: readonly SelectFieldOption[] }) {
  const groupId = useId();
  const descriptionId = description ? `${groupId}-description` : undefined;
  const errors = useFieldErrors(name);
  const errorId = errors.length ? `${groupId}-error` : undefined;
  const invalid = errors.length > 0;
  return <FieldSet data-invalid={invalid || undefined}><FieldLegend>{legend}</FieldLegend>{description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}<div className="grid gap-2 text-sm">{options.map((option, index) => { const id = `${groupId}-${index}`; const labelId = `${id}-label`; return <Field data-invalid={invalid || undefined} key={option.value} orientation="horizontal"><Checkbox aria-describedby={describedBy(descriptionId, errorId)} aria-invalid={invalid || undefined} aria-labelledby={labelId} data-field-name={name} disabled={disabled || option.disabled} id={id} name={name} value={option.value} /><Label htmlFor={id} id={labelId}>{option.label}</Label></Field>; })}</div>{errors.length ? <FieldError errors={errors.map((message) => ({ message }))} id={errorId} /> : null}</FieldSet>;
}

function EuroInputField({ name, label, required = false, allowNegative = false }: { name: string; label: string; required?: boolean; allowNegative?: boolean }) {
  return <InputField autoComplete="off" description="Importo in euro, con al massimo due cifre decimali." inputMode="decimal" label={label} name={name} optional={!required} placeholder={allowNegative ? "es. -250,00" : "es. 1.250,00"} required={required} />;
}

function euroFieldToMinorUnits(data: FormData, name: string, label: string, options: { allowNegative?: boolean; required?: boolean } = {}) {
  const result = parseEuroInputToMinorUnits(String(data.get(name) ?? ""), { allowNegative: options.allowNegative });
  const error = !result.ok ? result.error : options.required && result.minorUnits === null ? `Indica ${label.toLowerCase()}.` : null;
  if (error) throw Object.assign(new Error(`${label}: ${error}`), { fieldErrors: { [name]: [error] } });
  return result.ok ? result.minorUnits : null;
}

function createdJobSiteId(createdJobSite: CreatedJobSiteResponse): JobSiteSummaryResponse["id"] {
  if (typeof createdJobSite.id !== "string" || !createdJobSite.id.trim()) {
    throw new Error("Il cantiere è stato creato, ma non è stato possibile aprirlo. Aggiorna la pagina e selezionalo dall'elenco.");
  }
  return createdJobSite.id;
}

export function createdJobSiteDetailPath(createdJobSite: CreatedJobSiteResponse) {
  return `/job-sites/${encodeURIComponent(createdJobSiteId(createdJobSite))}`;
}

export function CreateJobSiteForm() {
  const router = useRouter();
  const mutation = useMutation();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson<CreatedJobSiteResponse>("/api/job-sites", { name: data.get("name"), address: data.get("address") || null, description: data.get("description") || null }, { idempotent: true }), "Cantiere creato. Apertura del cantiere…", { onSuccess: (createdJobSite) => router.push(createdJobSiteDetailPath(createdJobSite)) }); }}>
    <FormShell title="Nuovo cantiere" state={mutation.state}><div className="grid gap-3 sm:grid-cols-2"><InputField required label="Nome del cantiere" name="name" placeholder="es. Ristrutturazione via Roma" /><InputField label="Indirizzo" optional name="address" /><TextareaField fieldClassName="sm:col-span-2" label="Descrizione" optional name="description" /></div><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Apertura del cantiere…" : "Crea cantiere"}</Button></FormShell>
  </form>;
}

export function TimelineForm({ endpoint, revision, client = false }: { endpoint: string; revision: number; client?: boolean }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, type: client ? "COMMENT" : "WORK_UPDATE", audience: "SHARED", disclosure: "GENERAL", stepId: null, payload: { schemaVersion: 1, title: data.get("title"), body: data.get("body") || null }, attachmentIds: [] }, { idempotent: true }), "Aggiornamento registrato."); }}>
    <FormShell title={client ? "Aggiungi un commento" : "Pubblica un aggiornamento"} state={mutation.state}><InputField required label="Titolo" name="title" /><TextareaField label={client ? "Commento" : "Dettagli"} optional name="body" /><Button disabled={mutation.state.pending} type="submit">Pubblica</Button></FormShell>
  </form>;
}

type PendingClientInvitation = { id: string; emailNormalized: string; expiresAt: Date | string };

function formatInvitationExpiry(value: Date | string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function InviteClientForm({ endpoint, id, jobSiteName = "questo cantiere", pendingInvitation = null, revision, status = "DRAFT" }: { endpoint: string; id?: string; jobSiteName?: string; pendingInvitation?: PendingClientInvitation | null; revision: number; status?: JobSiteStatus }) {
  const mutation = useMutation();
  if (status === "WAITING_FOR_CLIENT") {
    return <section aria-labelledby={`${id ?? "client-invitation"}-title`} id={id} className="space-y-3"><div><h3 className="font-medium" id={`${id ?? "client-invitation"}-title`}>Invito inviato</h3><p className="mt-1 text-sm text-muted-foreground">Stai condividendo <strong className="font-medium text-foreground">{jobSiteName}</strong>{pendingInvitation ? <> con <strong className="font-medium text-foreground">{pendingInvitation.emailNormalized}</strong></> : null}.</p></div><p className="text-sm">Ora il cliente deve accedere a Qoovex con la stessa email e accettare l&apos;invito. Dopo l&apos;accettazione, potrai pubblicare il riepilogo iniziale per la sua conferma.</p>{pendingInvitation ? <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-3"><dl className="text-sm"><div><dt className="text-muted-foreground">Email invitata</dt><dd>{pendingInvitation.emailNormalized}</dd></div><div className="mt-2"><dt className="text-muted-foreground">Invito valido fino al</dt><dd>{formatInvitationExpiry(pendingInvitation.expiresAt)}</dd></div></dl><DeleteActionButton endpoint={endpoint} body={{ invitationId: pendingInvitation.id, expectedRevision: revision }} label="Revoca invito" success="Invito revocato." confirmMessage="Revocare l'invito inviato a questo cliente?" /></div> : null}</section>;
  }
  if (status !== "DRAFT") {
    return <section aria-labelledby={`${id ?? "client-invitation"}-title`} id={id}><h3 className="font-medium" id={`${id ?? "client-invitation"}-title`}>Cliente principale</h3><p className="mt-1 text-sm text-muted-foreground">{status === "PENDING_INITIAL_CONFIRMATION" ? "Il cliente ha accettato l'invito. Pubblica ora il riepilogo iniziale per la sua conferma." : "Il cliente principale è già collegato a questo cantiere."}</p></section>;
  }
  return <form aria-busy={mutation.state.pending} id={id} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { email: data.get("email"), expectedRevision: revision }, { idempotent: true }), "Invito inviato. Ora il cliente deve accedere a Qoovex con questa stessa email e accettare l'invito."); }}><FormShell title={`Invita un cliente a ${jobSiteName}`} state={mutation.state}><p className="text-sm text-muted-foreground">Stai condividendo questo cantiere con il cliente che indicherai.</p><InputField autoComplete="email" description="L'invito sarà inviato a questo indirizzo. Il cliente dovrà accedere a Qoovex con la stessa email per accettarlo." required label="Email del cliente" name="email" placeholder="cliente@example.com" type="email" /><p className="text-sm text-muted-foreground">Dopo l&apos;invio, il cliente dovrà accettare l&apos;invito. Potrai quindi pubblicare il riepilogo iniziale per la sua conferma.</p><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Invio in corso…" : "Invia invito"}</Button></FormShell></form>;
}

export function AgreementForm({ endpoint, id, revision, name, address, description, participants }: { endpoint: string; id?: string; revision: number; name: string; address: string | null; description: string | null; participants: Array<{ id: string; publicRoleLabel: string | null }> }) {
  const mutation = useMutation();
  return <form id={id} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => { const initialEstimateMinor = euroFieldToMinorUnits(data, "initialEstimateMinor", "Stima iniziale"); return requestJson(endpoint, { expectedRevision: revision, payload: { schemaVersion: 1, name, address, description, participantSummary: participants.map((value) => ({ participantId: value.id, publicRoleLabel: value.publicRoleLabel })), initialEstimateMinor, estimatedCompletionAt: null, sharedCommercialNotes: data.get("notes") || null } }, { idempotent: true }); }, "Riepilogo pubblicato."); }}><FormShell title="Riepilogo iniziale" state={mutation.state}><EuroInputField name="initialEstimateMinor" label="Stima iniziale" /><TextareaField description="Saranno visibili al cliente nel riepilogo iniziale." label="Note economiche condivise" optional name="notes" /><Button disabled={mutation.state.pending} type="submit">Pubblica per conferma</Button></FormShell></form>;
}

export function StepForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, title: data.get("title"), description: data.get("description") || null, expectedOutcome: data.get("expectedOutcome") || null, sortOrder: 0, indicativeDate: null, estimatedCompletionAt: null, economicValueMinor: null }, { idempotent: true }), "Step creato."); }}><FormShell title="Nuovo step opzionale" state={mutation.state}><InputField required label="Titolo" name="title" /><TextareaField label="Descrizione" optional name="description" /><TextareaField label="Risultato atteso" optional name="expectedOutcome" /><Button disabled={mutation.state.pending} type="submit">Crea step</Button></FormShell></form>;
}

export function ProposalForm({ endpoint, revision, side }: { endpoint: string; revision: number; side: "ORGANIZATION_MEMBER" | "CLIENT" }) {
  const mutation = useMutation();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const priceMode = String(data.get("priceMode")); void mutation.run(() => { const previousPriceMinor = euroFieldToMinorUnits(data, "previousPriceMinor", "Importo precedente"); const economicDeltaMinor = priceMode === "FIXED_DELTA" ? euroFieldToMinorUnits(data, "economicDeltaMinor", "Variazione", { allowNegative: true, required: true }) : null; const rangeMinimumMinor = priceMode === "RANGE" ? euroFieldToMinorUnits(data, "rangeMinimumMinor", "Importo minimo", { required: true }) : null; const rangeMaximumMinor = priceMode === "RANGE" ? euroFieldToMinorUnits(data, "rangeMaximumMinor", "Importo massimo", { required: true }) : null; return requestJson(endpoint, { expectedRevision: revision, representedSide: side, payload: { schemaVersion: 1, priceMode, changeSummary: data.get("summary"), reason: data.get("reason"), affectedStepIds: [], previousPriceMinor, economicDeltaMinor, rangeMinimumMinor, rangeMaximumMinor, scheduleImpact: data.get("scheduleImpact") || null, estimatedCompletionAt: null, collaboratorParticipantIds: [], conditions: data.get("conditions") || null }, effects: [], expiresAt: null }, { idempotent: true }); }, "Proposta registrata."); }}><FormShell title="Proponi una modifica" state={mutation.state}><TextareaField required label="Modifica proposta" name="summary" /><TextareaField required label="Motivazione" name="reason" /><SelectField className="h-9 w-full" disabled={mutation.state.pending} label="Variazione economica" name="priceMode" options={[{ label: "Nessuna variazione economica", value: "NO_PRICE_CHANGE" }, { label: "Variazione fissa", value: "FIXED_DELTA" }, { label: "Intervallo economico", value: "RANGE" }]} /><EuroInputField name="previousPriceMinor" label="Importo precedente" /><EuroInputField allowNegative name="economicDeltaMinor" label="Variazione" /><div className="grid grid-cols-2 gap-2"><EuroInputField name="rangeMinimumMinor" label="Importo minimo" /><EuroInputField name="rangeMaximumMinor" label="Importo massimo" /></div><TextareaField label="Impatto sui tempi" optional name="scheduleImpact" /><TextareaField label="Condizioni" optional name="conditions" /><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Registrazione…" : "Crea proposta"}</Button></FormShell></form>;
}

export function DisputeForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, title: data.get("title"), description: data.get("description"), references: [] }, { idempotent: true }), "Disaccordo registrato."); }}><FormShell title="Segnala un disaccordo" state={mutation.state}><p className="text-sm text-muted-foreground">Usa questo spazio quando le parti non condividono una posizione. Qoovex registra il confronto e gli eventuali accordi, ma non decide chi ha ragione.</p><InputField required label="Titolo" name="title" /><TextareaField required label="Descrivi il disaccordo" name="description" /><Button disabled={mutation.state.pending} type="submit">Apri disaccordo</Button></FormShell></form>;
}

export function RequestForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, type: data.get("type"), title: data.get("title"), body: data.get("body"), blocking: data.get("blocking") === "on", stepId: null, proposalId: null, paymentRequestId: null, timelineEventId: null }, { idempotent: true }), "Richiesta registrata."); }}><FormShell title="Apri una richiesta" state={mutation.state}><p className="text-sm text-muted-foreground">Usa una richiesta per un chiarimento, un'informazione, un aggiornamento o un problema operativo da gestire con l'altra parte. Per un disaccordo tra le parti usa la sezione dedicata.</p><SelectField className="h-9 w-full" description="Un problema operativo resta una richiesta: l'altra parte può rispondere e chi l'ha aperta può chiuderla." disabled={mutation.state.pending} label="Argomento della richiesta" name="type" options={jobSiteRequestTypeOptions} /><InputField required label="Titolo" name="title" /><TextareaField required label="Dettagli" name="body" /><CheckboxField description="Se selezionata, la chiusura resta sospesa finché questa richiesta è aperta." disabled={mutation.state.pending} label="Impedisci la chiusura finché la richiesta è aperta" name="blocking" /><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Creazione…" : "Crea richiesta"}</Button></FormShell></form>;
}

export function ActionButton<TResult = Record<string, unknown>>({ endpoint, body, label, success, confirmMessage, method, onSuccess, mapError }: { endpoint: string; body: Record<string, unknown>; label: string; success: string; confirmMessage?: string; method?: string; onSuccess?: (result: TResult) => void; mapError?: (message: string) => string }) {
  const mutation = useMutation();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const runAction = () => void mutation.run(() => requestJson<TResult>(endpoint, body, { idempotent: true, method }), success, { onSuccess, mapError });

  function closeConfirmation(open: boolean) {
    setConfirmationOpen(open);
    if (!open) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return <div>
    <Button disabled={mutation.state.pending} onClick={() => confirmMessage ? setConfirmationOpen(true) : runAction()} ref={triggerRef} type="button">{mutation.state.pending ? "Attendi…" : label}</Button>
    {confirmMessage ? <Dialog onOpenChange={closeConfirmation} open={confirmationOpen}><DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm"><DialogHeader><DialogTitle>Conferma azione</DialogTitle><DialogDescription>{confirmMessage}</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose><Button disabled={mutation.state.pending} onClick={() => { setConfirmationOpen(false); runAction(); requestAnimationFrame(() => triggerRef.current?.focus()); }} type="button">{mutation.state.pending ? "Attendi…" : label}</Button></DialogFooter></DialogContent></Dialog> : null}
    {mutation.state.error ? <p role="alert" className="mt-2 text-sm text-destructive">{mutation.state.error}</p> : null}
    {mutation.state.success ? <p role="status" className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{mutation.state.success}</p> : null}
  </div>;
}

type ClosureConfirmationDecision = "ACCEPTED" | "REJECTED";

export function closureConfirmationAction(closureId: string, expectedRevision: number, decision: ClosureConfirmationDecision) {
  return { action: "JOB_SITE_CLOSE@1" as const, closureId, expectedRevision, decision };
}

export function isStaleClosureAction(message: string) {
  return /riepilogo.*chiusura.*(?:obsolet|non disponibile)|chiusura.*(?:obsolet|non disponibile)|azione non disponibile nello stato corrente|JOB_SITE_STATE_CONFLICT|cantiere.*(?:modificat|non chiudibile)|STALE_CLOSURE|expectedRevision|\brevision\b/i.test(message);
}

export function presentClosureActionError(message: string) {
  if (isStaleClosureAction(message)) return "La chiusura è cambiata o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.";
  return "Non è stato possibile registrare la conferma della chiusura. Riprova dopo aver controllato il riepilogo.";
}

export function ClosureConfirmationActions({ endpoint, closureId, revision, viewer }: { endpoint: string; closureId: string; revision: number; viewer: "CLIENT" | "ORGANIZATION" }) {
  const router = useRouter();
  const mutation = useMutation();
  const [decision, setDecision] = useState<ClosureConfirmationDecision | null>(null);
  const [stale, setStale] = useState(false);
  const isConfirmation = decision === "ACCEPTED";
  const isClient = viewer === "CLIENT";

  useEffect(() => setStale(false), [closureId, revision]);

  function closeDialog(open: boolean) {
    if (!open && !mutation.state.pending) setDecision(null);
  }

  function presentError(message: string) {
    if (isStaleClosureAction(message)) setStale(true);
    return presentClosureActionError(message);
  }

  function submit() {
    if (!decision || stale) return;
    const success = decision === "ACCEPTED"
      ? isClient
        ? "La tua conferma è stata registrata. Ora l'Azienda deve confermare la chiusura."
        : "La tua conferma è stata registrata. Il lavoro risulta chiuso."
      : "La chiusura non è stata confermata. Il lavoro resta attivo.";
    void mutation.run(
      () => requestJson(endpoint, closureConfirmationAction(closureId, revision, decision), { idempotent: true }),
      success,
      { mapError: presentError, onSuccess: () => { setDecision(null); router.refresh(); } },
    );
  }

  const disabled = mutation.state.pending || stale;
  const dialogTitle = isConfirmation ? "Conferma la chiusura del lavoro" : "Non confermare la chiusura";
  const dialogDescription = isConfirmation
    ? isClient
      ? "Stai confermando il riepilogo della chiusura mostrato sopra. Dopo la tua conferma, l'Azienda dovrà registrare la propria prima che il lavoro risulti chiuso."
      : "Il Cliente ha già confermato il riepilogo della chiusura mostrato sopra. Con la tua conferma il lavoro risulterà chiuso."
    : "La chiusura non sarà confermata e il lavoro resterà attivo. Potrai continuare a gestire gli elementi del cantiere.";

  return <div aria-busy={mutation.state.pending} className="space-y-3">
    {stale ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-destructive">La chiusura non è più aggiornabile da questa pagina.</p><Button onClick={() => router.refresh()} size="sm" type="button" variant="outline">Aggiorna stato</Button></div> : null}
    <Dialog onOpenChange={closeDialog} open={decision !== null}>
      <div className="flex flex-wrap gap-2">
        <DialogTrigger render={<Button disabled={disabled} onClick={() => setDecision("ACCEPTED")} type="button" />}>Conferma il riepilogo e chiudi il lavoro</DialogTrigger>
        {isClient ? <DialogTrigger render={<Button disabled={disabled} onClick={() => setDecision("REJECTED")} type="button" variant="outline" />}>Non confermare la chiusura</DialogTrigger> : null}
      </div>
      <DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {stale ? <p role="alert" className="text-sm text-destructive">La chiusura è cambiata. Chiudi questa finestra e aggiorna la pagina prima di continuare.</p> : null}
        {mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}
        {mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Registrazione in corso…</p> : null}
        <DialogFooter>
          <DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose>
          <Button disabled={disabled} onClick={submit} type="button" variant={isConfirmation ? "default" : "outline"}>{mutation.state.pending ? "Attendi…" : isConfirmation ? "Conferma la chiusura" : "Conferma la scelta"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}

type ReopeningConfirmationDecision = "ACCEPTED" | "REJECTED";

export function reopeningConfirmationAction(reopeningProposalId: string, expectedRevision: number, decision: ReopeningConfirmationDecision) {
  return { action: "JOB_SITE_REOPEN@1" as const, reopeningProposalId, expectedRevision, decision };
}

export function isStaleReopeningAction(message: string) {
  return /proposta di riapertura.*(?:obsolet|non disponibile)|riapertura.*(?:obsolet|non disponibile)|azione non disponibile nello stato corrente|JOB_SITE_STATE_CONFLICT|cantiere.*(?:modificat|non chiuso)|expectedRevision|\brevision\b/i.test(message);
}

export function presentReopeningActionError(message: string) {
  if (isStaleReopeningAction(message)) return "La proposta di riapertura è cambiata o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.";
  return "Non è stato possibile registrare la tua scelta sulla riapertura. Riprova dopo aver controllato la proposta.";
}

export function ReopeningConfirmationActions({ endpoint, reopeningProposalId, revision }: { endpoint: string; reopeningProposalId: string; revision: number }) {
  const router = useRouter();
  const mutation = useMutation();
  const [decision, setDecision] = useState<ReopeningConfirmationDecision | null>(null);
  const [stale, setStale] = useState(false);
  const isConfirmation = decision === "ACCEPTED";

  useEffect(() => setStale(false), [reopeningProposalId, revision]);

  function closeDialog(open: boolean) {
    if (!open && !mutation.state.pending) setDecision(null);
  }

  function presentError(message: string) {
    if (isStaleReopeningAction(message)) setStale(true);
    return presentReopeningActionError(message);
  }

  function submit() {
    if (!decision || stale) return;
    const success = decision === "ACCEPTED"
      ? "La riapertura è stata confermata. Il cantiere torna alle sezioni operative."
      : "La riapertura non è stata confermata. Il cantiere resta nello stato attuale.";
    void mutation.run(
      () => requestJson(endpoint, reopeningConfirmationAction(reopeningProposalId, revision, decision), { idempotent: true }),
      success,
      { focusFallbackId: "riepilogo", mapError: presentError, onSuccess: () => { setDecision(null); router.refresh(); } },
    );
  }

  const disabled = mutation.state.pending || stale;
  const dialogTitle = isConfirmation ? "Conferma la riapertura del cantiere" : "Non confermare la riapertura";
  const dialogDescription = isConfirmation
    ? "Stai confermando la proposta mostrata sopra. Con questa conferma il cantiere tornerà alle sezioni operative."
    : "La proposta non verrà applicata e il cantiere resterà nello stato attuale.";

  return <div aria-busy={mutation.state.pending} className="space-y-3">
    {stale ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-destructive">La proposta di riapertura non è più aggiornabile da questa pagina.</p><Button onClick={() => router.refresh()} size="sm" type="button" variant="outline">Aggiorna stato</Button></div> : null}
    <Dialog onOpenChange={closeDialog} open={decision !== null}>
      <div className="flex flex-wrap gap-2">
        <DialogTrigger render={<Button disabled={disabled} onClick={() => setDecision("ACCEPTED")} type="button" />}>Conferma la riapertura</DialogTrigger>
        <DialogTrigger render={<Button disabled={disabled} onClick={() => setDecision("REJECTED")} type="button" variant="outline" />}>Non confermare</DialogTrigger>
      </div>
      <DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {stale ? <p role="alert" className="text-sm text-destructive">La proposta di riapertura è cambiata. Chiudi questa finestra e aggiorna la pagina prima di continuare.</p> : null}
        {mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}
        {mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Registrazione in corso…</p> : null}
        <DialogFooter>
          <DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose>
          <Button disabled={disabled} onClick={submit} type="button" variant={isConfirmation ? "default" : "outline"}>{mutation.state.pending ? "Attendi…" : isConfirmation ? "Conferma la riapertura" : "Conferma la scelta"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}

type InitialAgreementDecision = "ACCEPTED" | "REJECTED";

export function initialAgreementConfirmationAction(agreementVersionId: string, expectedRevision: number, decision: InitialAgreementDecision) {
  return { action: "INITIAL_AGREEMENT_CONFIRM@1" as const, agreementVersionId, expectedRevision, decision };
}

export function presentInitialAgreementActionError(message: string) {
  if (/versione del riepilogo non disponibile|cantiere.*(?:modificato|non disponibile)|expectedRevision|\brevision\b/i.test(message)) return "Il riepilogo è cambiato o non è più in attesa di conferma. Aggiorna la pagina e controlla l'ultima versione.";
  return "Non è stato possibile registrare la tua scelta. Riprova oppure chiedi all'Azienda di controllare il riepilogo.";
}

export function InitialAgreementActions({ agreementVersionId, endpoint, revision }: { agreementVersionId: string; endpoint: string; revision: number }) {
  const router = useRouter();
  const mutation = useMutation();
  const [decision, setDecision] = useState<InitialAgreementDecision | null>(null);
  const isConfirmation = decision === "ACCEPTED";
  const submitLabel = isConfirmation ? "Conferma questa versione" : "Invia richiesta di correzioni";
  const success = isConfirmation ? "Riepilogo iniziale confermato. Il cantiere è ora attivo." : "Richiesta di correzioni inviata. L'Azienda preparerà un nuovo riepilogo.";

  function closeDialog(open: boolean) {
    if (!open && !mutation.state.pending) setDecision(null);
  }

  function submit() {
    if (!decision) return;
    void mutation.run(
      () => requestJson(endpoint, initialAgreementConfirmationAction(agreementVersionId, revision, decision), { idempotent: true }),
      success,
      { mapError: presentInitialAgreementActionError, onSuccess: () => { setDecision(null); router.refresh(); } },
    );
  }

  return <div aria-busy={mutation.state.pending}>
    <p className="text-sm text-muted-foreground">Confermi soltanto il riepilogo mostrato sopra. Se l'Azienda lo aggiorna prima della tua scelta, non potrai confermare una versione diversa senza rivederla.</p>
    <Dialog onOpenChange={closeDialog} open={decision !== null}>
      <div className="mt-4 flex flex-wrap gap-3">
        <DialogTrigger render={<Button disabled={mutation.state.pending} onClick={() => setDecision("ACCEPTED")} type="button" />}>Conferma questa versione del riepilogo</DialogTrigger>
        <DialogTrigger render={<Button disabled={mutation.state.pending} onClick={() => setDecision("REJECTED")} type="button" variant="outline" />}>Richiedi correzioni</DialogTrigger>
      </div>
      <DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm">
        <DialogHeader>
          <DialogTitle>{isConfirmation ? "Conferma il riepilogo iniziale" : "Richiedi correzioni al riepilogo"}</DialogTitle>
          <DialogDescription>{isConfirmation ? "Stai per confermare il riepilogo iniziale mostrato sopra. Dopo la conferma il cantiere sarà attivo e potrai usare le sezioni condivise." : "La tua richiesta impedirà la conferma di questo riepilogo. L'Azienda dovrà pubblicarne uno nuovo prima che tu possa confermare."}</DialogDescription>
        </DialogHeader>
        {mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}
        {mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Operazione in corso…</p> : null}
        <DialogFooter>
          <DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose>
          <Button disabled={mutation.state.pending} onClick={submit} type="button">{mutation.state.pending ? "Attendi…" : submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}

type ChangeProposalDecision = "ACCEPTED" | "REJECTED";

export function changeProposalDecisionAction({ decision, proposalId, revision, versionId }: { decision: ChangeProposalDecision; proposalId: string; revision: number; versionId: string }) {
  return { action: "CHANGE_PROPOSAL_APPLY@1" as const, decision, expectedRevision: revision, proposalId, versionId };
}

export function isStaleChangeProposalAction(message: string) {
  return /proposta.*(?:non disponibile|obsolet)|cantiere.*modificat|STALE_(?:PROPOSAL|REVISION)|expectedRevision|\brevision\b/i.test(message);
}

export function presentChangeProposalActionError(message: string) {
  if (isStaleChangeProposalAction(message)) return "La proposta è cambiata, è già stata gestita o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.";
  return "Non è stato possibile registrare la tua scelta sulla proposta. Riprova dopo averne controllato i dettagli.";
}

export function ChangeProposalActions({ actionsEndpoint, counterEndpoint, proposalId, revision, versionId, versionNumber }: { actionsEndpoint: string; counterEndpoint: string; proposalId: string; revision: number; versionId: string; versionNumber: number }) {
  const router = useRouter();
  const mutation = useMutation();
  const [dialog, setDialog] = useState<ChangeProposalDecision | "COUNTER" | null>(null);
  const [stale, setStale] = useState(false);
  const decision = dialog === "ACCEPTED" || dialog === "REJECTED" ? dialog : null;
  const isAcceptance = decision === "ACCEPTED";

  useEffect(() => setStale(false), [revision, versionId]);

  function closeDialog(open: boolean) {
    if (!open && !mutation.state.pending) setDialog(null);
  }

  function presentError(message: string) {
    if (isStaleChangeProposalAction(message)) setStale(true);
    return presentChangeProposalActionError(message);
  }

  function submitDecision() {
    if (!decision || stale) return;
    const success = decision === "ACCEPTED"
      ? "Accettazione registrata. La proposta è stata applicata."
      : "Rifiuto registrato. La proposta non verrà applicata.";
    void mutation.run(
      () => requestJson(actionsEndpoint, changeProposalDecisionAction({ decision, proposalId, revision, versionId }), { idempotent: true }),
      success,
      { mapError: presentError, onSuccess: () => { setDialog(null); router.refresh(); } },
    );
  }

  const disabled = mutation.state.pending || stale;
  const dialogTitle = dialog === "COUNTER" ? "Prepara una controproposta" : isAcceptance ? "Accetta la proposta" : "Rifiuta la proposta";
  const dialogDescription = dialog === "COUNTER"
    ? "Stai preparando una controproposta alla proposta mostrata sopra. Se questa proposta cambia prima dell'invio, Qoovex non registrerà una controproposta su contenuti non aggiornati."
    : isAcceptance
      ? "Stai per accettare la proposta mostrata sopra. La tua accettazione verrà registrata e saranno applicati gli effetti inclusi nella proposta."
      : "Stai per rifiutare la proposta mostrata sopra. Il rifiuto verrà registrato e gli effetti inclusi nella proposta non saranno applicati.";

  return <div aria-busy={mutation.state.pending} className="space-y-3">
    <p className="text-sm text-muted-foreground">Le azioni riguardano soltanto la proposta mostrata sopra. Se cambia o viene già gestita, la scelta non verrà registrata su una proposta diversa.</p>
    {stale ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-destructive">La proposta non è più aggiornabile da questa pagina.</p><Button onClick={() => router.refresh()} size="sm" type="button" variant="outline">Aggiorna proposta</Button></div> : null}
    <Dialog onOpenChange={closeDialog} open={dialog !== null}>
      <div className="flex flex-wrap gap-2">
        <DialogTrigger render={<Button disabled={disabled} onClick={() => setDialog("ACCEPTED")} size="sm" type="button" />}>Accetta la proposta mostrata</DialogTrigger>
        <DialogTrigger render={<Button disabled={disabled} onClick={() => setDialog("REJECTED")} size="sm" type="button" variant="outline" />}>Rifiuta questa proposta</DialogTrigger>
        <DialogTrigger render={<Button disabled={disabled} onClick={() => setDialog("COUNTER")} size="sm" type="button" variant="outline" />}>Prepara controproposta</DialogTrigger>
      </div>
      <DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {stale ? <p role="alert" className="text-sm text-destructive">La proposta non è più aggiornata. Chiudi questa finestra e aggiorna la pagina prima di continuare.</p> : null}
        {mutation.state.error && dialog !== "COUNTER" ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}
        {mutation.state.pending && dialog !== "COUNTER" ? <p role="status" className="text-sm text-muted-foreground">Registrazione in corso…</p> : null}
        {dialog === "COUNTER" ? <ProposalCounterForm disabled={disabled} endpoint={counterEndpoint} onStale={() => setStale(true)} onSuccess={() => setDialog(null)} revision={revision} currentVersion={versionNumber} /> : <DialogFooter>
          <DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose>
          <Button disabled={disabled} onClick={submitDecision} type="button" variant={isAcceptance ? "default" : "outline"}>{mutation.state.pending ? "Registrazione…" : isAcceptance ? "Conferma accettazione" : "Conferma rifiuto"}</Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  </div>;
}

type ContextualAttachmentCategory = "REQUEST" | "PROPOSAL" | "DISPUTE" | "PAYMENT_RECEIPT";

export interface JobSiteAttachmentContext {
  category: ContextualAttachmentCategory;
  relatedId: string;
  title: string;
}

export function contextualAttachmentFormData(data: FormData, context: JobSiteAttachmentContext, revision: number) {
  data.set("expectedRevision", String(revision));
  data.set("category", context.category);
  data.set("relatedId", context.relatedId);
  return data;
}

function ContextualAttachmentForm({ client, context, endpoint, revision }: { client: boolean; context: JobSiteAttachmentContext; endpoint: string; revision: number }) {
  const mutation = useMutation();

  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = contextualAttachmentFormData(new FormData(event.currentTarget), context, revision); if (client) data.set("audience", "SHARED"); void mutation.run(() => requestJson(endpoint, null, { idempotent: true, formData: data }), "File caricato."); }}><FormShell title={context.title} state={mutation.state}><p className="text-sm text-muted-foreground">Il file sarà allegato all'elemento mostrato qui sopra.</p><InputField accept=".pdf,.jpg,.jpeg,.png,.webp" description="PDF e immagini JPG, PNG o WebP, fino a 4 MB." disabled={mutation.state.pending} required label="File" name="file" type="file" />{!client ? <SelectField className="h-9 w-full" description="Scegli se il file resta interno oppure viene condiviso con il cliente." disabled={mutation.state.pending} label="Visibilità" name="audience" options={[{ label: "Solo Azienda", value: "INTERNAL" }, { label: "Condiviso con il cliente", value: "SHARED" }]} /> : null}<Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Caricamento…" : "Carica file"}</Button></FormShell></form>;
}

type AttachmentFormProps =
  | { client: true; context: JobSiteAttachmentContext; endpoint: string; revision: number }
  | { client?: false; context?: JobSiteAttachmentContext; endpoint: string; revision: number };

export function AttachmentForm(props: AttachmentFormProps) {
  if (props.client) return <ContextualAttachmentForm client context={props.context} endpoint={props.endpoint} revision={props.revision} />;
  if (props.context) return <ContextualAttachmentForm client={false} context={props.context} endpoint={props.endpoint} revision={props.revision} />;
  return <OrganizationAttachmentForm endpoint={props.endpoint} revision={props.revision} />;
}

function OrganizationAttachmentForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();

  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); data.set("expectedRevision", String(revision)); void mutation.run(() => requestJson(endpoint, null, { idempotent: true, formData: data }), "File caricato."); }}><FormShell title="Aggiungi file al cantiere" state={mutation.state}><p className="text-sm text-muted-foreground">Usa questo caricamento solo per file del cantiere che non appartengono a una richiesta, proposta, disaccordo o pagamento.</p><InputField accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov" description="PDF, immagini JPG, PNG o WebP e video MP4, WebM o MOV, fino a 4 MB." disabled={mutation.state.pending} required label="File" name="file" type="file" /><SelectField className="h-9 w-full" disabled={mutation.state.pending} label="Tipo di file" name="category" options={[{ label: "File generico", value: "GENERAL" }, { label: "Fotografia", value: "PHOTO" }, { label: "Video", value: "VIDEO" }, { label: "Prova documentale", value: "EVIDENCE" }, { label: "Ricevuta di spesa", value: "EXPENSE_RECEIPT" }, { label: "Documento", value: "DOCUMENT" }]} /><SelectField className="h-9 w-full" description="Scegli se il file resta interno oppure viene condiviso con il cliente." disabled={mutation.state.pending} label="Visibilità" name="audience" options={[{ label: "Solo Azienda", value: "INTERNAL" }, { label: "Condiviso con il cliente", value: "SHARED" }]} /><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Caricamento…" : "Carica file"}</Button></FormShell></form>;
}

export function PropertyForm() {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson("/api/client/properties", { displayName: data.get("displayName"), addressLine: data.get("addressLine") || null, city: data.get("city") || null, postalCode: data.get("postalCode") || null, countryCode: String(data.get("countryCode") || "").toUpperCase() || null, privateNotes: data.get("notes") || null }), "Immobile creato."); }}><FormShell title="Nuovo immobile privato" state={mutation.state}><InputField required label="Nome dell'immobile" name="displayName" /><InputField label="Indirizzo" optional name="addressLine" /><div className="grid grid-cols-2 gap-2"><InputField label="Città" optional name="city" /><InputField label="CAP" optional name="postalCode" /></div><InputField maxLength={2} label="Paese" optional name="countryCode" placeholder="es. IT" /><TextareaField description="Visibili solo a te." label="Note private" optional name="notes" /><Button disabled={mutation.state.pending} type="submit">Crea immobile</Button></FormShell></form>;
}

export function LinkPropertyForm({ propertyId, jobSites }: { propertyId: string; jobSites: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  if (!jobSites.length) return null;
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} className="mt-3 flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(`/api/client/properties/${propertyId}/job-sites`, { jobSiteId: data.get("jobSiteId") }), "Lavoro aggiunto al tuo immobile."); }}><FormErrorProvider fieldErrors={mutation.state.fieldErrors}><SelectField className="h-9 w-full min-w-48" disabled={mutation.state.pending} fieldClassName="min-w-48 flex-1" label="Lavoro da aggiungere" name="jobSiteId" options={jobSites.map((site) => ({ label: site.label, value: site.id }))} /><Button disabled={mutation.state.pending} size="sm" type="submit">{mutation.state.pending ? "Aggiunta…" : "Aggiungi al tuo immobile"}</Button>{mutation.state.error ? <p role="alert" className="w-full text-sm text-destructive">{mutation.state.error}</p> : null}</FormErrorProvider></form>;
}

export function PaymentProfileForm({ endpoint, revision }: { endpoint: string; revision: number | null }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { accountHolder: data.get("accountHolder"), iban: data.get("iban"), expectedRevision: revision }, { method: "PUT" }), "Profilo pagamento aggiornato."); }}><FormShell title="Profilo pagamento protetto da MFA" state={mutation.state}><InputField required label="Intestatario del conto" name="accountHolder" /><InputField autoComplete="off" required label="IBAN" name="iban" /><Button disabled={mutation.state.pending} type="submit">Salva profilo</Button></FormShell></form>;
}

export function PostClosureForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, title: data.get("title"), body: data.get("body") }, { idempotent: true }), "Richiesta post-chiusura registrata."); }}><FormShell title="Richiesta post-chiusura" state={mutation.state}><InputField required label="Titolo" name="title" /><TextareaField required label="Dettagli" name="body" /><Button disabled={mutation.state.pending} type="submit">Invia richiesta</Button></FormShell></form>;
}

export function ReopeningForm({ endpoint, revision }: { endpoint: string; revision: number }) {
  const router = useRouter();
  const mutation = useMutation();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, postClosureRequestId: null, reason: data.get("reason") }, { idempotent: true }), "Proposta di riapertura inviata. Ora l'altra parte deve decidere.", { focusFallbackId: "riepilogo", onSuccess: () => router.refresh() }); }}><FormShell title="Proponi la riapertura" state={mutation.state}><TextareaField description="Spiega all'altra parte perché chiedi di riportare il cantiere alle sezioni operative." required label="Motivazione" name="reason" /><Button disabled={mutation.state.pending} type="submit">Invia proposta di riapertura</Button></FormShell></form>;
}

export function CollaboratorInviteForm({ endpoint }: { endpoint: string }) {
  const mutation = useMutation();
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { email: data.get("email"), recipientName: data.get("recipientName") || null }), "Invito Collaborator inviato."); }}><FormShell title="Invita Collaborator" state={mutation.state}><InputField label="Nome" optional name="recipientName" /><InputField autoComplete="email" required label="Email" name="email" placeholder="collaboratore@example.com" type="email" /><Button disabled={mutation.state.pending} type="submit">Invita</Button></FormShell></form>;
}

export function ParticipantForm({ endpoint, memberships }: { endpoint: string; memberships: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  if (!memberships.length) return <p className="text-sm text-muted-foreground">Nessun membro Azienda disponibile.</p>;
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { membershipId: data.get("membershipId"), publicRoleLabel: data.get("publicRoleLabel") }), "Collaborator aggiunto al cantiere."); }}><FormShell title="Aggiungi membro esistente" state={mutation.state}><SelectField className="h-9 w-full" disabled={mutation.state.pending} label="Persona" name="membershipId" options={memberships.map((membership) => ({ label: membership.label, value: membership.id }))} /><InputField description="Visibile alle persone che partecipano al cantiere." required label="Ruolo nel cantiere" name="publicRoleLabel" /><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Aggiunta…" : "Aggiungi"}</Button></FormShell></form>;
}

export function PaymentRequestForm({ endpoint, revision, paymentProfileId }: { endpoint: string; revision: number; paymentProfileId: string | null }) {
  const mutation = useMutation();
  if (!paymentProfileId) return <p className="text-sm text-muted-foreground">Configura prima il profilo pagamento.</p>;
  return <form ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => { const amountMinor = euroFieldToMinorUnits(data, "amountMinor", "Importo", { required: true }); return requestJson(endpoint, { action: "PAYMENT_REQUEST_CREATE@1", expectedRevision: revision, paymentProfileId, amountMinor, reason: data.get("reason"), dueAt: null, stepIds: [], proposalIds: [] }, { idempotent: true }); }, "Richiesta di pagamento pubblicata."); }}><FormShell title="Nuova richiesta di pagamento" state={mutation.state}><EuroInputField name="amountMinor" label="Importo" required /><TextareaField required label="Motivo della richiesta" name="reason" /><Button disabled={mutation.state.pending} type="submit">Presenta richiesta</Button></FormShell></form>;
}

type PaymentDeclarationDraft = { method: string; note: string; receiptAttachmentId: string | null; reference: string; transferredAt: string };

export function presentPaymentDeclarationSummary({ amountMinor, reason, receiptAttachments, value }: { amountMinor: string; reason: string; receiptAttachments: Array<{ id: string; label: string }>; value: PaymentDeclarationDraft }) {
  const receipt = receiptAttachments.find((attachment) => attachment.id === value.receiptAttachmentId) ?? null;
  const transferredAt = value.transferredAt ? formatDateTime(value.transferredAt) : "Da indicare";
  return {
    amount: formatEuroFromMinorUnits(amountMinor),
    method: value.method.trim() || "Da indicare",
    note: value.note.trim() || null,
    reason,
    receipt: receipt?.label ?? "Nessuna ricevuta selezionata",
    reference: value.reference.trim() || null,
    transferredAt,
  };
}

export function PaymentDeclarationForm({ endpoint, revision, paymentRequestId, amountMinor, reason, receiptAttachments }: { endpoint: string; revision: number; paymentRequestId: string; amountMinor: string; reason: string; receiptAttachments: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  const [draft, setDraft] = useState<PaymentDeclarationDraft>({ method: "", note: "", receiptAttachmentId: null, reference: "", transferredAt: "" });
  const summary = presentPaymentDeclarationSummary({ amountMinor, reason, receiptAttachments, value: draft });
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { action: "PAYMENT_TRANSFER_DECLARE@1", expectedRevision: revision, paymentRequestId, amountMinor, transferredAt: new Date(String(data.get("transferredAt"))).toISOString(), method: data.get("method"), reference: data.get("reference") || null, note: data.get("note") || null, receiptAttachmentId: data.get("receiptAttachmentId") || null }, { idempotent: true }), "Dichiarazione inviata all'Azienda. L'Azienda dovrà registrare un esito."); }}><FormErrorProvider fieldErrors={mutation.state.fieldErrors}><div className="space-y-3"><div><h4 className="font-medium">Dichiara pagamento effettuato</h4><p className="mt-1 text-sm text-muted-foreground">Dichiari di aver effettuato il pagamento fuori da Qoovex. Qoovex registra la tua dichiarazione e non esegue né verifica automaticamente il pagamento.</p></div><InputField required label="Data e ora del pagamento" name="transferredAt" onChange={(event) => setDraft((current) => ({ ...current, transferredAt: event.currentTarget.value }))} type="datetime-local" /><InputField required label="Metodo di pagamento" name="method" onChange={(event) => setDraft((current) => ({ ...current, method: event.currentTarget.value }))} />{receiptAttachments.length ? <SelectField className="h-9 w-full" disabled={mutation.state.pending} label="Ricevuta o prova" optional name="receiptAttachmentId" onValueChange={(value) => setDraft((current) => ({ ...current, receiptAttachmentId: value ?? null }))} options={receiptAttachments.map((attachment) => ({ label: attachment.label, value: attachment.id }))} placeholder="Nessuna ricevuta selezionata" value={draft.receiptAttachmentId} /> : <p className="text-sm text-muted-foreground">Puoi allegare una ricevuta o una prova nella sezione qui sotto. Dopo il caricamento sarà disponibile qui.</p>}<InputField label="Riferimento" optional name="reference" onChange={(event) => setDraft((current) => ({ ...current, reference: event.currentTarget.value }))} /><TextareaField label="Nota" optional name="note" onChange={(event) => setDraft((current) => ({ ...current, note: event.currentTarget.value }))} /><section aria-label="Riepilogo della dichiarazione" className="rounded-md border bg-muted/30 p-3"><h5 className="font-medium">Riepilogo della dichiarazione</h5><dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Importo della richiesta</dt><dd>{summary.amount}</dd></div><div><dt className="text-muted-foreground">Motivo</dt><dd>{summary.reason}</dd></div><div><dt className="text-muted-foreground">Data e ora indicate</dt><dd>{summary.transferredAt}</dd></div><div><dt className="text-muted-foreground">Metodo indicato</dt><dd>{summary.method}</dd></div><div><dt className="text-muted-foreground">Ricevuta o prova</dt><dd>{summary.receipt}</dd></div>{summary.reference ? <div><dt className="text-muted-foreground">Riferimento indicato</dt><dd>{summary.reference}</dd></div> : null}{summary.note ? <div className="sm:col-span-2"><dt className="text-muted-foreground">Nota indicata</dt><dd>{summary.note}</dd></div> : null}</dl><p className="mt-3 text-sm text-muted-foreground">Verrà registrata la tua dichiarazione per questa richiesta. L'Azienda potrà poi registrare un esito.</p></section><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Invio della dichiarazione…" : "Dichiara pagamento effettuato"}</Button>{mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Invio della dichiarazione in corso…</p> : null}{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}{mutation.state.success ? <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{mutation.state.success}</p> : null}</div></FormErrorProvider></form>;
}

const PAYMENT_REVIEW_OUTCOMES = [
  { description: "Registra che l'importo risulta ricevuto dall'Azienda.", label: "Indica ricezione dell'importo", value: "CONFIRMED_RECEIVED" },
  { description: "Registra che la ricezione non risulta all'Azienda.", label: "Indica ricezione non risultata", value: "NOT_RECEIVED" },
  { description: "Registra che l'importo non risulta corrispondente.", label: "Indica importo non corrispondente", value: "AMOUNT_MISMATCH" },
  { description: "Mantiene la dichiarazione in revisione finché servono chiarimenti.", label: "Richiedi un chiarimento", value: "CLARIFICATION_REQUIRED" },
] as const;

type PaymentReviewOutcome = typeof PAYMENT_REVIEW_OUTCOMES[number]["value"];
type PaymentDeclarationForReview = {
  amountMinor: string;
  createdAt: string;
  declaredBy: { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } };
  method: string;
  note: string | null;
  receiptFileName: string | null;
  reference: string | null;
  transferredAt: string;
};
type PaymentReviewForDisplay = {
  createdAt: string;
  note: string | null;
  outcome: PaymentReviewOutcome;
  reviewedBy: { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } };
};

export function presentPaymentParticipant(participant: PaymentDeclarationForReview["declaredBy"] | PaymentReviewForDisplay["reviewedBy"]) {
  const name = [participant.user.firstName, participant.user.lastName].filter(Boolean).join(" ");
  return name || participant.publicRoleLabel || "Persona non indicata";
}

export function presentPaymentReviewOutcome(outcome: PaymentReviewOutcome) {
  return PAYMENT_REVIEW_OUTCOMES.find((item) => item.value === outcome)!;
}

export function PaymentReviewForm({ actionable = true, declaration, endpoint, paymentRequestId, revision, reviews = [] }: { actionable?: boolean; declaration?: PaymentDeclarationForReview; endpoint: string; paymentRequestId: string; revision: number; reviews?: PaymentReviewForDisplay[] }) {
  const router = useRouter();
  const mutation = useMutation();
  const [outcome, setOutcome] = useState<PaymentReviewOutcome | null>(null);
  const [note, setNote] = useState("");
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const selectedOutcome = outcome ? presentPaymentReviewOutcome(outcome) : null;
  const fieldErrors = choiceError ? { ...mutation.state.fieldErrors, outcome: [choiceError] } : mutation.state.fieldErrors;

  function closeDialog(open: boolean) {
    if (!open && !mutation.state.pending) setConfirmationOpen(false);
  }

  function openConfirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!outcome) {
      setChoiceError("Scegli l'esito da registrare.");
      focusFormField(mutation.formRef.current, "outcome");
      return;
    }
    setChoiceError(null);
    setConfirmationOpen(true);
  }

  function submitReview() {
    if (!outcome) return;
    setConfirmationOpen(false);
    void mutation.run(
      () => requestJson(endpoint, { action: "PAYMENT_RECEIPT_CONFIRM@1", expectedRevision: revision, paymentRequestId, outcome, note: note || null }, { idempotent: true }),
      "Esito registrato dall'Azienda. Lo stato aggiornato indica il prossimo passo.",
      { onSuccess: () => router.refresh() },
    );
  }

  return <div aria-busy={mutation.state.pending} className="mt-4 space-y-4">
    {declaration ? <section aria-label="Dichiarazione del Cliente" className="rounded-md border bg-muted/30 p-3"><h4 className="font-medium">Dichiarazione del Cliente</h4><p className="mt-1 text-sm text-muted-foreground">Il Cliente ha dichiarato di aver effettuato il pagamento fuori da Qoovex. Qoovex registra questa dichiarazione e non la verifica automaticamente.</p><dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Importo dichiarato</dt><dd>{formatEuroFromMinorUnits(declaration.amountMinor)}</dd></div><div><dt className="text-muted-foreground">Dichiarata da</dt><dd>{presentPaymentParticipant(declaration.declaredBy)}</dd></div><div><dt className="text-muted-foreground">Data e ora dichiarate</dt><dd>{formatDateTime(declaration.transferredAt)}</dd></div><div><dt className="text-muted-foreground">Dichiarazione inviata il</dt><dd>{formatDateTime(declaration.createdAt)}</dd></div><div><dt className="text-muted-foreground">Metodo indicato</dt><dd>{declaration.method}</dd></div><div><dt className="text-muted-foreground">Ricevuta o prova</dt><dd>{declaration.receiptFileName ?? "Nessuna ricevuta o prova indicata."}</dd></div>{declaration.reference ? <div><dt className="text-muted-foreground">Riferimento indicato</dt><dd>{declaration.reference}</dd></div> : null}{declaration.note ? <div className="sm:col-span-2"><dt className="text-muted-foreground">Nota del Cliente</dt><dd>{declaration.note}</dd></div> : null}</dl></section> : null}
    {reviews.length ? <section aria-label="Esiti già registrati dall'Azienda" className="space-y-2"><h4 className="font-medium">Esiti già registrati dall'Azienda</h4><ul className="space-y-2">{reviews.map((review, index) => { const presentation = presentPaymentReviewOutcome(review.outcome); return <li className="rounded-md border p-3 text-sm" key={`${review.createdAt}-${index}`}><p className="font-medium">{presentation.label}</p><p className="mt-1 text-muted-foreground">Registrato da {presentPaymentParticipant(review.reviewedBy)} il {formatDateTime(review.createdAt)}.</p>{review.note ? <p className="mt-2">Nota: {review.note}</p> : null}</li>; })}</ul></section> : null}
    {actionable ? <form ref={mutation.formRef} className="grid gap-3" onSubmit={openConfirmation}><FormErrorProvider fieldErrors={fieldErrors}><div><h4 className="font-medium">Registra un esito sulla dichiarazione</h4><p className="mt-1 text-sm text-muted-foreground">L'esito registra ciò che risulta all'Azienda. Non certifica il pagamento e non attribuisce a Qoovex alcuna verifica bancaria.</p></div><SelectField className="h-9 w-full" description={selectedOutcome?.description ?? "Scegli l'esito che risulta all'Azienda."} disabled={mutation.state.pending} label="Esito indicato dall'Azienda" name="outcome" onValueChange={(value) => { setOutcome(value as PaymentReviewOutcome | null); setChoiceError(null); }} options={PAYMENT_REVIEW_OUTCOMES} placeholder="Seleziona un esito" required value={outcome} /><TextareaField disabled={mutation.state.pending} label="Nota" optional name="note" onChange={(event) => setNote(event.currentTarget.value)} value={note} /><Button disabled={mutation.state.pending} type="submit">{mutation.state.pending ? "Registrazione dell'esito…" : "Rivedi dichiarazione"}</Button>{mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Registrazione dell'esito in corso…</p> : null}{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}<Dialog onOpenChange={closeDialog} open={confirmationOpen}><DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm"><DialogHeader><DialogTitle>Conferma l'esito indicato dall'Azienda</DialogTitle><DialogDescription>{selectedOutcome ? `Stai per registrare: ${selectedOutcome.label}. Questa azione registra l'esito dell'Azienda sulla dichiarazione mostrata sopra; Qoovex non verifica automaticamente il pagamento.` : "Scegli un esito prima di continuare."}</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose><Button disabled={mutation.state.pending || !selectedOutcome} onClick={submitReview} type="button">{mutation.state.pending ? "Registrazione…" : "Conferma esito"}</Button></DialogFooter></DialogContent></Dialog></FormErrorProvider></form> : <p className="text-sm text-muted-foreground">Non ci sono altre azioni disponibili per questa dichiarazione nello stato attuale.</p>}
  </div>;
}

export function AuthorityGrantForm({ endpoint, revision, participants }: { endpoint: string; revision: number; participants: Array<{ id: string; label: string }> }) {
  const mutation = useMutation();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  if (!participants.length) return <p className="text-sm text-muted-foreground">Nessun partecipante Azienda disponibile.</p>;
  function closeConfirmation(open: boolean) {
    setConfirmationOpen(open);
    if (!open) requestAnimationFrame(() => submitRef.current?.focus());
  }
  function submitGrant() {
    const form = mutation.formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setConfirmationOpen(false);
    void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, participantId: data.get("participantId"), capabilities: data.getAll("capabilities"), validFrom: new Date().toISOString(), expiresAt: data.get("expiresAt") ? new Date(String(data.get("expiresAt"))).toISOString() : null, reason: data.get("reason") }, { idempotent: true }), "Delega aggiornata.");
  }
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); setConfirmationOpen(true); }}><FormShell title="Concedi autorità economica" state={mutation.state}><SelectField className="h-9 w-full" disabled={mutation.state.pending} label="Persona" name="participantId" options={participants.map((participant) => ({ label: participant.label, value: participant.id }))} /><CheckboxGroupField description="Questi permessi autorizzano la persona a compiere le azioni selezionate per il cantiere." disabled={mutation.state.pending} legend="Permessi economici" name="capabilities" options={[["COMMERCIAL_NEGOTIATE", "Negoziare"], ["COMMERCIAL_ACCEPT", "Accettare"], ["PAYMENT_REQUEST", "Richiedere pagamenti"], ["PAYMENT_CONFIRM_RECEIPT", "Confermare ricezione"], ["CLOSURE_PROPOSE", "Proporre chiusura"]].map(([value, label]) => ({ label, value }))} /><InputField label="Scadenza" optional name="expiresAt" type="datetime-local" /><TextareaField required minLength={10} label="Motivazione" name="reason" /><Button disabled={mutation.state.pending} ref={submitRef} type="submit">{mutation.state.pending ? "Salvataggio…" : "Concedi delega"}</Button><Dialog onOpenChange={closeConfirmation} open={confirmationOpen}><DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm"><DialogHeader><DialogTitle>Conferma la delega economica</DialogTitle><DialogDescription>Stai per concedere alla persona selezionata i permessi economici indicati nel modulo per questo cantiere.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose><Button disabled={mutation.state.pending} onClick={submitGrant} type="button">{mutation.state.pending ? "Salvataggio…" : "Conferma delega"}</Button></DialogFooter></DialogContent></Dialog></FormShell></form>;
}

export function RecordTransitionForm({ actions, description, endpoint, messageLabel = "Messaggio", revision, title }: { actions: Array<{ value: string; label: string }>; description?: string; endpoint: string; messageLabel?: string; revision: number; title?: string }) {
  const mutation = useMutation();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, action: data.get("action"), message: data.get("message") }, { idempotent: true }), "Aggiornamento registrato."); }}><FormErrorProvider fieldErrors={mutation.state.fieldErrors}>{title ? <div><h4 className="font-medium">{title}</h4>{description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}</div> : null}<SelectField className="h-9 w-full" disabled={mutation.state.pending} label="Azione" name="action" options={actions} /><TextareaField required label={messageLabel} name="message" /><Button disabled={mutation.state.pending} size="sm" type="submit">{mutation.state.pending ? "Registrazione…" : "Registra aggiornamento"}</Button>{mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Registrazione dell'aggiornamento in corso…</p> : null}{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}</FormErrorProvider></form>;
}

export function ProposalCounterForm({ currentVersion, disabled = false, endpoint, onStale, onSuccess, revision }: { currentVersion: number; disabled?: boolean; endpoint: string; onStale?: () => void; onSuccess?: () => void; revision: number }) {
  const mutation = useMutation();
  const router = useRouter();
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); if (disabled) return; const data = new FormData(event.currentTarget); void mutation.run(() => requestJson(endpoint, { expectedRevision: revision, expectedCurrentVersion: currentVersion, payload: { schemaVersion: 1, priceMode: "NO_PRICE_CHANGE", changeSummary: data.get("summary"), reason: data.get("reason"), affectedStepIds: [], previousPriceMinor: null, economicDeltaMinor: null, rangeMinimumMinor: null, rangeMaximumMinor: null, scheduleImpact: null, estimatedCompletionAt: null, collaboratorParticipantIds: [], conditions: null }, effects: [], expiresAt: null }, { idempotent: true }), "Controproposta inviata. Ora l'altra parte deve valutarla.", { mapError: (message) => { if (isStaleChangeProposalAction(message)) onStale?.(); return presentChangeProposalActionError(message); }, onSuccess: () => { onSuccess?.(); router.refresh(); } }); }}><FormErrorProvider fieldErrors={mutation.state.fieldErrors}><TextareaField disabled={disabled || mutation.state.pending} required label="Nuova proposta" name="summary" /><TextareaField disabled={disabled || mutation.state.pending} required label="Motivazione" name="reason" /><Button disabled={disabled || mutation.state.pending} size="sm" type="submit">{mutation.state.pending ? "Invio…" : "Invia controproposta"}</Button>{mutation.state.error ? <p role="alert" className="text-sm text-destructive">{mutation.state.error}</p> : null}{mutation.state.pending ? <p role="status" className="text-sm text-muted-foreground">Invio della controproposta in corso…</p> : null}</FormErrorProvider></form>;
}

export function DeleteActionButton({ endpoint, body, label, success, confirmMessage }: { endpoint: string; body: Record<string, unknown>; label: string; success: string; confirmMessage: string }) {
  const mutation = useMutation();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeConfirmation(open: boolean) {
    setConfirmationOpen(open);
    if (!open) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return <div><Button disabled={mutation.state.pending} variant="outline" size="sm" type="button" onClick={() => setConfirmationOpen(true)} ref={triggerRef}>{label}</Button><Dialog onOpenChange={closeConfirmation} open={confirmationOpen}><DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm" variant="destructive"><DialogHeader><DialogTitle>Conferma azione</DialogTitle><DialogDescription>{confirmMessage}</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose><Button disabled={mutation.state.pending} onClick={() => { setConfirmationOpen(false); void mutation.run(() => requestJson(endpoint, body, { method: "DELETE", idempotent: true }), success); requestAnimationFrame(() => triggerRef.current?.focus()); }} type="button" variant="destructive">{mutation.state.pending ? "Attendi…" : label}</Button></DialogFooter></DialogContent></Dialog>{mutation.state.error ? <p role="alert" className="mt-2 text-sm text-destructive">{mutation.state.error}</p> : null}</div>;
}

export function LegalHoldForm({ endpoint }: { endpoint: string }) {
  const mutation = useMutation();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  function closeConfirmation(open: boolean) {
    setConfirmationOpen(open);
    if (!open) requestAnimationFrame(() => submitRef.current?.focus());
  }
  function submitLegalHold() {
    const form = mutation.formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setConfirmationOpen(false);
    void mutation.run(() => requestJson(endpoint, { reason: data.get("reason") }), "Conservazione bloccata.");
  }
  return <form aria-busy={mutation.state.pending} ref={mutation.formRef} onSubmit={(event) => { event.preventDefault(); setConfirmationOpen(true); }}><FormShell title="Conservazione" state={mutation.state}><TextareaField required minLength={10} label="Motivazione della conservazione" name="reason" /><Button disabled={mutation.state.pending} ref={submitRef} type="submit">{mutation.state.pending ? "Salvataggio…" : "Blocca conservazione"}</Button><Dialog onOpenChange={closeConfirmation} open={confirmationOpen}><DialogContent aria-busy={mutation.state.pending} closeButtonProps={{ "aria-label": "Chiudi finestra di conferma" }} size="sm"><DialogHeader><DialogTitle>Conferma il blocco della conservazione</DialogTitle><DialogDescription>I contenuti collegati a questo cantiere non verranno eliminati automaticamente finché il blocco resta attivo.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button disabled={mutation.state.pending} type="button" variant="outline" />}>Annulla</DialogClose><Button disabled={mutation.state.pending} onClick={submitLegalHold} type="button">{mutation.state.pending ? "Salvataggio…" : "Conferma blocco"}</Button></DialogFooter></DialogContent></Dialog></FormShell></form>;
}

export function ReleaseLegalHoldButton({ endpoint, holdId }: { endpoint: string; holdId: string }) {
  const mutation = useMutation();
  return <div><Button variant="outline" disabled={mutation.state.pending} onClick={() => {
    const releaseReason = window.prompt("Motivazione del rilascio (almeno 10 caratteri)");
    if (!releaseReason || releaseReason.trim().length < 10) return;
    void mutation.run(() => requestJson(endpoint, { holdId, releaseReason }, { method: "DELETE" }), "Conservazione rilasciata.");
  }} type="button">Rilascia</Button>{mutation.state.error ? <p role="alert" className="mt-2 text-sm text-destructive">{mutation.state.error}</p> : null}</div>;
}
