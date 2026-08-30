"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Field, FieldDescription, FieldTitle } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { captureRefreshFocus, updateWithFocusGuard } from "@shared/lib/focus-management";

const TYPE_OPTIONS = [
  { label: "Azioni richieste", value: "JOB_SITE_ACTION_REQUIRED" },
  { label: "Attività cantiere", value: "JOB_SITE_ACTIVITY" },
  { label: "Pagamenti", value: "PAYMENT_ACTIVITY" },
  { label: "Disaccordi", value: "DISPUTE_ACTIVITY" },
  { label: "Archivi pronti", value: "EXPORT_READY" },
] as const;

const CHANNEL_OPTIONS = [
  { label: "Nell’app", value: "IN_APP" },
  { label: "Email", value: "EMAIL" },
] as const;

const FREQUENCY_OPTIONS = [
  { label: "Immediata", value: "IMMEDIATE" },
  { label: "Riepilogo giornaliero", value: "DAILY_DIGEST" },
  { label: "Disattivata", value: "DISABLED" },
] as const;

export function NotificationPreferencesForm({ organizations }: { organizations: Array<{ id: string; name: string }> }) {
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? "");
  const [type, setType] = useState(TYPE_OPTIONS[0].value);
  const [channel, setChannel] = useState(CHANNEL_OPTIONS[0].value);
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[0].value);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mutationInFlightRef = useRef(false);

  useEffect(() => {
    setOrganizationId((current) => organizations.some((organization) => organization.id === current) ? current : organizations[0]?.id ?? "");
  }, [organizations]);

  if (!organizations.length) return <p className="text-sm text-muted-foreground">Nessuna Azienda configurabile.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutationInFlightRef.current) return;
    mutationInFlightRef.current = true;
    const focusSnapshot = captureRefreshFocus(document, undefined, { allowOriginOnly: true });
    updateWithFocusGuard(() => setPending(true), { snapshot: focusSnapshot });
    setStatus(null);
    setError(null);
    try {
      const response = await fetch("/api/account/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, type, channel, frequency }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Preferenza non salvata.");
      setStatus("Preferenza salvata.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Preferenza non salvata.");
    } finally {
      mutationInFlightRef.current = false;
      setPending(false);
    }
  }

  function clearFeedback() {
    setStatus(null);
    setError(null);
  }

  const organizationOptions = organizations.map((organization) => ({ label: organization.name, value: organization.id }));

  return (
    <form aria-busy={pending} className="grid gap-3" onSubmit={submit}>
      {organizations.length === 1 ? (
        <Field>
          <FieldTitle>Azienda</FieldTitle>
          <p className="text-sm text-foreground">{organizations[0]?.name}</p>
          <input name="organizationId" type="hidden" value={organizationId} />
        </Field>
      ) : <PreferenceSelect disabled={pending} id="notification-organizationId" label="Azienda" name="organizationId" onValueChange={(value) => { setOrganizationId(value ?? ""); clearFeedback(); }} options={organizationOptions} value={organizationId} />}
      <PreferenceSelect disabled={pending} id="notification-type" label="Tipo di notifica" name="type" onValueChange={(value) => { setType((value ?? TYPE_OPTIONS[0].value) as typeof type); clearFeedback(); }} options={TYPE_OPTIONS} value={type} />
      <PreferenceSelect disabled={pending} id="notification-channel" label="Canale" name="channel" onValueChange={(value) => { setChannel((value ?? CHANNEL_OPTIONS[0].value) as typeof channel); clearFeedback(); }} options={CHANNEL_OPTIONS} value={channel} />
      <PreferenceSelect description="Scegli quando ricevere questo tipo di notifica; con Disattivata non riceverai aggiornamenti su questo canale." disabled={pending} id="notification-frequency" label="Frequenza" name="frequency" onValueChange={(value) => { setFrequency((value ?? FREQUENCY_OPTIONS[0].value) as typeof frequency); clearFeedback(); }} options={FREQUENCY_OPTIONS} value={frequency} />
      <Button disabled={pending || !organizationId} type="submit">{pending ? "Salvataggio…" : "Salva preferenza"}</Button>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      {status ? <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{status}</p> : null}
    </form>
  );
}

function PreferenceSelect({ description, disabled, id, label, name, onValueChange, options, value }: {
  description?: string;
  disabled: boolean;
  id: string;
  label: string;
  name: string;
  onValueChange: (value: string | null | undefined) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Select disabled={disabled} items={options} name={name} onValueChange={onValueChange} value={value}>
        <SelectTrigger aria-describedby={descriptionId} className="h-9 w-full" data-field-name={name} disabled={disabled} id={id}><SelectValue /></SelectTrigger>
        <SelectContent align="start"><SelectGroup>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
    </Field>
  );
}
