import { asAccessResponse } from "@shared/server/access-errors";
import { runDocumentSourceCheck } from "@shared/server/document-source-service";

export async function POST(request: Request) {
  try {
    const check = await runDocumentSourceCheck(await request.json());
    return Response.json({ check }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
