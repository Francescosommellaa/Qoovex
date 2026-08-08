import { exchangeExportAccessToken } from "@shared/server/job-site-export-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function POST(_: Request, { params }: { params: Promise<{ token: string }> }) { try { return Response.json(await exchangeExportAccessToken((await params).token)); } catch (error) { return asJobSiteApiError(error); } }
