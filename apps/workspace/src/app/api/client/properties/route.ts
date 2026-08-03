import { createClientProperty, listClientHome } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function GET() { try { return Response.json((await listClientHome()).properties); } catch (error) { return asVNextApiError(error); } }
export async function POST(request: Request) { try { return Response.json(await createClientProperty(await request.json()), { status: 201 }); } catch (error) { return asVNextApiError(error); } }
