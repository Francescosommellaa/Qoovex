import type { OrganizationHomeWorkItem } from "./organization-home-work-queue";
import {
  presentTimelineEvent,
  type TimelineEventPresentation,
  type TimelineEventPresentationInput,
} from "./timeline-event-presentation";

export interface OrganizationHomeRecentActivityInput extends TimelineEventPresentationInput {
  id: string;
  jobSiteId: string;
  jobSiteName: string;
}

export interface OrganizationHomeRecentActivity {
  id: string;
  href: string;
  jobSiteName: string;
  occurredAt: string;
  presentation: TimelineEventPresentation;
}

const MAX_RECENT_ACTIVITIES = 8;

function toIso(value: Date | string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function presentOrganizationHomeRecentActivities(
  events: readonly OrganizationHomeRecentActivityInput[],
  workQueueItems: readonly OrganizationHomeWorkItem[],
): OrganizationHomeRecentActivity[] {
  const workQueueTargets = new Set(workQueueItems.map((item) => item.href));

  return events.map((event) => {
    const presentation = presentTimelineEvent(event);
    const href = `/job-sites/${event.jobSiteId}#${presentation.sectionId}`;
    return {
      id: event.id,
      href,
      jobSiteName: event.jobSiteName,
      occurredAt: toIso(event.occurredAt ?? event.createdAt),
      presentation,
    };
  }).filter((activity) => !workQueueTargets.has(activity.href)).slice(0, MAX_RECENT_ACTIVITIES);
}
