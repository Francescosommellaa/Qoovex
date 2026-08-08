import { downloadExportWithGrant } from "@shared/server/job-site-export-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function GET(_: Request, { params }: { params: Promise<{ grant: string }> }) { try { const file = await downloadExportWithGrant((await params).grant); return new Response(file.stream, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${file.fileName}"`, "Cache-Control": "private, no-store" } }); } catch (error) { return asJobSiteApiError(error); } }
