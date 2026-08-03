import { asAccessResponse } from "@shared/server/access-errors";
import { createOrganizationContact } from "@shared/server/organization-profile-service";

export async function POST(request: Request) {
  try {
    const contact = await createOrganizationContact(await request.json());
    return Response.json({ contact }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
