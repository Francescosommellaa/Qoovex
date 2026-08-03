import { asAccessResponse } from "@shared/server/access-errors";
import { buildDataExport } from "@shared/server/data-export-service";

export async function GET() {
  try {
    const exportData = await buildDataExport();
    const timestamp = exportData.exportedAt.replace(/[:.]/g, "-");
    return new Response(JSON.stringify(exportData, null, 2), {
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
