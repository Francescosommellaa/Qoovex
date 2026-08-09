"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@qoovex/ui/components/button";

export function NotificationPreferencesForm({ organizations }: { organizations: Array<{ id: string; name: string }> }) {
  const [status, setStatus] = useState<string | null>(null);
  if (!organizations.length) return <p className="text-sm text-muted-foreground">Nessuna Azienda configurabile.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/account/notification-preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: data.get("organizationId"), type: data.get("type"), channel: data.get("channel"), frequency: data.get("frequency") }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } };
    setStatus(response.ok ? "Preferenza salvata." : payload.error?.message ?? "Preferenza non salvata.");
  }

  return <form className="grid gap-3" onSubmit={submit}><select className="h-9 rounded-md border bg-background px-3 text-sm" name="organizationId">{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select><select className="h-9 rounded-md border bg-background px-3 text-sm" name="type"><option value="JOB_SITE_ACTION_REQUIRED">Azioni richieste</option><option value="JOB_SITE_ACTIVITY">Attività cantiere</option><option value="PAYMENT_ACTIVITY">Pagamenti</option><option value="DISPUTE_ACTIVITY">Dispute</option><option value="EXPORT_READY">Export pronti</option></select><select className="h-9 rounded-md border bg-background px-3 text-sm" name="channel"><option value="IN_APP">In-app</option><option value="EMAIL">Email</option></select><select className="h-9 rounded-md border bg-background px-3 text-sm" name="frequency"><option value="IMMEDIATE">Immediata</option><option value="DAILY_DIGEST">Riepilogo giornaliero</option><option value="DISABLED">Disattivata</option></select><Button type="submit">Salva preferenza</Button>{status ? <p role="status" className="text-sm">{status}</p> : null}</form>;
}
