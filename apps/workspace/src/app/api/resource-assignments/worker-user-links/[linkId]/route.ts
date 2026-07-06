import { asAccessResponse } from "@shared/server/access-errors";
import { archiveWorkerUserLink } from "@shared/server/resource-assignment-service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  try {
    const { linkId } = await params;
    return Response.json(await archiveWorkerUserLink(linkId));
  } catch (error) { return asAccessResponse(error); }
}
