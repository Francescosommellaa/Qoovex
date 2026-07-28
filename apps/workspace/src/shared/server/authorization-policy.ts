import {
  organizationPermissions,
  type OrganizationAccessPreset,
  type OrganizationPermission,
  type OrganizationRole,
} from "@qoovex/types";

const PRESET_PERMISSIONS: Record<OrganizationAccessPreset, readonly OrganizationPermission[]> = {
  READ_ONLY: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "deadlines:read", "calendar:read", "checklists:read", "evidence:read", "documentPackages:read", "processes:read", "processes:timeline:read"],
  OPERATIONAL_COLLABORATION: ["organization:read", "workers:read", "workers:create", "workers:update", "jobSites:read", "jobSites:create", "jobSites:update", "documents:read", "documents:file:read", "documents:upload", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:upload", "processes:read", "processes:timeline:read"],
  SITE_MANAGER: ["organization:read", "workers:read", "jobSites:read", "documents:read", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:upload"],
  DOCUMENT_REVIEWER: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "documents:update", "documents:verify", "documents:expiry:manage", "documents:packages:add", "deadlines:read", "documentPackages:read", "documentPackages:create", "documentPackages:update", "documentPackages:review", "processes:read", "processes:timeline:read", "processes:decide"],
  LIMITED_UPLOAD: ["organization:read", "workers:read", "jobSites:read", "documents:read", "documents:upload", "deadlines:read", "calendar:read", "evidence:read", "evidence:upload"],
  CUSTOM: [],
};

export function getPermissionsForRole(role: OrganizationRole | null): OrganizationPermission[] {
  if (role === "OWNER") return [...organizationPermissions];
  return [];
}

export function getPermissionsForPreset(preset: OrganizationAccessPreset): OrganizationPermission[] {
  return [...PRESET_PERMISSIONS[preset]];
}

const SUPPORT_SESSION_PERMISSIONS: readonly OrganizationPermission[] = [
  "organization:read",
  "members:read",
  "workers:read",
  "jobSites:read",
  "documents:read",
  "deadlines:read",
  "calendar:read",
  "checklists:read",
  "evidence:read",
  "documentPackages:read",
  "processes:read",
  "processes:timeline:read",
  "assignments:read",
];

export function getSupportSessionPermissions(): OrganizationPermission[] {
  return [...SUPPORT_SESSION_PERMISSIONS];
}

export function sanitizeOrganizationPermissions(values: readonly string[]): OrganizationPermission[] {
  const valid = new Set<string>(organizationPermissions);
  return [...new Set(values.filter((value): value is OrganizationPermission => valid.has(value)))];
}

const COLLABORATOR_FORBIDDEN_PERMISSIONS = new Set<OrganizationPermission>([
  "organization:update",
  "members:invite",
  "members:manage",
  "auditLog:read",
]);

const PERMISSION_DEPENDENCIES: Partial<Record<OrganizationPermission, readonly OrganizationPermission[]>> = {
  "documents:file:read": ["documents:read"],
  "documents:upload": ["documents:read"],
  "documents:update": ["documents:read"],
  "documents:verify": ["documents:read"],
  "documents:expiry:manage": ["documents:read"],
  "documents:packages:add": ["documents:read", "documentPackages:read"],
  "documents:sensitive:read": ["documents:read", "documents:file:read"],
  "documents:archive": ["documents:read"],
  "workers:create": ["workers:read"],
  "workers:update": ["workers:read"],
  "workers:archive": ["workers:read"],
  "jobSites:create": ["jobSites:read"],
  "jobSites:update": ["jobSites:read"],
  "jobSites:archive": ["jobSites:read"],
  "checklists:manage": ["checklists:read"],
  "checklists:complete": ["checklists:read"],
  "evidence:upload": ["evidence:read"],
  "evidence:delete": ["evidence:read"],
  "documentPackages:create": ["documentPackages:read"],
  "documentPackages:update": ["documentPackages:read"],
  "documentPackages:review": ["documentPackages:read"],
  "documentPackages:approve": ["documentPackages:read", "documentPackages:review"],
  "documentPackages:share": ["documentPackages:read", "documentPackages:approve"],
  "documentPackages:revoke": ["documentPackages:read"],
  "documentPackages:access:read": ["documentPackages:read"],
  "processes:timeline:read": ["processes:read"],
  "processes:decide": ["processes:read", "processes:timeline:read"],
  "processes:exceptions:resolve": ["processes:read", "processes:timeline:read"],
  "processes:retry": ["processes:read", "processes:timeline:read"],
  "assignments:manage": ["assignments:read"],
};

export function normalizeCollaboratorPermissions(values: readonly string[]): OrganizationPermission[] {
  const normalized = new Set(sanitizeOrganizationPermissions(values).filter((permission) => !COLLABORATOR_FORBIDDEN_PERMISSIONS.has(permission)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const permission of [...normalized]) {
      for (const dependency of PERMISSION_DEPENDENCIES[permission] ?? []) {
        if (!normalized.has(dependency)) {
          normalized.add(dependency);
          changed = true;
        }
      }
    }
  }
  if (normalized.size) normalized.add("organization:read");
  return organizationPermissions.filter((permission) => normalized.has(permission));
}

export function canInviteRole(actor: OrganizationRole, target: OrganizationRole) {
  return actor === "OWNER" && target === "COLLABORATOR";
}

export function canRevokeRole(actor: OrganizationRole, target: OrganizationRole) {
  return target !== "OWNER" && actor === "OWNER";
}
