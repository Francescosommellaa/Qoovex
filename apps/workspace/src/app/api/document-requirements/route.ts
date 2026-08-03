import { asAccessResponse } from "@shared/server/access-errors";
import { createDocumentRequirement, listDocumentRequirements } from "@shared/server/document-requirement-service";

export async function GET() {
  try {
    return Response.json(await listDocumentRequirements());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createDocumentRequirement(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
