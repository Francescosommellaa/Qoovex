import { listOperationalProcesses } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return Response.json(await listOperationalProcesses({
      cursor: params.get("cursor") ?? undefined,
      take: params.get("take") ?? undefined,
      status: params.get("status") ?? undefined,
      type: params.get("type") ?? undefined,
      artifactType: params.get("artifactType") ?? undefined,
      artifactId: params.get("artifactId") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}
