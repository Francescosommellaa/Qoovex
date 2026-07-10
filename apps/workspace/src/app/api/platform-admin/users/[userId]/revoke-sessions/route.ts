import { asAccessResponse } from "@shared/server/access-errors";
import { revokePlatformUserSessions } from "@shared/server/platform-admin-service";

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const [body, { userId }] = await Promise.all([request.json() as Promise<{ reason?: string }>, params]);
    return Response.json(await revokePlatformUserSessions(userId, body.reason));
  } catch (error) { return asAccessResponse(error); }
}
