import { asAccessResponse } from "@shared/server/access-errors";
import { createWorkerUserLink, listWorkerUserLinks } from "@shared/server/resource-assignment-service";

export async function GET() {
  try {
    return Response.json(await listWorkerUserLinks());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createWorkerUserLink(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
