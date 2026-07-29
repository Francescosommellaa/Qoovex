"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconMessageCircle, IconTimelineEvent } from "@tabler/icons-react";
import type { ContextMessageResponse, ContextTimelineEventResponse, OperationalRequestResponse } from "@qoovex/types";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";
import { Timeline, TimelineContent, TimelineDateSeparator, TimelineEntry, TimelineMarker } from "@qoovex/ui/components/timeline";
import { submitJson } from "../admin-api-client";

function dateKey(value: string) {
  return new Intl.DateTimeFormat("it-IT", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function JobSiteUpdatesPanel({ canCreate, jobSiteId, messages, requests, timeline }: {
  canCreate: boolean;
  jobSiteId: string;
  messages: ContextMessageResponse[];
  requests: OperationalRequestResponse[];
  timeline: ContextTimelineEventResponse[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/context-messages", "POST", { targetType: "JOB_SITE", targetId: jobSiteId, body: body.trim() });
      setBody("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Aggiornamento non registrato.");
    } finally {
      setPending(false);
    }
  }

  let previousDate = "";
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
      <div className="grid min-w-0 gap-6">
        {canCreate ? (
          <Card size="sm">
            <CardHeader className="border-b"><CardTitle><h2>Aggiungi aggiornamento</h2></CardTitle><CardDescription>Nota interna collegata esclusivamente a questo cantiere.</CardDescription></CardHeader>
            <CardContent>
              <form className="grid gap-3" onSubmit={submit}>
                {error ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Invio non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
                <Field><FieldLabel htmlFor="job-site-context-update">Aggiornamento</FieldLabel><Textarea disabled={pending} id="job-site-context-update" maxLength={4000} onChange={(event) => setBody(event.target.value)} required rows={4} value={body} /><FieldDescription>Visibilità interna secondo i permessi esistenti.</FieldDescription></Field>
                <div className="flex justify-end"><Button disabled={pending || !body.trim()} type="submit">{pending ? <><Spinner />Registrazione…</> : <><IconMessageCircle aria-hidden="true" />Registra aggiornamento</>}</Button></div>
              </form>
            </CardContent>
          </Card>
        ) : null}
        <Card size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Timeline del cantiere</h2></CardTitle><CardDescription>Eventi operativi reali, raggruppati per data.</CardDescription></CardHeader>
          <CardContent>
            {timeline.length ? (
              <Timeline>
                {timeline.map((item) => {
                  const groupDate = dateKey(item.occurredAt);
                  const showDate = groupDate !== previousDate;
                  previousDate = groupDate;
                  return [
                    showDate ? <TimelineDateSeparator key={`date-${groupDate}`}>{groupDate}</TimelineDateSeparator> : null,
                    <TimelineEntry id={`timeline-${item.id}`} key={item.id} className="scroll-mt-24">
                      <TimelineMarker><IconTimelineEvent aria-hidden="true" className="size-3.5" /></TimelineMarker>
                      <TimelineContent>
                        <div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-sm">{item.title}</strong><time className="text-xs text-muted-foreground" dateTime={item.occurredAt}>{timeLabel(item.occurredAt)}</time></div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.summary || item.eventType.replaceAll("_", " ")}</p>
                      </TimelineContent>
                    </TimelineEntry>,
                  ];
                })}
              </Timeline>
            ) : <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nessun evento contestuale.</p>}
          </CardContent>
        </Card>
      </div>
      <aside className="grid content-start gap-6">
        <Card size="sm"><CardHeader className="border-b"><CardTitle><h2>Messaggi interni</h2></CardTitle><CardDescription>Aggiornamenti registrati nel contesto.</CardDescription></CardHeader><CardContent>{messages.length ? <ol className="grid gap-3">{messages.map((message) => <li className="rounded-lg border p-3" key={message.id}><p className="whitespace-pre-wrap text-sm">{message.body}</p><time className="mt-2 block text-xs text-muted-foreground" dateTime={message.createdAt}>{dateKey(message.createdAt)} · {timeLabel(message.createdAt)}</time></li>)}</ol> : <p className="text-sm text-muted-foreground">Nessun messaggio interno.</p>}</CardContent></Card>
        <Card size="sm"><CardHeader className="border-b"><CardTitle><h2>Richieste operative</h2></CardTitle><CardDescription>Richieste collegate al cantiere.</CardDescription></CardHeader><CardContent>{requests.length ? <ul className="grid gap-3">{requests.map((request) => <li className="rounded-lg border p-3" key={request.id}><div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-sm">{request.title}</strong><Badge variant="outline">{request.status.replaceAll("_", " ")}</Badge></div>{request.description ? <p className="mt-1 text-sm text-muted-foreground">{request.description}</p> : null}</li>)}</ul> : <p className="text-sm text-muted-foreground">Nessuna richiesta operativa.</p>}</CardContent></Card>
      </aside>
    </div>
  );
}
