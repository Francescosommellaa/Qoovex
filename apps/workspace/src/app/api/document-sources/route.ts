import { asAccessResponse } from "@shared/server/access-errors";
import { createDocumentSourcePolicy, listDocumentSourcePolicies } from "@shared/server/document-source-service";

export async function GET() {
  try {
    return Response.json(await listDocumentSourcePolicies());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const policy = await createDocumentSourcePolicy(await request.json());
    return Response.json({ policy }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
