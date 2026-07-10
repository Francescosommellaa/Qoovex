import { asAccessResponse } from "@shared/server/access-errors";
import { reactivatePlatformUser } from "@shared/server/platform-admin-service";

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const [body, { userId }] = await Promise.all([request.json() as Promise<{ reason?: string }>, params]);
    return Response.json(await reactivatePlatformUser(userId, body.reason));
  } catch (error) { return asAccessResponse(error); }
}
