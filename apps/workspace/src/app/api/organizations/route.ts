import { asAccessResponse } from "@shared/server/access-errors";
import { createOrganization } from "@shared/server/organization-access-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string };
    return Response.json(await createOrganization(body.name ?? ""), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
