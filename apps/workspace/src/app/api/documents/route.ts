import { asAccessResponse } from "@shared/server/access-errors";
import { createDocument, listDocuments } from "@shared/server/document-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listDocuments({
      ownerType: searchParams.get("ownerType") ?? undefined,
      workerId: searchParams.get("workerId") ?? undefined,
      jobSiteId: searchParams.get("jobSiteId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      categoryKey: searchParams.get("categoryKey") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createDocument(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
