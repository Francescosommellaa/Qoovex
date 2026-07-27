import { listOperationalArtifactEvents } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

interface RouteContext {
  params: Promise<{ artifactType: string; artifactId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { artifactType, artifactId } = await context.params;
    const url = new URL(request.url);
    return Response.json(await listOperationalArtifactEvents(artifactType, artifactId, {
      cursor: url.searchParams.get("cursor"),
      take: url.searchParams.get("take"),
    }));
  } catch (error) {
    return asAccessResponse(error);
  }
}
