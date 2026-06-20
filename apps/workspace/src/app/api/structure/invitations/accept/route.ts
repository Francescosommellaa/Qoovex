import { asAccessResponse } from "@shared/server/access-errors";
import { acceptInvitation } from "@shared/server/structure-invitation-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { token?: string };
    return Response.json(await acceptInvitation(body.token ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
