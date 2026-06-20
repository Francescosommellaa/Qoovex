import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { findStructureForSupport } from "@shared/server/support-access-service";

export async function GET(request: Request) {
  try {
    const user = await requireIdentity();
    return Response.json(await findStructureForSupport(user.id, new URL(request.url).searchParams.get("code") ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
