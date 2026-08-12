import type { ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBuilding,
  IconCreditCard,
  IconFileText,
  IconListCheck,
  IconMessageCircle,
  IconSettings,
  IconTool,
} from "@tabler/icons-react";
import {
  Timeline,
  TimelineActor,
  TimelineEntry,
  TimelineMarker,
} from "@qoovex/ui/components/timeline";
import type { TimelineAudience } from "@qoovex/types";
import {
  presentTimelineEvent,
  type TimelineEventKind,
  type TimelineEventPresentationInput,
} from "@shared/lib/timeline-event-presentation";
import { presentTimelineAudience, type ProductStateTone } from "@shared/lib/product-state-presentation";
import { WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

export interface WorkspaceTimelineEvent extends TimelineEventPresentationInput {
  id: string;
  audience: string;
  actorParticipantId?: string | null;
}

interface WorkspaceTimelineActor {
  id: string;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

const eventIcons = {
  work: IconTool,
  message: IconMessageCircle,
  file: IconFileText,
  step: IconListCheck,
  change: IconArrowsExchange,
  payment: IconCreditCard,
  issue: IconAlertTriangle,
  lifecycle: IconBuilding,
  system: IconSettings,
} satisfies Record<TimelineEventKind, typeof IconTool>;

function markerVariant(tone: ProductStateTone): "default" | "active" | "success" | "warning" | "destructive" {
  if (tone === "danger") return "destructive";
  if (tone === "warning") return "warning";
  if (tone === "good") return "success";
  if (tone === "info") return "active";
  return "default";
}

function dateTimeAttribute(value: Date | string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function WorkspaceTimeline({
  events,
  emptyState,
  actors = [],
  showAudience = false,
}: {
  events: readonly WorkspaceTimelineEvent[];
  emptyState: ReactNode;
  actors?: readonly WorkspaceTimelineActor[];
  showAudience?: boolean;
}) {
  if (!events.length) return emptyState;

  return (
    <Timeline aria-label="Cronologia del cantiere">
      {events.map((event) => {
        const actor = event.actorParticipantId ? actors.find((candidate) => candidate.id === event.actorParticipantId) : undefined;
        const actorName = actor ? [actor.user?.firstName, actor.user?.lastName].filter(Boolean).join(" ") : "";
        const presentation = presentTimelineEvent({ ...event, actorName });
        const EventIcon = eventIcons[presentation.kind];
        const occurredAt = event.occurredAt ?? event.createdAt;

        return (
          <TimelineEntry key={event.id}>
            <TimelineMarker variant={markerVariant(presentation.tone)}>
              <EventIcon />
            </TimelineMarker>
            <article className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{presentation.title}</h3>
                {showAudience ? <WorkspaceState state={presentTimelineAudience(event.audience as TimelineAudience)} /> : null}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{presentation.description}</p>
              {presentation.details.length ? (
                <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  {presentation.details.map((detail) => (
                    <div className="min-w-0" key={`${detail.label}-${detail.value}`}>
                      <dt className="inline text-muted-foreground">{detail.label}: </dt>
                      <dd className="inline break-words text-foreground">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <TimelineActor>{presentation.actor}</TimelineActor>
                <span aria-hidden="true" className="text-xs text-muted-foreground">·</span>
                <time className="text-xs text-muted-foreground" dateTime={dateTimeAttribute(occurredAt)}>{presentation.occurredAtLabel}</time>
              </div>
            </article>
          </TimelineEntry>
        );
      })}
    </Timeline>
  );
}
