import { asAccessResponse } from "@shared/server/access-errors";
import { listDocumentPackageShareProposals, prepareDocumentPackageShareProposal } from "@shared/server/document-package-share-proposal-service";

interface RouteContext { params: Promise<{ packageId: string }>; }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await listDocumentPackageShareProposals(packageId));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await prepareDocumentPackageShareProposal(packageId, await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
