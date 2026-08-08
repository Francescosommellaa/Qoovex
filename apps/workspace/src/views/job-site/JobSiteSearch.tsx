"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";

export function JobSiteSearch({ endpoint }: { endpoint: string }) {
  const [state, setState] = useState<{ pending: boolean; error: string | null; items: Array<Record<string, unknown>> }>({ pending: false, error: null, items: [] });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const query = String(new FormData(event.currentTarget).get("query") ?? "").trim(); if (query.length < 2) return;
    setState({ pending: true, error: null, items: [] }); const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } }); const payload = await response.json().catch(() => ({})) as { items?: Array<Record<string, unknown>>; error?: { message?: string } };
    setState(response.ok ? { pending: false, error: null, items: payload.items ?? [] } : { pending: false, error: payload.error?.message ?? "Ricerca non disponibile.", items: [] });
  }
  return <div className="space-y-3"><form className="flex gap-2" onSubmit={submit}><Input aria-label="Cerca nel cantiere" minLength={2} name="query" placeholder="Cerca metadati" /><Button disabled={state.pending} type="submit">Cerca</Button></form>{state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}{state.items.length ? <ul className="divide-y text-sm">{state.items.map((item) => <li className="py-2" key={String(item.id)}><strong>{String(item.resultType)}</strong><span className="ml-2 text-muted-foreground">{String(item.title ?? item.originalFileName ?? item.type ?? item.status ?? "Risultato")}</span></li>)}</ul> : !state.pending ? <p className="text-sm text-muted-foreground">La ricerca usa soltanto titoli e metadati autorizzati.</p> : null}</div>;
}
