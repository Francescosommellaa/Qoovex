import {
  IconCamera,
  IconCheck,
  IconClock,
  IconFileInvoice,
  IconMessage2,
  IconPencil,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import {
  Timeline,
  TimelineActor,
  TimelineContent,
  TimelineDateSeparator,
  TimelineEntry,
  TimelineMarker,
  TimelineTransition,
} from "@qoovex/ui/components/timeline";
import {
  WorkQueueItem,
  WorkQueueItemActions,
  WorkQueueItemContent,
} from "@qoovex/ui/components/work-queue-item";
import { VisibilityTag } from "./product-frame";

/**
 * Tutte le visual usano contenuti chiaramente dimostrativi e neutrali,
 * senza dati personali reali. Sono rappresentazioni statiche dell'interfaccia.
 */

export function WorkspaceTimeline() {
  return (
    <Timeline aria-label="Esempio dimostrativo di cronologia del lavoro">
      <TimelineDateSeparator>14 maggio</TimelineDateSeparator>

      <TimelineEntry>
        <TimelineMarker>
          <IconCamera aria-hidden="true" className="size-3.5" />
        </TimelineMarker>
        <TimelineContent>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Fotografie del bagno aggiunte al cantiere</p>
            <VisibilityTag shared />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Tre immagini condivise nel contesto del lavoro.
          </p>
          <TimelineActor>Impresa</TimelineActor>
        </TimelineContent>
      </TimelineEntry>

      <TimelineEntry>
        <TimelineMarker>
          <IconPencil aria-hidden="true" className="size-3.5" />
        </TimelineMarker>
        <TimelineContent>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Modifica proposta sui punti luce</p>
            <VisibilityTag shared />
          </div>
          <TimelineTransition from="Da confermare" to="In attesa di risposta" />
          <TimelineActor>Impresa</TimelineActor>
        </TimelineContent>
      </TimelineEntry>

      <TimelineEntry>
        <TimelineMarker>
          <IconMessage2 aria-hidden="true" className="size-3.5" />
        </TimelineMarker>
        <TimelineContent>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Nota di cantiere sui materiali</p>
            <VisibilityTag shared={false} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Promemoria interno, non visibile al cliente.
          </p>
          <TimelineActor>Impresa</TimelineActor>
        </TimelineContent>
      </TimelineEntry>
    </Timeline>
  );
}

export function RequestAwaitingReply() {
  return (
    <WorkQueueItem priority="attention">
      <WorkQueueItemContent>
        <div className="flex items-center gap-2">
          <IconClock aria-hidden className="size-4 text-warning-foreground dark:text-warning" />
          <p className="text-sm font-medium">La modifica richiede una risposta</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Ristrutturazione appartamento · punti luce soggiorno
        </p>
      </WorkQueueItemContent>
      <WorkQueueItemActions>
        <Badge variant="warning">In attesa</Badge>
      </WorkQueueItemActions>
    </WorkQueueItem>
  );
}

export function ReceiptCard() {
  return (
    <WorkQueueItem>
      <WorkQueueItemContent>
        <div className="flex items-center gap-2">
          <IconFileInvoice aria-hidden className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">Ricevuta caricata dal cliente</p>
        </div>
        <p className="text-xs text-muted-foreground">Ricezione da confermare dall&apos;impresa</p>
      </WorkQueueItemContent>
      <WorkQueueItemActions>
        <Badge variant="outline">
          <IconClock aria-hidden className="size-3" />
          Da confermare
        </Badge>
      </WorkQueueItemActions>
    </WorkQueueItem>
  );
}

export function ConfirmedUpdateCard() {
  return (
    <WorkQueueItem>
      <WorkQueueItemContent>
        <div className="flex items-center gap-2">
          <IconCheck aria-hidden className="size-4 text-success" />
          <p className="text-sm font-medium">Aggiornamento del 14 maggio</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Condiviso con il cliente · fotografie e nota
        </p>
      </WorkQueueItemContent>
      <WorkQueueItemActions>
        <Badge variant="success">Condiviso</Badge>
      </WorkQueueItemActions>
    </WorkQueueItem>
  );
}
