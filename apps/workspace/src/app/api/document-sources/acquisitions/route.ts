import { asAccessResponse } from "@shared/server/access-errors";
import { registerDocumentAcquisition } from "@shared/server/document-source-service";

export async function POST(request: Request) {
  try {
    const acquisition = await registerDocumentAcquisition(await request.json());
    return Response.json({ acquisition }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
