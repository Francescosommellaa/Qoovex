import { asAccessResponse } from "@shared/server/access-errors";
import { archiveJobSiteWorkerAssignment } from "@shared/server/resource-assignment-service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  try {
    const { assignmentId } = await params;
    return Response.json(await archiveJobSiteWorkerAssignment(assignmentId));
  } catch (error) { return asAccessResponse(error); }
}
