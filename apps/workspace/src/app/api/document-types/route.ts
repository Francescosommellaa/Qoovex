import { asAccessResponse } from "@shared/server/access-errors";
import { createDocumentType, listDocumentTypes } from "@shared/server/document-type-service";

export async function GET() {
  try {
    return Response.json(await listDocumentTypes());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createDocumentType(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
