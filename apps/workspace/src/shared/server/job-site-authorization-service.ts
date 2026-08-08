import "server-only";

import { db, type AuthorityCapability } from "@qoovex/db";
import type { OrganizationPermission } from "@qoovex/types";
import { AccessError } from "./access-errors";
import { requireClientInitialAgreementContext, requireClientJobSiteContext, requireIdentity, requireOrganizationContext } from "./access-context-service";

export type JobSiteActor = {
  userId: string;
  organizationId: string;
  jobSiteId: string;
  side: "ORGANIZATION_MEMBER" | "CLIENT";
  participantId: string;
  participantAccessVersion: number;
  membershipId: string | null;
  accessVersion: number | null;
  role: "OWNER" | "COLLABORATOR" | null;
};

export async function resolveOrganizationJobSiteActor(input: {
  organizationId: string;
  jobSiteId: string;
  permission: OrganizationPermission;
}): Promise<JobSiteActor> {
  const context = await requireOrganizationContext(input.organizationId);
  if (!context.permissions.includes(input.permission)) throw new AccessError("Risorsa non disponibile.", 404);
  const participant = await db.jobSiteParticipant.findFirst({
    where: {
      organizationId: input.organizationId,
      jobSiteId: input.jobSiteId,
      membershipId: context.membershipId,
      userId: context.userId,
      kind: "ORGANIZATION_MEMBER",
      status: "ACTIVE",
      jobSite: { organizationId: input.organizationId },
    },
    select: { id: true, accessVersion: true },
  });
  if (!participant) throw new AccessError("Non partecipi a questo cantiere.", 404);
  return {
    userId: context.userId,
    organizationId: input.organizationId,
    jobSiteId: input.jobSiteId,
    side: "ORGANIZATION_MEMBER",
    participantId: participant.id,
    participantAccessVersion: participant.accessVersion,
    membershipId: context.membershipId,
    accessVersion: context.accessVersion,
    role: context.role,
  };
}

export async function resolveClientJobSiteActor(jobSiteId: string): Promise<JobSiteActor> {
  const participant = await requireClientJobSiteContext(jobSiteId);
  return {
    userId: participant.userId,
    organizationId: participant.organizationId,
    jobSiteId,
    side: "CLIENT",
    participantId: participant.id,
    participantAccessVersion: participant.accessVersion,
    membershipId: null,
    accessVersion: null,
    role: null,
  };
}

export async function resolveClientInitialAgreementActor(jobSiteId: string): Promise<JobSiteActor> {
  const participant = await requireClientInitialAgreementContext(jobSiteId);
  return {
    userId: participant.userId,
    organizationId: participant.organizationId,
    jobSiteId,
    side: "CLIENT",
    participantId: participant.id,
    participantAccessVersion: participant.accessVersion,
    membershipId: null,
    accessVersion: null,
    role: null,
  };
}

export async function resolveInvitationIdentity() {
  return requireIdentity();
}

export async function revalidateActor(actor: JobSiteActor, options?: { allowPendingClient?: boolean }) {
  const allowedStatuses = actor.side === "CLIENT" && options?.allowPendingClient ? ["PENDING", "ACTIVE"] as const : ["ACTIVE"] as const;
  const participant = await db.jobSiteParticipant.findFirst({
    where: { id: actor.participantId, userId: actor.userId, organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, kind: actor.side, status: { in: [...allowedStatuses] }, accessVersion: actor.participantAccessVersion },
    select: { id: true, membershipId: true },
  });
  if (!participant) throw new AccessError("Accesso revocato.", 403, "ACCESS_REVOKED");
  if (actor.side === "ORGANIZATION_MEMBER") {
    const membership = await db.organizationMembership.findFirst({
      where: { id: actor.membershipId ?? "", organizationId: actor.organizationId, userId: actor.userId, revokedAt: null, accessVersion: actor.accessVersion ?? -1, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { id: true },
    });
    if (!membership) throw new AccessError("Accesso modificato o revocato.", 403, "ACCESS_VERSION_STALE");
  }
  return participant;
}

export async function requireEconomicAuthority(participantId: string, capability: AuthorityCapability) {
  const now = new Date();
  const grant = await db.jobSiteAuthorityGrant.findFirst({
    where: { participantId, capability, status: "ACTIVE", validFrom: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    select: { id: true, participantAccessVersion: true, participant: { select: { accessVersion: true } } },
  });
  if (!grant || grant.participantAccessVersion !== grant.participant.accessVersion) throw new AccessError("Delega economica esplicita richiesta.", 403, "ECONOMIC_AUTHORITY_REQUIRED");
  return grant.id;
}
