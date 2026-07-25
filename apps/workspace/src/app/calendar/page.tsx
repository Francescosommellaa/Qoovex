import dynamic from "next/dynamic";
import { listCalendarEvents, listCalendarParticipants } from "@shared/server/calendar-event-service";
import { listDeadlines } from "@shared/server/deadline-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceCalendarEventRecord, WorkspaceCalendarParticipant, WorkspaceDeadlineRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

const CalendarPageView = dynamic(() => import("@/views/admin-core/calendar/CalendarPageView").then((m) => m.CalendarPageView), { ssr: false, loading: () => <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Caricamento calendario…</div> });

export default async function CalendarPage() {
  try {
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
      />
    );
  } catch {
    return <WorkspaceAccessState title="Calendario non disponibile" description="Verifica accesso, Azienda configurata e stato delle migration." />;
  }
}
