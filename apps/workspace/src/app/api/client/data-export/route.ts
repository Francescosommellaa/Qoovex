import { buildClientDataExport } from "@shared/server/client-job-site-export-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function GET() { try { const payload = await buildClientDataExport(); return Response.json(payload, { headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="qoovex-client-data-${Date.now()}.json"` } }); } catch (error) { return asJobSiteApiError(error); } }
