import { listCalendarEvents, listCalendarParticipants } from "@shared/server/calendar-event-service";
import { listDeadlines } from "@shared/server/deadline-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { CalendarPageView } from "@/views/admin-core/calendar/CalendarPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceCalendarEventRecord, WorkspaceCalendarParticipant, WorkspaceDeadlineRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export default async function DeadlinesPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  try {
    const { mode } = await searchParams;
    const [events, deadlines, participants, jobSites, capabilities] = await Promise.all([
      listCalendarEvents(),
      listDeadlines(),
      listCalendarParticipants(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <CalendarPageView
        capabilities={capabilities}
        initialEvents={serializeForClient<WorkspaceCalendarEventRecord[]>(events)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        participants={serializeForClient<WorkspaceCalendarParticipant[]>(participants)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        initialFilter={mode === "deadlines" ? "deadlines" : "all"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Calendario non disponibile" description="Verifica accesso, Azienda configurata e stato delle migration." />;
  }
}
