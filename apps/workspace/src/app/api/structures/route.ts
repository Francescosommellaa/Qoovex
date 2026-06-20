import { asAccessResponse } from "@shared/server/access-errors";
import { createStructure } from "@shared/server/structure-access-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string };
    return Response.json(await createStructure(body.name ?? ""), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
