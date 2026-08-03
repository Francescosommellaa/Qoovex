import "server-only";

import { db } from "@qoovex/db";
import { requireIdentity } from "./access-context-service";

export async function buildClientDataExport() {
  const identity = await requireIdentity();
  const [profile, properties, participations] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: identity.id }, select: { id: true, email: true, firstName: true, lastName: true, username: true, createdAt: true, updatedAt: true } }),
    db.clientProperty.findMany({ where: { userId: identity.id }, select: { id: true, displayName: true, addressLine: true, city: true, postalCode: true, countryCode: true, privateNotes: true, createdAt: true, updatedAt: true, archivedAt: true, jobSites: { select: { jobSiteId: true, createdAt: true, archivedAt: true } } }, orderBy: { createdAt: "asc" } }),
    db.jobSiteParticipant.findMany({ where: { userId: identity.id, kind: "CLIENT" }, select: { id: true, organizationId: true, jobSiteId: true, kind: true, status: true, publicRoleLabel: true, invitedAt: true, activatedAt: true, suspendedAt: true, endedAt: true, revokedAt: true, createdAt: true, updatedAt: true, jobSite: { select: { name: true, status: true, organization: { select: { name: true } } } } }, orderBy: { createdAt: "asc" } }),
  ]);
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), profile, properties, participations };
}
