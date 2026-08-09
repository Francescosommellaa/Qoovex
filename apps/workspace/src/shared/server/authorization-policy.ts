import { organizationPermissions, type OrganizationAccessPreset, type OrganizationPermission, type OrganizationRole } from "@qoovex/types";

const READ: readonly OrganizationPermission[] = ["organization:read", "organizationProfile:read", "workers:read", "jobSites:read", "assignments:read", "jobSite:view", "jobSite:steps:read", "jobSite:payments:read"];
const OPERATE: readonly OrganizationPermission[] = [...READ, "workers:create", "workers:update", "jobSites:create", "jobSites:update", "jobSite:update", "jobSite:publish", "jobSite:participants:manage", "jobSite:manageParticipants", "jobSite:steps:manage", "jobSite:steps:updateStatus", "jobSite:requests:create", "jobSite:requests:respond", "jobSite:changes:propose", "jobSite:commercial:negotiate", "jobSite:commercial:accept", "jobSite:payments:request", "jobSite:payments:confirmReceipt", "jobSite:disputes:create", "jobSite:disputes:respond", "jobSite:closure:propose", "jobSite:closure:confirm", "jobSite:export"];
const PRESET_PERMISSIONS: Record<OrganizationAccessPreset, readonly OrganizationPermission[]> = {
  READ_ONLY: READ,
  OPERATIONAL_COLLABORATION: OPERATE,
  SITE_MANAGER: OPERATE,
  LIMITED_UPLOAD: [...READ],
  CUSTOM: [],
};

export function getPermissionsForRole(role: OrganizationRole | null): OrganizationPermission[] { return role === "OWNER" ? [...organizationPermissions] : []; }
export function getPermissionsForPreset(preset: OrganizationAccessPreset): OrganizationPermission[] { return [...PRESET_PERMISSIONS[preset]]; }
export function getSupportSessionPermissions(): OrganizationPermission[] { return [...READ, "members:read"]; }
export function sanitizeOrganizationPermissions(values: readonly string[]): OrganizationPermission[] { const valid = new Set<string>(organizationPermissions); return [...new Set(values.filter((value): value is OrganizationPermission => valid.has(value)))]; }

const forbidden = new Set<OrganizationPermission>(["organization:update", "organizationProfile:update", "members:invite", "members:manage", "auditLog:read"]);
const dependencies: Partial<Record<OrganizationPermission, readonly OrganizationPermission[]>> = {
  "workers:create": ["workers:read"], "workers:update": ["workers:read"], "workers:archive": ["workers:read"],
  "jobSites:create": ["jobSites:read"], "jobSites:update": ["jobSites:read"], "jobSites:archive": ["jobSites:read"],
  "assignments:manage": ["assignments:read"], "organizationProfile:update": ["organizationProfile:read"],
};
export function normalizeCollaboratorPermissions(values: readonly string[]): OrganizationPermission[] {
  const normalized = new Set(sanitizeOrganizationPermissions(values).filter((value) => !forbidden.has(value)));
  for (const value of [...normalized]) for (const dependency of dependencies[value] ?? []) normalized.add(dependency);
  if (normalized.size) normalized.add("organization:read");
  return organizationPermissions.filter((value) => normalized.has(value));
}
export function canInviteRole(actor: OrganizationRole, target: OrganizationRole) { return actor === "OWNER" && target === "COLLABORATOR"; }
export function canRevokeRole(actor: OrganizationRole, target: OrganizationRole) { return actor === "OWNER" && target !== "OWNER"; }
