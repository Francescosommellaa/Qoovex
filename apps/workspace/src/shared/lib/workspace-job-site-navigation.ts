import type { JobSiteOperationalPhase, OperationalEventType } from "@qoovex/types";

export interface WorkspaceJobSiteNavigationUpdate {
  id: string;
  title: string;
  summary: string | null;
  eventType: OperationalEventType;
  occurredAt: string;
}

export interface WorkspaceJobSiteNavigationItem {
  id: string;
  name: string;
  operationalPhase: JobSiteOperationalPhase | null;
  updatedAt: string;
  updates: WorkspaceJobSiteNavigationUpdate[];
}
