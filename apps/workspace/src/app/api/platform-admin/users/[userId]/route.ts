import { asAccessResponse } from "@shared/server/access-errors";
import { getPlatformUserDetail } from "@shared/server/platform-admin-service";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try { return Response.json(await getPlatformUserDetail((await params).userId)); }
  catch (error) { return asAccessResponse(error); }
}
