import type { AuditLogFilters } from "@qoovex/types";
import { listProductAuditEvents } from "@shared/server/product-audit-service";
import { AuditLogPageView } from "@/views/admin-core/audit-log/AuditLogPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

interface AuditLogPageProps {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
    outcome?: string;
    from?: string;
    to?: string;
    cursor?: string;
    limit?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  try {
    const params = await searchParams;
    const filters: AuditLogFilters = {
      action: params.action as AuditLogFilters["action"],
      entityType: params.entityType as AuditLogFilters["entityType"],
      outcome: params.outcome as AuditLogFilters["outcome"],
      from: params.from,
      to: params.to,
      cursor: params.cursor,
      limit: params.limit ? Number(params.limit) : undefined,
    };
    const data = await listProductAuditEvents(filters);
    return <AuditLogPageView data={data} filters={filters} />;
  } catch {
    return <WorkspaceAccessState title="Audit non disponibile" description="Solo il proprietario dell'azienda puo consultare gli eventi audit." />;
  }
}
