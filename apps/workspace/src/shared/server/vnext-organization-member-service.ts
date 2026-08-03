import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { db } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { requireOrganizationContext } from "./access-context-service";
import { getPermissionsForPreset } from "./authorization-policy";
import { sendTransactionalEmail } from "./transactional-email-service";
import { buildAbsoluteWorkspaceUrl } from "./workspace-url-service";
import { buildOrganizationInvitationPath } from "@shared/lib/workspace-link-routes";
import { runSerializableTransaction } from "./serializable-transaction";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const invitationSchema = z.object({ email: z.string().trim().email().transform((value) => value.toLowerCase()), recipientName: z.string().trim().max(160).nullable().optional(), jobSiteId: z.string().min(1).nullable().optional() }).strict();

export async function getOrganizationPeople(organizationId: string) {
  const context = await requireOrganizationContext(organizationId);
  if (!context.permissions.includes("members:read")) throw new AccessError("Risorsa non disponibile.", 404);
  const [members, invitations] = await Promise.all([
    db.organizationMembership.findMany({ where: { organizationId, revokedAt: null }, select: { id: true, role: true, preset: true, scopeMode: true, expiresAt: true, accessVersion: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: "asc" } }),
    db.organizationInvitation.findMany({ where: { organizationId, acceptedAt: null, declinedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, email: true, recipientName: true, expiresAt: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return { members, invitations };
}

export async function inviteOrganizationCollaborator(organizationId: string, rawInput: unknown) {
  const context = await requireOrganizationContext(organizationId);
  if (context.role !== "OWNER" || !context.permissions.includes("members:invite")) throw new AccessError("Risorsa non disponibile.", 404);
  const input = invitationSchema.parse(rawInput);
  if (input.jobSiteId && !(await db.jobSite.findFirst({ where: { id: input.jobSiteId, organizationId }, select: { id: true } }))) throw new AccessError("Cantiere non disponibile.", 404);
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true, organizationMemberships: { where: { organizationId, revokedAt: null }, select: { id: true }, take: 1 } } });
  if (existing?.organizationMemberships.length) throw new AccessError("Questo account appartiene gia a questa Azienda.", 409);
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  const invitation = await runSerializableTransaction(async (tx) => {
    await tx.organizationInvitation.updateMany({ where: { organizationId, email: input.email, acceptedAt: null, declinedAt: null, revokedAt: null }, data: { revokedAt: new Date(), activeKey: null } });
    return tx.organizationInvitation.create({ data: { organizationId, email: input.email, recipientName: input.recipientName ?? null, role: "COLLABORATOR", preset: "OPERATIONAL_COLLABORATION", permissionKeys: getPermissionsForPreset("OPERATIONAL_COLLABORATION"), scopeMode: "ASSIGNED", tokenHash, activeKey: `${organizationId}:${input.email}`, invitedById: context.userId, accessUpdatedById: context.userId, expiresAt, resourceGrants: input.jobSiteId ? { create: { organizationId, resourceType: "JOB_SITE", resourceId: input.jobSiteId } } : undefined }, select: { id: true } });
  });
  await sendTransactionalEmail({ to: input.email, template: { kind: "organization-invitation", organizationName: context.organization.name, role: "COLLABORATOR", acceptUrl: buildAbsoluteWorkspaceUrl(buildOrganizationInvitationPath(rawToken)), expiresAt }, idempotencyKey: `organization-invitation:${invitation.id}` });
  return { id: invitation.id, email: input.email, expiresAt: expiresAt.toISOString() };
}

export async function revokeOrganizationCollaborator(organizationId: string, membershipId: string) {
  const context = await requireOrganizationContext(organizationId);
  if (context.role !== "OWNER" || !context.permissions.includes("members:manage")) throw new AccessError("Risorsa non disponibile.", 404);
  return runSerializableTransaction(async (tx) => {
    const target = await tx.organizationMembership.findFirst({ where: { id: membershipId, organizationId, role: "COLLABORATOR", revokedAt: null }, select: { id: true, userId: true } });
    if (!target) throw new AccessError("Collaboratore non disponibile.", 404);
    await tx.organizationMembership.update({ where: { id: target.id }, data: { revokedAt: new Date(), accessVersion: { increment: 1 } } });
    await tx.jobSiteParticipant.updateMany({ where: { membershipId: target.id, status: "ACTIVE" }, data: { status: "REVOKED", accessVersion: { increment: 1 }, activeKey: null, revokedAt: new Date(), endedAt: new Date(), endedByUserId: context.userId } });
    await tx.user.update({ where: { id: target.userId }, data: { authVersion: { increment: 1 } } });
    await tx.session.deleteMany({ where: { userId: target.userId } });
    return { revoked: true };
  });
}

const participantSchema = z.object({ membershipId: z.string().min(1), publicRoleLabel: z.string().trim().min(1).max(120) }).strict();

export async function addExistingCollaboratorToJobSite(organizationId: string, jobSiteId: string, rawInput: unknown) {
  const context = await requireOrganizationContext(organizationId);
  if (!context.permissions.includes("jobSite:participants:manage")) throw new AccessError("Risorsa non disponibile.", 404);
  const input = participantSchema.parse(rawInput);
  return runSerializableTransaction(async (tx) => {
    const [site, membership] = await Promise.all([
      tx.jobSite.findFirst({ where: { id: jobSiteId, organizationId }, select: { id: true } }),
      tx.organizationMembership.findFirst({ where: { id: input.membershipId, organizationId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, select: { id: true, userId: true } }),
    ]);
    if (!site || !membership) throw new AccessError("Collaborator o cantiere non disponibile.", 404);
    return tx.jobSiteParticipant.upsert({ where: { userSideKey: `${jobSiteId}:${membership.userId}` }, create: { organizationId, jobSiteId, userId: membership.userId, membershipId: membership.id, kind: "ORGANIZATION_MEMBER", status: "ACTIVE", publicRoleLabel: input.publicRoleLabel, activeKey: `${jobSiteId}:${membership.userId}:ORGANIZATION_MEMBER`, userSideKey: `${jobSiteId}:${membership.userId}`, activatedAt: new Date(), createdByUserId: context.userId }, update: { membershipId: membership.id, status: "ACTIVE", accessVersion: { increment: 1 }, publicRoleLabel: input.publicRoleLabel, activeKey: `${jobSiteId}:${membership.userId}:ORGANIZATION_MEMBER`, activatedAt: new Date(), revokedAt: null, endedAt: null, endedByUserId: null, endReason: null }, select: { id: true, status: true, publicRoleLabel: true } });
  });
}

export async function endCollaboratorJobSiteParticipation(organizationId: string, jobSiteId: string, participantId: string, reason: string) {
  const context = await requireOrganizationContext(organizationId);
  if (!context.permissions.includes("jobSite:participants:manage")) throw new AccessError("Risorsa non disponibile.", 404);
  if (reason.trim().length < 10) throw new AccessError("Motivazione richiesta.", 409);
  const site = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId }, select: { responsibleParticipantId: true } });
  if (!site) throw new AccessError("Cantiere non disponibile.", 404);
  if (site.responsibleParticipantId === participantId) throw new AccessError("Assegna prima un nuovo responsabile del cantiere.", 409, "RESPONSIBLE_PARTICIPANT_REQUIRED");
  const updated = await db.jobSiteParticipant.updateMany({ where: { id: participantId, organizationId, jobSiteId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, data: { status: "ENDED", accessVersion: { increment: 1 }, activeKey: null, endedAt: new Date(), endedByUserId: context.userId, endReason: reason.trim() } });
  if (updated.count !== 1) throw new AccessError("Partecipazione non disponibile.", 404);
  await db.jobSiteAuthorityGrant.updateMany({ where: { participantId, status: "ACTIVE" }, data: { status: "REVOKED", activeKey: null, revokedAt: new Date(), revokedByUserId: context.userId } });
  return { ended: true };
}
