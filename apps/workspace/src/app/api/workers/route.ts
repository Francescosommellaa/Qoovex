import { asAccessResponse } from "@shared/server/access-errors";
import { createWorker, listWorkers } from "@shared/server/worker-service";

export async function GET() {
  try {
    return Response.json(await listWorkers());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createWorker(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
