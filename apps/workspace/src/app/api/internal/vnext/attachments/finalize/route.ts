import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { isAuthorizedCronRequest } from "@shared/server/cron-auth";
import { executeVNextAction } from "@shared/server/vnext-action-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function POST(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) throw new AccessError("Risorsa non disponibile.", 404);
    const body = await request.json();
    const participant = await db.jobSiteParticipant.findFirst({
      where: { id: String(body.participantId), organizationId: String(body.organizationId), jobSiteId: String(body.jobSiteId), kind: "ORGANIZATION_MEMBER", status: "ACTIVE" },
      select: { id: true, userId: true, organizationId: true, jobSiteId: true, membershipId: true, accessVersion: true, membership: { select: { accessVersion: true, role: true } } },
    });
    if (!participant?.membershipId || !participant.membership) throw new AccessError("Risorsa non disponibile.", 404);
    return Response.json(await executeVNextAction({
      actor: { userId: participant.userId, organizationId: participant.organizationId, jobSiteId: participant.jobSiteId, side: "ORGANIZATION_MEMBER", participantId: participant.id, participantAccessVersion: participant.accessVersion, membershipId: participant.membershipId, accessVersion: participant.membership.accessVersion, role: participant.membership.role },
      idempotencyKey: String(body.idempotencyKey),
      action: body.action,
      internal: true,
    }));
  } catch (error) { return asVNextApiError(error); }
}
