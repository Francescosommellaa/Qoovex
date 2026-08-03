import { asAccessResponse } from "@shared/server/access-errors";
import { getMissingDocumentRequirements } from "@shared/server/document-requirement-service";

export async function GET() {
  try {
    return Response.json(await getMissingDocumentRequirements());
  } catch (error) { return asAccessResponse(error); }
}
