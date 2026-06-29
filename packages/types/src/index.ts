/** Shared platform-neutral contracts for the Qoovex Organization domain. */
export type EntityId = string;

export const platformRoles = ["USER", "SUPER_ADMIN"] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const organizationRoles = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER", "VIEWER"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

/** @deprecated Use organizationRoles. Kept only for temporary /api/structure* compatibility. */
export const structureRoles = organizationRoles;
/** @deprecated Use OrganizationRole. Kept only for temporary /api/structure* compatibility. */
export type StructureRole = OrganizationRole;

export const organizationPermissions = [
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
  "settings:update",
] as const;
export type OrganizationPermission = (typeof organizationPermissions)[number];

export const permissions = organizationPermissions;
export type Permission = OrganizationPermission;

export interface OrganizationSummary {
  id: EntityId;
  name: string;
  code: string;
}

export interface MembershipSummary {
  id: EntityId;
  role: OrganizationRole;
  organization: OrganizationSummary;
}

export interface SupportContext {
  sessionId: EntityId;
  reason: string;
  expiresAt: string;
  sensitiveConfirmedUntil: string | null;
  organization: OrganizationSummary;
}

export interface ViewerContext {
  userId: EntityId;
  platformRole: PlatformRole;
  membership: MembershipSummary | null;
  support: SupportContext | null;
  permissions: Permission[];
}

export interface CreateOrganizationInput { name: string }
export interface CreateInvitationInput { email: string; role: Exclude<OrganizationRole, "OWNER"> }
export interface AcceptInvitationInput { token: string }
export interface OpenSupportSessionInput { organizationCode: string; reason: string; structureCode?: string }

/** @deprecated Use OrganizationSummary. */
export type StructureSummary = OrganizationSummary;
/** @deprecated Use CreateOrganizationInput. */
export type CreateStructureInput = CreateOrganizationInput;
