import {
  organizationPermissions,
  type OrganizationAccessPreset,
  type OrganizationPermission,
  type OrganizationRole,
} from "@qoovex/types";

const ADMIN_PERMISSIONS: readonly OrganizationPermission[] = organizationPermissions.filter((permission) =>
  !["organization:update", "members:manage", "auditLog:read", "settings:update"].includes(permission),
);

const PRESET_PERMISSIONS: Record<OrganizationAccessPreset, readonly OrganizationPermission[]> = {
  OPERATIONAL_COLLABORATOR: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:upload", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:upload"],
  SITE_MANAGER: ["organization:read", "workers:read", "jobSites:read", "documents:read", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:upload"],
  CONSULTANT: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:upload", "documents:update", "deadlines:read", "calendar:read", "checklists:read", "checklists:manage", "checklists:complete", "evidence:read", "evidence:upload", "documentPackages:read", "documentPackages:create", "assignments:read"],
  VIEWER: ["organization:read", "workers:read", "jobSites:read", "documents:read", "deadlines:read", "calendar:read", "checklists:read", "evidence:read", "documentPackages:read"],
  LIMITED_UPLOAD: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:upload", "deadlines:read", "calendar:read", "evidence:read", "evidence:upload"],
};

export function getPermissionsForRole(role: OrganizationRole | null): OrganizationPermission[] {
  if (role === "OWNER") return [...organizationPermissions];
  if (role === "ADMIN") return [...ADMIN_PERMISSIONS];
  if (role === "SAFETY_CONSULTANT") return getPermissionsForPreset("CONSULTANT");
  if (role === "SITE_MANAGER") return getPermissionsForPreset("SITE_MANAGER");
  if (role === "WORKER") return getPermissionsForPreset("LIMITED_UPLOAD");
  if (role === "VIEWER") return getPermissionsForPreset("VIEWER");
  return [];
}

export function getPermissionsForPreset(preset: OrganizationAccessPreset): OrganizationPermission[] {
  return [...PRESET_PERMISSIONS[preset]];
}

export function sanitizeOrganizationPermissions(values: readonly string[]): OrganizationPermission[] {
  const valid = new Set<string>(organizationPermissions);
  return [...new Set(values.filter((value): value is OrganizationPermission => valid.has(value)))];
}

export function canInviteRole(actor: OrganizationRole, target: OrganizationRole) {
  if (target === "OWNER") return false;
  return actor === "OWNER" || (actor === "ADMIN" && target !== "ADMIN");
}

export function canRevokeRole(actor: OrganizationRole, target: OrganizationRole) {
  return target !== "OWNER" && actor === "OWNER";
}
