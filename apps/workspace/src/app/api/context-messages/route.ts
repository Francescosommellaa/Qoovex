import { asAccessResponse } from "@shared/server/access-errors";
import { createContextMessage, listContextMessages } from "@shared/server/operational-request-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listContextMessages({
      targetType: searchParams.get("targetType") ?? undefined,
      targetId: searchParams.get("targetId") ?? undefined,
      take: searchParams.get("take") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const message = await createContextMessage(await request.json());
    return Response.json({ message }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
