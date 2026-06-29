import { asAccessResponse } from "@shared/server/access-errors";
import { listMembers, revokeMember } from "@shared/server/organization-access-service";

export async function GET() {
  try { return Response.json(await listMembers()); }
  catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { memberId?: string };
    return Response.json(await revokeMember(body.memberId ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
