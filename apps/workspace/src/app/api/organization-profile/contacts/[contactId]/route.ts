import { asAccessResponse } from "@shared/server/access-errors";
import { archiveOrganizationContact, updateOrganizationContact } from "@shared/server/organization-profile-service";

interface RouteContext { params: Promise<{ contactId: string }>; }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { contactId } = await context.params;
    return Response.json(await updateOrganizationContact(contactId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { contactId } = await context.params;
    return Response.json(await archiveOrganizationContact(contactId));
  } catch (error) { return asAccessResponse(error); }
}
