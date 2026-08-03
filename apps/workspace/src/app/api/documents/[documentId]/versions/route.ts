import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { listDocumentVersions, uploadDocumentVersion } from "@shared/server/document-version-service";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

function assertOnlyFileField(formData: FormData) {
  const keys = new Set([...formData.keys()]);
  for (const key of keys) {
    if (key !== "file") throw new AccessError("Campo upload non valido.", 409);
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await listDocumentVersions(documentId));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const formData = await request.formData();
    assertOnlyFileField(formData);
    const version = await uploadDocumentVersion(documentId, formData.getAll("file"));
    return Response.json({ version }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
