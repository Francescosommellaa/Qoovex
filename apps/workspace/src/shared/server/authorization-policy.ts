import type { OrganizationPermission, OrganizationRole } from "@qoovex/types";

const OWNER_PERMISSIONS: readonly OrganizationPermission[] = [
  "organization:read",
  "organization:update",
  "members:read",
  "members:invite",
  "members:manage",
  "workers:read",
  "workers:create",
  "workers:update",
  "workers:archive",
  "jobSites:read",
  "jobSites:create",
  "jobSites:update",
  "jobSites:archive",
  "documents:read",
  "documents:upload",
  "documents:update",
  "documents:archive",
  "deadlines:read",
  "deadlines:manage",
  "calendar:read",
  "calendar:manage",
  "checklists:read",
  "checklists:manage",
  "checklists:complete",
  "evidence:read",
  "evidence:upload",
  "evidence:delete",
  "documentPackages:read",
  "documentPackages:create",
  "documentPackages:share",
  "auditLog:read",
  "assignments:read",
  "assignments:manage",
  "settings:update",
];

const ROLE_PERMISSIONS: Record<OrganizationRole, readonly OrganizationPermission[]> = {
  OWNER: OWNER_PERMISSIONS,
  ADMIN: [
    "organization:read",
    "members:read",
    "members:invite",
    "workers:read",
    "workers:create",
    "workers:update",
    "workers:archive",
    "jobSites:read",
    "jobSites:create",
    "jobSites:update",
    "jobSites:archive",
    "documents:read",
    "documents:upload",
    "documents:update",
    "documents:archive",
    "deadlines:read",
    "deadlines:manage",
    "calendar:read",
    "calendar:manage",
    "checklists:read",
    "checklists:manage",
    "checklists:complete",
    "evidence:read",
    "evidence:upload",
    "evidence:delete",
    "documentPackages:read",
    "documentPackages:create",
    "documentPackages:share",
    "assignments:read",
    "assignments:manage",
  ],
  SAFETY_CONSULTANT: [
    "organization:read",
    "workers:read",
    "jobSites:read",
    "documents:read",
    "documents:upload",
    "documents:update",
    "deadlines:read",
    "calendar:read",
    "checklists:read",
    "checklists:manage",
    "checklists:complete",
    "evidence:read",
    "evidence:upload",
    "documentPackages:read",
    "documentPackages:create",
    "assignments:read",
  ],
  SITE_MANAGER: [
    "organization:read",
    "workers:read",
    "jobSites:read",
    "documents:read",
    "deadlines:read",
    "calendar:read",
    "checklists:read",
    "checklists:complete",
    "evidence:read",
    "evidence:upload",
  ],
  WORKER: [
    "organization:read",
    "workers:read",
    "jobSites:read",
    "documents:read",
    "documents:upload",
    "deadlines:read",
    "calendar:read",
    "checklists:complete",
    "evidence:read",
    "evidence:upload",
  ],
};

export function getPermissionsForRole(role: OrganizationRole | null): OrganizationPermission[] {
  return role ? [...ROLE_PERMISSIONS[role]] : [];
}

export function canInviteRole(actor: OrganizationRole, target: OrganizationRole) {
  if (target === "OWNER") return false;
  if (actor === "OWNER") return true;
  return actor === "ADMIN" && target !== "ADMIN";
}

export function canRevokeRole(actor: OrganizationRole, target: OrganizationRole) {
  if (target === "OWNER") return false;
  return actor === "OWNER";
}
