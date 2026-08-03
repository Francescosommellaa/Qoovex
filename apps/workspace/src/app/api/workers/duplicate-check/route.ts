import { asAccessResponse } from "@shared/server/access-errors";
import { checkWorkerDuplicates } from "@shared/server/worker-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { displayName?: unknown; email?: unknown };
    return Response.json(await checkWorkerDuplicates(body));
  } catch (error) {
    return asAccessResponse(error);
  }
}
