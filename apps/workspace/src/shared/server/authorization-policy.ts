import { organizationPermissions, type OrganizationAccessPreset, type OrganizationPermission, type OrganizationRole } from "@qoovex/types";

const READ: readonly OrganizationPermission[] = ["organization:read", "organizationProfile:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "evidence:read", "evidence:file:read", "assignments:read"];
const OPERATE: readonly OrganizationPermission[] = [...READ, "workers:create", "workers:update", "jobSites:create", "jobSites:update", "documents:upload", "documents:update", "evidence:upload"];
const PRESET_PERMISSIONS: Record<OrganizationAccessPreset, readonly OrganizationPermission[]> = {
  READ_ONLY: READ,
  OPERATIONAL_COLLABORATION: OPERATE,
  SITE_MANAGER: OPERATE,
  DOCUMENT_REVIEWER: [...READ, "documents:upload", "documents:update"],
  LIMITED_UPLOAD: [...READ, "documents:upload", "evidence:upload"],
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
  "documents:file:read": ["documents:read"], "documents:upload": ["documents:read"], "documents:update": ["documents:read"], "documents:archive": ["documents:read"],
  "evidence:file:read": ["evidence:read"], "evidence:upload": ["evidence:read"], "evidence:delete": ["evidence:read"],
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
