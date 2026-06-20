/** Marker shared by future platform-neutral Pre-Service contracts. */
export type EntityId = string;

export const platformRoles = ["USER", "SUPER_ADMIN"] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const structureRoles = ["ADMIN", "HEAD_OF_HALL", "HEAD_CHEF", "KITCHEN_CREW"] as const;
export type StructureRole = (typeof structureRoles)[number];

export type Department = "DIRECTION" | "HALL" | "KITCHEN";

export const permissions = [
  "structure:read",
  "structure:manage",
  "members:read",
  "members:invite-head",
  "members:invite-crew",
  "members:revoke",
  "hall:read",
  "kitchen:read",
  "kitchen:plan",
  "crew:tasks:read",
  "crew:tasks:update",
] as const;
export type Permission = (typeof permissions)[number];

export interface StructureSummary {
  id: EntityId;
  name: string;
  code: string;
}

export interface MembershipSummary {
  id: EntityId;
  role: StructureRole;
  structure: StructureSummary;
}

export interface SupportContext {
  sessionId: EntityId;
  reason: string;
  expiresAt: string;
  sensitiveConfirmedUntil: string | null;
  structure: StructureSummary;
}

export interface ViewerContext {
  userId: EntityId;
  platformRole: PlatformRole;
  membership: MembershipSummary | null;
  support: SupportContext | null;
  permissions: Permission[];
}

export interface CreateStructureInput { name: string }
export interface CreateInvitationInput { email: string; role: Exclude<StructureRole, "ADMIN"> }
export interface AcceptInvitationInput { token: string }
export interface OpenSupportSessionInput { structureCode: string; reason: string }
