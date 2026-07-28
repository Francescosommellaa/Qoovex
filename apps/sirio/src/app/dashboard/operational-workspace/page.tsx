import {
  IconAlertTriangle,
  IconBuilding,
  IconCamera,
  IconCircleCheck,
  IconClock,
  IconFileCheck,
  IconLink,
  IconMessage,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";
import { Timeline, TimelineActor, TimelineContent, TimelineDateSeparator, TimelineEntry, TimelineMarker, TimelineTransition } from "@qoovex/ui/components/timeline";
import { WorkQueueItem, WorkQueueItemActions, WorkQueueItemContent } from "@qoovex/ui/components/work-queue-item";

const attentionItems = [
  { title: "DURC in scadenza", detail: "Cantiere Aurora · entro 5 giorni", tone: "warning" as const },
  { title: "Prova da classificare", detail: "Accesso area nord · registrata da mobile", tone: "outline" as const },
  { title: "Pacchetto da approvare", detail: "Ingresso subappaltatore · 7 elementi", tone: "outline" as const },
];

export default function OperationalWorkspaceProofPage() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 p-4 py-8 sm:p-8">
      <header className="grid gap-3">
        <Badge className="w-fit" variant="outline">Sirio proof · spazio operativo unico</Badge>
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Lavoro da gestire, nel suo contesto</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Profilo, cantiere, persone, documenti, prove e richieste compongono una sola superficie orientata all’attenzione. Nessuna decisione o condivisione è automatica.</p></div>
          <Button className="h-11"><IconMessage aria-hidden="true" />Nuova richiesta</Button>
        </div>
      </header>

      <section aria-labelledby="attention-title" className="grid gap-4">
        <div><h2 className="text-lg font-medium" id="attention-title">Priorità di oggi</h2><p className="text-sm text-muted-foreground">Ordinate per blocco, scadenza e revisione richiesta.</p></div>
        <div className="grid gap-3 lg:grid-cols-3">
          {attentionItems.map((item) => <Card key={item.title} size="sm"><CardHeader><CardTitle className="flex items-center gap-2"><IconAlertTriangle aria-hidden="true" className="size-4" />{item.title}</CardTitle><CardDescription>{item.detail}</CardDescription><CardAction><Badge variant={item.tone}>Da gestire</Badge></CardAction></CardHeader></Card>)}
        </div>
      </section>

      <section aria-labelledby="profile-title" className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
        <Card>
          <CardHeader><CardTitle><h2 id="profile-title">Profilo azienda</h2></CardTitle><CardDescription>Dati operativi separati dall’identità tecnica del tenant.</CardDescription><CardAction><Badge variant="success"><IconCircleCheck aria-hidden="true" />Completo</Badge></CardAction></CardHeader>
          <CardContent><FieldGroup className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="company-name">Ragione sociale</FieldLabel><Input defaultValue="Edil Aurora S.r.l." id="company-name" /></Field><Field><FieldLabel htmlFor="company-tax">Identificativo</FieldLabel><Input defaultValue="IT01234567890" id="company-tax" /></Field><Field className="sm:col-span-2"><FieldLabel htmlFor="company-address">Sede operativa</FieldLabel><Input defaultValue="Via del Lavoro 18, Milano" id="company-address" /></Field><Field className="sm:col-span-2"><FieldLabel htmlFor="company-activity">Attività e specializzazioni</FieldLabel><Textarea defaultValue="Ristrutturazioni e manutenzione di edifici civili." id="company-activity" rows={3} /><FieldDescription>Questi dati generano suggerimenti e requisiti, non attestazioni automatiche.</FieldDescription></Field></FieldGroup></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contatti operativi</CardTitle><CardDescription>Responsabilità esplicite e ordinabili.</CardDescription></CardHeader>
          <CardContent className="grid gap-3"><div className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><div><strong className="text-sm">Elena Conti</strong><p className="mt-1 text-xs text-muted-foreground">Responsabile documentale · elena@esempio.it</p></div><Badge>Primario</Badge></div></div><div className="rounded-lg border p-3"><strong className="text-sm">Marco Riva</strong><p className="mt-1 text-xs text-muted-foreground">Responsabile cantieri · +39 02 000000</p></div><Button className="h-11 w-full" variant="outline"><IconUser aria-hidden="true" />Aggiungi contatto</Button></CardContent>
        </Card>
      </section>

      <section aria-labelledby="site-title" className="grid gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><IconBuilding aria-hidden="true" /><h2 id="site-title">Cantiere Aurora</h2></CardTitle><CardDescription>La fase cambia solo tramite transizioni autorizzate e confermate.</CardDescription><CardAction><Badge>Preparazione</Badge></CardAction></CardHeader>
          <CardContent className="grid gap-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-muted/60 p-3"><span className="text-xs text-muted-foreground">Persone attive</span><strong className="mt-1 block text-xl">12</strong></div><div className="rounded-lg bg-muted/60 p-3"><span className="text-xs text-muted-foreground">Documenti critici</span><strong className="mt-1 block text-xl">2</strong></div><div className="rounded-lg bg-muted/60 p-3"><span className="text-xs text-muted-foreground">Richieste aperte</span><strong className="mt-1 block text-xl">3</strong></div><div className="rounded-lg bg-muted/60 p-3"><span className="text-xs text-muted-foreground">Prove da rivedere</span><strong className="mt-1 block text-xl">1</strong></div></div><Alert variant="warning"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Apertura bloccata</AlertTitle><AlertDescription>Un documento è scaduto e due richieste sono ancora aperte. L’override è riservato all’Owner e richiede motivazione.</AlertDescription></Alert><div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><Button className="h-11" variant="outline">Apri elementi</Button><Button className="h-11" disabled>Avvia cantiere</Button></div></CardContent>
        </Card>
      </section>

      <section aria-labelledby="evidence-title" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><IconCamera aria-hidden="true" /><h2 id="evidence-title">Registra prova</h2></CardTitle><CardDescription>Contesto precompilato, controlli adatti al touch e fallback file o nota.</CardDescription></CardHeader>
          <CardContent><FieldGroup className="grid gap-4"><Field><FieldLabel htmlFor="evidence-context">Contesto</FieldLabel><Input defaultValue="Cantiere Aurora · Accesso area nord" id="evidence-context" readOnly /></Field><div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="evidence-sensitivity">Visibilità</FieldLabel><select className="h-11 rounded-md border bg-background px-3 text-sm" defaultValue="INTERNAL" id="evidence-sensitivity"><option value="INTERNAL">Interna</option><option value="RESTRICTED">Riservata</option><option value="SHAREABLE">Condivisibile dopo revisione</option></select></Field><Field><FieldLabel htmlFor="evidence-origin">Origine</FieldLabel><Input defaultValue="Acquisizione diretta" id="evidence-origin" readOnly /></Field></div><Field><FieldLabel htmlFor="evidence-note">Nota</FieldLabel><Textarea id="evidence-note" placeholder="Descrivi ciò che è stato rilevato" rows={4} /></Field><div className="grid grid-cols-2 gap-2"><Button className="h-12" variant="outline"><IconLink aria-hidden="true" />File o nota</Button><Button className="h-12"><IconCamera aria-hidden="true" />Fotocamera</Button></div><FieldDescription>Il binario originale resta immutabile. Le correzioni producono revisioni append-only.</FieldDescription></FieldGroup></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Richieste contestuali</CardTitle><CardDescription>Assegnazione, scadenza e conversazione restano accanto al cantiere.</CardDescription></CardHeader>
          <CardContent className="grid gap-3"><WorkQueueItem priority="attention"><WorkQueueItemContent><div className="flex flex-wrap gap-2"><Badge variant="outline">In corso</Badge><Badge variant="outline"><IconClock aria-hidden="true" />29 lug</Badge></div><h3 className="font-medium">Caricare attestato formazione</h3><p className="text-sm text-muted-foreground">Assegnata a Luca Bianchi · collegata al lavoratore e al cantiere.</p></WorkQueueItemContent><WorkQueueItemActions><Button variant="outline">Messaggi · 2</Button><Button>Completa</Button></WorkQueueItemActions></WorkQueueItem><WorkQueueItem priority="default"><WorkQueueItemContent><Badge variant="outline">Aperta</Badge><h3 className="font-medium">Verificare accesso impresa</h3><p className="text-sm text-muted-foreground">Nessuna qualifica viene dedotta dalla richiesta.</p></WorkQueueItemContent><WorkQueueItemActions><Button variant="outline">Prendi in carico</Button></WorkQueueItemActions></WorkQueueItem></CardContent>
        </Card>
      </section>

      <section aria-labelledby="share-title" className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><IconShieldLock aria-hidden="true" /><h2 id="share-title">Revisione pacchetto</h2></CardTitle><CardDescription>Solo gli elementi selezionati entrano nello snapshot congelato.</CardDescription></CardHeader>
          <CardContent className="grid gap-3"><div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><strong className="text-sm">Documento corrente · DURC</strong><p className="text-xs text-muted-foreground">PDF · approvato</p></div><Badge variant="success">Incluso</Badge></div><div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><strong className="text-sm">Prova · accesso area nord</strong><p className="text-xs text-muted-foreground">Interna · da classificare</p></div><Badge variant="destructive">Esclusa</Badge></div><div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><strong className="text-sm">Assegnazione · Luca Bianchi</strong><p className="text-xs text-muted-foreground">Snapshot del ruolo e periodo</p></div><Badge variant="success">Inclusa</Badge></div><Alert><IconFileCheck aria-hidden="true" /><AlertTitle>Download disabilitato</AlertTitle><AlertDescription>Il destinatario vede soltanto questa revisione. Le modifiche successive non entrano nel link.</AlertDescription></Alert><Button className="h-11">Conferma e congela revisione</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Timeline contestuale</CardTitle><CardDescription>Eventi utente minimizzati, distinti dall’audit tecnico.</CardDescription></CardHeader>
          <CardContent><Timeline><TimelineDateSeparator>Oggi</TimelineDateSeparator><TimelineEntry><TimelineMarker><IconFileCheck className="size-3.5" /></TimelineMarker><TimelineContent><strong>Versione documento approvata</strong><p className="mt-1 text-sm text-muted-foreground">La nuova versione è corrente; la precedente resta disponibile nello storico.</p><TimelineActor>Elena Conti · reviewer</TimelineActor><TimelineTransition from="TO_REVIEW" to="CURRENT" /></TimelineContent></TimelineEntry><TimelineEntry><TimelineMarker><IconMessage className="size-3.5" /></TimelineMarker><TimelineContent><strong>Richiesta presa in carico</strong><p className="mt-1 text-sm text-muted-foreground">Aggiornamento visibile nel contesto del cantiere.</p><TimelineActor>Luca Bianchi</TimelineActor></TimelineContent></TimelineEntry><TimelineEntry><TimelineMarker><IconCamera className="size-3.5" /></TimelineMarker><TimelineContent><strong>Prova registrata</strong><p className="mt-1 text-sm text-muted-foreground">Classificazione interna; nessuna condivisione implicita.</p><TimelineActor>Responsabile cantiere</TimelineActor></TimelineContent></TimelineEntry></Timeline></CardContent>
        </Card>
      </section>
    </main>
  );
}
