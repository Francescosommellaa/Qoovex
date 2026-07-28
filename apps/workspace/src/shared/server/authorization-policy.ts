import {
  organizationPermissions,
  type OrganizationAccessPreset,
  type OrganizationPermission,
  type OrganizationRole,
} from "@qoovex/types";

const PRESET_PERMISSIONS: Record<OrganizationAccessPreset, readonly OrganizationPermission[]> = {
  READ_ONLY: ["organization:read", "organizationProfile:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "deadlines:read", "calendar:read", "checklists:read", "evidence:read", "evidence:file:read", "documentPackages:read", "processes:read", "processes:timeline:read", "requests:read", "contextMessages:read", "documentSources:read"],
  OPERATIONAL_COLLABORATION: ["organization:read", "organizationProfile:read", "workers:read", "workers:create", "workers:update", "jobSites:read", "jobSites:create", "jobSites:update", "documents:read", "documents:file:read", "documents:upload", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:file:read", "evidence:upload", "processes:read", "processes:timeline:read", "requests:read", "requests:create", "requests:manage", "contextMessages:read", "contextMessages:create", "documentSources:read", "documentSources:check"],
  SITE_MANAGER: ["organization:read", "organizationProfile:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "deadlines:read", "calendar:read", "checklists:read", "checklists:complete", "evidence:read", "evidence:file:read", "evidence:upload", "requests:read", "requests:create", "requests:manage", "contextMessages:read", "contextMessages:create", "documentSources:read", "documentSources:check"],
  DOCUMENT_REVIEWER: ["organization:read", "organizationProfile:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "documents:update", "documents:verify", "documents:expiry:manage", "documents:packages:add", "deadlines:read", "documentPackages:read", "documentPackages:create", "documentPackages:update", "documentPackages:review", "evidence:read", "evidence:file:read", "evidence:review", "evidence:upload", "processes:read", "processes:timeline:read", "processes:decide", "requests:read", "requests:create", "requests:manage", "contextMessages:read", "contextMessages:create", "documentSources:read", "documentSources:manage", "documentSources:check"],
  LIMITED_UPLOAD: ["organization:read", "organizationProfile:read", "workers:read", "jobSites:read", "documents:read", "documents:file:read", "documents:upload", "deadlines:read", "calendar:read", "evidence:read", "evidence:file:read", "evidence:upload", "requests:read", "requests:create", "contextMessages:read", "contextMessages:create", "documentSources:read"],
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
  "organizationProfile:read",
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
  "requests:read",
  "documentSources:read",
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
  "organizationProfile:update",
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
  "evidence:file:read": ["evidence:read"],
  "evidence:sensitive:read": ["evidence:read", "evidence:file:read"],
  "evidence:review": ["evidence:read"],
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
  "organizationProfile:update": ["organizationProfile:read"],
  "requests:create": ["requests:read"],
  "requests:manage": ["requests:read"],
  "contextMessages:create": ["contextMessages:read"],
  "documentSources:manage": ["documentSources:read"],
  "documentSources:check": ["documentSources:read"],
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
