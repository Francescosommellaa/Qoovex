import { asAccessResponse } from "@shared/server/access-errors";
import { getDocumentPackageShareProposal } from "@shared/server/document-package-share-proposal-service";

interface RouteContext { params: Promise<{ packageId: string; proposalId: string }>; }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { packageId, proposalId } = await context.params;
    return Response.json(await getDocumentPackageShareProposal(packageId, proposalId));
  } catch (error) { return asAccessResponse(error); }
}
