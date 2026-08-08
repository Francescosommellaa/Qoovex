import { createClientProperty, listClientHome } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function GET() { try { return Response.json((await listClientHome()).properties); } catch (error) { return asJobSiteApiError(error); } }
export async function POST(request: Request) { try { return Response.json(await createClientProperty(await request.json()), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
