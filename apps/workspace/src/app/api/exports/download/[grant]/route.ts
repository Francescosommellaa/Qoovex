import { downloadExportWithGrant } from "@shared/server/vnext-export-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function GET(_: Request, { params }: { params: Promise<{ grant: string }> }) { try { const file = await downloadExportWithGrant((await params).grant); return new Response(file.stream, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${file.fileName}"`, "Cache-Control": "private, no-store" } }); } catch (error) { return asVNextApiError(error); } }
