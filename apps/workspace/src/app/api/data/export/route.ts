import { asAccessResponse } from "@shared/server/access-errors";
import { buildDataExportForOrganization } from "@shared/server/data-export-service";
import { canonicalize } from "@shared/server/vnext-contracts";
import { requireDataControlAccess } from "@shared/server/data-control-access";

export async function GET() {
  try {
    const { organizationId } = await requireDataControlAccess();
    const exportData = await buildDataExportForOrganization(organizationId);
    const timestamp = exportData.exportedAt.replace(/[:.]/g, "-");
    return new Response(JSON.stringify(canonicalize(exportData), null, 2), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="qoovex-metadata-export-${timestamp}.json"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    return asAccessResponse(error);
  }
}
