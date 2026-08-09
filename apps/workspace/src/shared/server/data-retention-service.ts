import "server-only";
import { db } from "@qoovex/db";
import type { DataRetentionCandidate, DataRetentionOverviewResponse } from "@qoovex/types";
import { requireDataControlAccess } from "./data-control-access";

export const RETENTION_NOTICE = "Nessuna cancellazione fisica e autorizzata: retention e legal hold richiedono una decisione canonica separata.";
export async function buildDataRetentionOverviewForOrganization(organizationId: string, now = new Date()): Promise<DataRetentionOverviewResponse> {
  const values = await Promise.all([
    db.worker.count({ where: { organizationId, archivedAt: { not: null } } }), db.jobSite.count({ where: { organizationId, archivedAt: { not: null } } }), db.jobSiteAttachment.count({ where: { organizationId, archivedAt: { not: null } } }),
  ]);
  const candidates: DataRetentionCandidate[] = [{ key: "archived-foundation-records", title: "Record foundation archiviati", description: "Metadati conservati; nessuna cancellazione automatica.", count: values.reduce((sum, value) => sum + value, 0) }];
  return { generatedAt: now.toISOString(), notice: RETENTION_NOTICE, thresholds: {}, candidates };
}
export async function getDataRetentionOverview() { const { organizationId } = await requireDataControlAccess(); return buildDataRetentionOverviewForOrganization(organizationId); }
