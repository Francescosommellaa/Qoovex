import { asAccessResponse } from "@shared/server/access-errors";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";

export async function GET() {
  try { return Response.json(await getWorkspaceAccessContext()); }
  catch (error) { return asAccessResponse(error); }
}
