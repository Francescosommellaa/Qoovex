"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconAlertCircle, IconArrowRight, IconSearch } from "@tabler/icons-react";
import type { UniversalSearchPage } from "@qoovex/types";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { SearchField, SearchResults } from "@qoovex/ui/components/search-field";
import { Spinner } from "@qoovex/ui/components/spinner";

async function requestSearch(query: string, cursor?: string | null) {
  const response = await fetch("/api/search", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, cursor, take: 20 }),
  });
  const payload = await response.json() as UniversalSearchPage | { message?: string };
  if (!response.ok) throw new Error("message" in payload && payload.message ? payload.message : "Ricerca non disponibile.");
  return payload as UniversalSearchPage;
}

export function UniversalSearchWidget() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<UniversalSearchPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await requestSearch(normalized);
        if (requestId.current === id) setData(response);
      } catch (searchError) {
        if (requestId.current === id) setError(searchError instanceof Error ? searchError.message : "Ricerca non disponibile.");
      } finally {
        if (requestId.current === id) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function loadMore() {
    if (!data?.nextCursor) return;
    setLoading(true);
    setError(null);
    try {
      const next = await requestSearch(query.trim(), data.nextCursor);
      setData({ ...next, items: [...data.items, ...next.items], groups: next.groups, nextCursor: next.nextCursor });
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Ricerca non disponibile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <SearchField
        aria-label="Cerca nei metadati autorizzati"
        autoComplete="off"
        onChange={(event) => setQuery(event.currentTarget.value)}
        onClear={() => setQuery("")}
        placeholder="Cerca documenti, lavoratori, cantieri, processi…"
        value={query}
      />
      <p className="text-xs text-muted-foreground">Solo metadati autorizzati. Nessun contenuto file, token o dato tecnico viene cercato o salvato.</p>
      {error ? <Alert variant="destructive"><IconAlertCircle /><AlertTitle>Ricerca non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {loading && !data ? <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> Ricerca in corso</div> : null}
      {!loading && query.trim().length < 2 ? <Empty><EmptyHeader><EmptyMedia variant="icon"><IconSearch /></EmptyMedia><EmptyTitle>Inizia con almeno due caratteri</EmptyTitle><EmptyDescription>La stringa resta nella richiesta POST e non entra nell’URL.</EmptyDescription></EmptyHeader></Empty> : null}
      {!loading && data && data.items.length === 0 ? <Empty><EmptyHeader><EmptyMedia variant="icon"><IconSearch /></EmptyMedia><EmptyTitle>Nessun risultato autorizzato</EmptyTitle><EmptyDescription>Prova termini diversi o verifica i filtri di accesso.</EmptyDescription></EmptyHeader></Empty> : null}
      {data?.items.length ? (
        <SearchResults>
          {data.items.map((item) => (
            <Card key={`${item.type}:${item.id}`} size="sm">
              <CardHeader><CardTitle>{item.title}</CardTitle><CardDescription>{item.context ?? "Metadato operativo"}</CardDescription></CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2"><Badge variant={item.attention ? "warning" : "outline"}>{item.type.replace(/_/g, " ")}</Badge>{item.status ? <Badge variant="outline">{item.status.replace(/_/g, " ")}</Badge> : null}<span className="text-xs text-muted-foreground">{item.matchReason}</span></div>
                <div className="flex flex-wrap gap-2"><Button render={<Link href={item.href} />} size="sm" variant="outline">Apri <IconArrowRight aria-hidden /></Button>{item.timelineHref ? <Button render={<Link href={item.timelineHref} />} size="sm" variant="ghost">Timeline</Button> : null}</div>
              </CardContent>
            </Card>
          ))}
          {data.nextCursor ? <Button className="justify-self-center" disabled={loading} onClick={loadMore} variant="outline">{loading ? <><Spinner /> Caricamento</> : "Mostra altri"}</Button> : null}
        </SearchResults>
      ) : null}
    </div>
  );
}
