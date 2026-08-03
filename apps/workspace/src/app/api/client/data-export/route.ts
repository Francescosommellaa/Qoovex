import { buildClientDataExport } from "@shared/server/vnext-client-data-export-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function GET() { try { const payload = await buildClientDataExport(); return Response.json(payload, { headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="qoovex-client-data-${Date.now()}.json"` } }); } catch (error) { return asVNextApiError(error); } }
