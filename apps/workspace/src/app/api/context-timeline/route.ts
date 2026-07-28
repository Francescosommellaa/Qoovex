import { asAccessResponse } from "@shared/server/access-errors";
import { listContextTimeline } from "@shared/server/context-timeline-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listContextTimeline({
      targetType: searchParams.get("targetType") ?? undefined,
      targetId: searchParams.get("targetId") ?? undefined,
      take: searchParams.get("take") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}
