import { asAccessResponse } from "@shared/server/access-errors";
import { createChecklist, listChecklists } from "@shared/server/checklist-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listChecklists({
      jobSiteId: searchParams.get("jobSiteId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createChecklist(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
