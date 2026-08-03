import { asAccessResponse } from "@shared/server/access-errors";
import { archiveJobSiteUserAssignment } from "@shared/server/resource-assignment-service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  try {
    const { assignmentId } = await params;
    return Response.json(await archiveJobSiteUserAssignment(assignmentId));
  } catch (error) { return asAccessResponse(error); }
}
