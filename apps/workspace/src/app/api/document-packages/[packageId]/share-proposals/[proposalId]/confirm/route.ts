import { asAccessResponse } from "@shared/server/access-errors";
import { confirmDocumentPackageShareProposal } from "@shared/server/document-package-share-proposal-service";

interface RouteContext { params: Promise<{ packageId: string; proposalId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { packageId, proposalId } = await context.params;
    return Response.json(await confirmDocumentPackageShareProposal(packageId, proposalId, await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
