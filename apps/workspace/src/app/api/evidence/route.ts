import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { createEvidenceNote, listEvidence, uploadEvidenceFile } from "@shared/server/evidence-service";

const EVIDENCE_FORM_FIELDS = new Set([
  "file", "type", "title", "description", "jobSiteId", "workerId", "capturedAt",
]);

function formDataToEvidenceInput(formData: FormData) {
  const input: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (!EVIDENCE_FORM_FIELDS.has(key)) throw new AccessError("Campo prova non valido.", 409);
    if (key === "file") continue;
    if (key in input) throw new AccessError("Campo prova duplicato.", 409);
    if (typeof value !== "string") throw new AccessError("Campo prova non valido.", 409);
    input[key] = value;
  }
  return input;
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listEvidence({
      type: searchParams.get("type") ?? undefined,
      jobSiteId: searchParams.get("jobSiteId") ?? undefined,
      workerId: searchParams.get("workerId") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.toLowerCase().includes("multipart/form-data")) {
      const formData = await request.formData();
      const evidence = await uploadEvidenceFile(formDataToEvidenceInput(formData), formData.getAll("file"));
      return Response.json({ evidence }, { status: 201 });
    }
    const evidence = await createEvidenceNote(await request.json());
    return Response.json({ evidence }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
