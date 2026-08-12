"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { captureRefreshFocus, updateWithFocusGuard } from "@shared/lib/focus-management";
import { presentSearchResultDetail, presentSearchResultType } from "@shared/lib/product-state-presentation";

export function JobSiteSearch({ endpoint }: { endpoint: string }) {
  const queryId = useId();
  const [state, setState] = useState<{ pending: boolean; error: string | null; items: Array<Record<string, unknown>> }>({ pending: false, error: null, items: [] });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const query = String(new FormData(event.currentTarget).get("query") ?? "").trim(); if (query.length < 2) return;
    const focusSnapshot = captureRefreshFocus(document, undefined, { allowOriginOnly: true });
    updateWithFocusGuard(() => setState({ pending: true, error: null, items: [] }), { snapshot: focusSnapshot });
    const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } }); const payload = await response.json().catch(() => ({})) as { items?: Array<Record<string, unknown>>; error?: { message?: string } };
    setState(response.ok ? { pending: false, error: null, items: payload.items ?? [] } : { pending: false, error: payload.error?.message ?? "Ricerca non disponibile.", items: [] });
  }
  return <div className="space-y-3"><form className="flex items-end gap-2" onSubmit={submit}><Field className="min-w-0 flex-1"><FieldLabel htmlFor={queryId}>Cerca nel cantiere</FieldLabel><Input id={queryId} minLength={2} name="query" placeholder="Aggiornamenti, file o richieste" /></Field><Button disabled={state.pending} type="submit">Cerca</Button></form>{state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}{state.items.length ? <ul className="divide-y text-sm">{state.items.map((item) => { const resultType = String(item.resultType ?? ""); const detail = item.title ?? item.originalFileName ?? item.type ?? item.status; return <li className="py-2" key={String(item.id)}><strong>{presentSearchResultType(resultType).label}</strong><span className="ml-2 text-muted-foreground">{presentSearchResultDetail(resultType, detail)}</span></li>; })}</ul> : !state.pending ? <p className="text-sm text-muted-foreground">La ricerca include soltanto i contenuti del cantiere che puoi consultare.</p> : null}</div>;
}
