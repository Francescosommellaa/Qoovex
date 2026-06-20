import { asAccessResponse } from "@shared/server/access-errors";
import { getViewerContext } from "@shared/server/access-context-service";

export async function GET() {
  try { return Response.json(await getViewerContext()); }
  catch (error) { return asAccessResponse(error); }
}
