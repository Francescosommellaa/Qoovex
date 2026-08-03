import { acceptPrimaryClientInvitation } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function POST(_: Request, { params }: { params: Promise<{ token: string }> }) { try { return Response.json(await acceptPrimaryClientInvitation((await params).token)); } catch (error) { return asVNextApiError(error); } }
