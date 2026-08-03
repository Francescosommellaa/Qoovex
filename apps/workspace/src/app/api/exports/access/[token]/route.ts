import { exchangeExportAccessToken } from "@shared/server/vnext-export-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function POST(_: Request, { params }: { params: Promise<{ token: string }> }) { try { return Response.json(await exchangeExportAccessToken((await params).token)); } catch (error) { return asVNextApiError(error); } }
