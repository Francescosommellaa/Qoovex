"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { captureRefreshFocus, updateWithFocusGuard } from "@shared/lib/focus-management";

export function NotificationPreferencesForm({ organizations }: { organizations: Array<{ id: string; name: string }> }) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  if (!organizations.length) return <p className="text-sm text-muted-foreground">Nessuna Azienda configurabile.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const focusSnapshot = captureRefreshFocus(document, undefined, { allowOriginOnly: true });
    updateWithFocusGuard(() => setPending(true), { snapshot: focusSnapshot });
    setStatus(null);
    try {
      const data = new FormData(event.currentTarget);
      const response = await fetch("/api/account/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: data.get("organizationId"), type: data.get("type"), channel: data.get("channel"), frequency: data.get("frequency") }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: { message?: string } };
      setStatus(response.ok ? "Preferenza salvata." : payload.error?.message ?? "Preferenza non salvata.");
    } catch {
      setStatus("Preferenza non salvata.");
    } finally {
      setPending(false);
    }
  }

  const fields = [
    { label: "Azienda", name: "organizationId", options: organizations.map((organization) => ({ label: organization.name, value: organization.id })) },
    { label: "Tipo di notifica", name: "type", options: [{ label: "Azioni richieste", value: "JOB_SITE_ACTION_REQUIRED" }, { label: "Attività cantiere", value: "JOB_SITE_ACTIVITY" }, { label: "Pagamenti", value: "PAYMENT_ACTIVITY" }, { label: "Segnalazioni", value: "DISPUTE_ACTIVITY" }, { label: "Archivi pronti", value: "EXPORT_READY" }] },
    { label: "Canale", name: "channel", options: [{ label: "Nell'app", value: "IN_APP" }, { label: "Email", value: "EMAIL" }] },
    { description: "Scegli quando ricevere questo tipo di notifica; con Disattivata non riceverai aggiornamenti su questo canale.", label: "Frequenza", name: "frequency", options: [{ label: "Immediata", value: "IMMEDIATE" }, { label: "Riepilogo giornaliero", value: "DAILY_DIGEST" }, { label: "Disattivata", value: "DISABLED" }] },
  ] as const;

  return <form aria-busy={pending} className="grid gap-3" onSubmit={submit}>{fields.map((field) => { const id = `notification-${field.name}`; const descriptionId = "description" in field ? `${id}-description` : undefined; return <Field key={field.name}><FieldLabel htmlFor={id}>{field.label}</FieldLabel><Select defaultValue={field.options[0]?.value} disabled={pending} items={field.options} name={field.name}><SelectTrigger aria-describedby={descriptionId} className="h-9 w-full" data-field-name={field.name} disabled={pending} id={id}><SelectValue /></SelectTrigger><SelectContent align="start"><SelectGroup>{field.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select>{"description" in field ? <FieldDescription id={descriptionId}>{field.description}</FieldDescription> : null}</Field>; })}<Button disabled={pending} type="submit">{pending ? "Salvataggio…" : "Salva preferenza"}</Button>{status ? <p role="status" className="text-sm">{status}</p> : null}</form>;
}
