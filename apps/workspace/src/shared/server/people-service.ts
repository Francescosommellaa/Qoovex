import "server-only";
import { db } from "@qoovex/db";
import { requireOrganizationDomainAccess } from "./domain-access-service";

export async function getPeopleAccessOverview() {
  const { organizationId } = await requireOrganizationDomainAccess("members:read", ["OWNER", "COLLABORATOR"] as const);
  const now = new Date();
  const [memberships, invitations] = await Promise.all([
    db.organizationMembership.findMany({
      where: { organizationId },
      select: {
        id: true, role: true, preset: true, permissionKeys: true, scopeMode: true,
        expiresAt: true, accessVersion: true, updatedAt: true, createdAt: true, revokedAt: true,
        user: {
          select: {
            id: true, email: true, firstName: true, lastName: true,
            workerUserLinks: { where: { organizationId, archivedAt: null }, select: { worker: { select: { id: true, displayName: true } } } },
            jobSiteParticipants: { where: { organizationId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, select: { jobSite: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: [{ revokedAt: "asc" }, { createdAt: "asc" }],
    }),
    db.organizationInvitation.findMany({ where: { organizationId }, select: { id: true, email: true, role: true, workerId: true, expiresAt: true, acceptedAt: true, declinedAt: true, revokedAt: true, createdAt: true, worker: { select: { displayName: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const activeUsers = memberships.filter((item) => item.revokedAt === null);
  const incomplete: Array<{ kind: "WORKER_LINK" | "JOB_SITE_SCOPE"; membershipId: string; userId: string; label: string; message: string }> = [];
  for (const membership of activeUsers) {
    if (membership.preset === "LIMITED_UPLOAD" && !membership.user.workerUserLinks.length) incomplete.push({ kind: "WORKER_LINK", membershipId: membership.id, userId: membership.user.id, label: membership.user.email, message: "Collega il Collaborator a un profilo operativo." });
    if (membership.preset === "SITE_MANAGER" && !membership.user.jobSiteParticipants.length) incomplete.push({ kind: "JOB_SITE_SCOPE", membershipId: membership.id, userId: membership.user.id, label: membership.user.email, message: "Aggiungi il Collaborator ad almeno un cantiere." });
  }
  return { generatedAt: now.toISOString(), activeUsers, revokedUsers: memberships.filter((item) => item.revokedAt !== null), pendingInvitations: invitations.filter((item) => !item.acceptedAt && !item.declinedAt && !item.revokedAt && item.expiresAt > now), expiredInvitations: invitations.filter((item) => !item.acceptedAt && !item.declinedAt && !item.revokedAt && item.expiresAt <= now), revokedInvitations: invitations.filter((item) => Boolean(item.revokedAt || item.declinedAt)), incomplete };
}
