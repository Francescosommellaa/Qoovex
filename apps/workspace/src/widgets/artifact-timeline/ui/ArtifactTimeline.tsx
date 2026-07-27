"use client";

import { useEffect, useRef, useState } from "react";
import { IconAlertCircle, IconHistory } from "@tabler/icons-react";
import type { OperationalArtifactType, OperationalTimelinePage } from "@qoovex/types";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Timeline, TimelineActor, TimelineContent, TimelineEntry, TimelineMarker, TimelineTransition } from "@qoovex/ui/components/timeline";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function loadTimeline(type: OperationalArtifactType, id: string, cursor?: string | null, signal?: AbortSignal) {
  const params = new URLSearchParams({ take: "20" });
  if (cursor) params.set("cursor", cursor);
  const response = await fetch(`/api/operations/artifacts/${encodeURIComponent(type)}/${encodeURIComponent(id)}/events?${params}`, { cache: "no-store", signal });
  const payload = await response.json() as OperationalTimelinePage | { message?: string };
  if (!response.ok) throw new Error("message" in payload && payload.message ? payload.message : "Timeline non disponibile.");
  return payload as OperationalTimelinePage;
}

export function ArtifactTimeline({ artifactType, artifactId }: { artifactType: OperationalArtifactType; artifactId: string }) {
  const [data, setData] = useState<OperationalTimelinePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;
    let active = true;
    setLoading(true);
    loadTimeline(artifactType, artifactId, null, controller.signal).then((result) => { if (active) setData(result); }).catch((timelineError) => { if (active && !(timelineError instanceof DOMException && timelineError.name === "AbortError")) setError(timelineError instanceof Error ? timelineError.message : "Timeline non disponibile."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); if (requestRef.current === controller) requestRef.current = null; };
  }, [artifactId, artifactType]);

  async function loadMore() {
    if (!data?.nextCursor) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const next = await loadTimeline(artifactType, artifactId, data.nextCursor, controller.signal);
      setData({ items: [...data.items, ...next.items], nextCursor: next.nextCursor });
    } catch (timelineError) {
      if (!(timelineError instanceof DOMException && timelineError.name === "AbortError")) setError(timelineError instanceof Error ? timelineError.message : "Timeline non disponibile.");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      setLoading(false);
    }
  }

  return (
    <Card id="timeline">
      <CardHeader><CardTitle>Timeline operativa</CardTitle><CardDescription>Eventi prodotto aggregati dai processi collegati; audit e dettagli tecnici restano separati.</CardDescription></CardHeader>
      <CardContent>
        {error ? <Alert variant="destructive"><IconAlertCircle /><AlertTitle>Timeline non disponibile</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
        {loading && !data ? <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> Caricamento timeline</div> : null}
        {data && !data.items.length ? <Empty><EmptyHeader><EmptyMedia variant="icon"><IconHistory /></EmptyMedia><EmptyTitle>Nessun evento collegato</EmptyTitle><EmptyDescription>La timeline si popola senza replicare l’audit tecnico.</EmptyDescription></EmptyHeader></Empty> : null}
        {data?.items.length ? <Timeline>{data.items.map((event) => <TimelineEntry key={event.id}><TimelineMarker><IconHistory className="size-3.5" /></TimelineMarker><TimelineContent><div className="flex flex-wrap items-start justify-between gap-2"><strong>{event.title}</strong><time className="text-xs text-muted-foreground">{formatDate(event.occurredAt)}</time></div>{event.summary ? <p className="mt-1 text-sm text-muted-foreground">{event.summary}</p> : null}<div className="mt-2 flex flex-wrap gap-2"><TimelineActor>{event.actorType}{event.actorRole ? ` · ${event.actorRole}` : ""}</TimelineActor><Badge variant="outline">{event.reliability}</Badge><Badge variant="outline">{event.impact}</Badge></div><TimelineTransition from={event.previousState} to={event.nextState} /></TimelineContent></TimelineEntry>)}</Timeline> : null}
        {data?.nextCursor ? <Button className="mt-4" disabled={loading} onClick={loadMore} variant="outline">{loading ? <><Spinner /> Caricamento</> : "Mostra eventi precedenti"}</Button> : null}
      </CardContent>
    </Card>
  );
}
