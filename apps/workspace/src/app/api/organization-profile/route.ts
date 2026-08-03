import { asAccessResponse } from "@shared/server/access-errors";
import { getOrganizationProfile, updateOrganizationProfile } from "@shared/server/organization-profile-service";

export async function GET() {
  try {
    return Response.json(await getOrganizationProfile());
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request) {
  try {
    return Response.json(await updateOrganizationProfile(await request.json()));
  } catch (error) { return asAccessResponse(error); }
}
