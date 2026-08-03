import { asAccessResponse } from "@shared/server/access-errors";
import { createDocumentPackage, listDocumentPackages } from "@shared/server/document-package-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return Response.json(await listDocumentPackages({
      jobSiteId: url.searchParams.get("jobSiteId"),
      status: url.searchParams.get("status"),
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createDocumentPackage(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
