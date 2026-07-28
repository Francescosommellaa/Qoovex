import { asAccessResponse } from "@shared/server/access-errors";
import { createDocumentJobSiteLink, listDocumentJobSiteLinks } from "@shared/server/document-job-site-link-service";

interface RouteContext { params: Promise<{ documentId: string }>; }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await listDocumentJobSiteLinks(documentId));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const link = await createDocumentJobSiteLink(documentId, await request.json());
    return Response.json({ link }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
