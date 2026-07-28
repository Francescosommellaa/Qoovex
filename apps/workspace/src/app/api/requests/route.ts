import { asAccessResponse } from "@shared/server/access-errors";
import { createOperationalRequest, listOperationalRequests } from "@shared/server/operational-request-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listOperationalRequests({
      status: searchParams.get("status") ?? undefined,
      targetType: searchParams.get("targetType") ?? undefined,
      targetId: searchParams.get("targetId") ?? undefined,
      take: searchParams.get("take") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const operationalRequest = await createOperationalRequest(await request.json());
    return Response.json({ request: operationalRequest }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
