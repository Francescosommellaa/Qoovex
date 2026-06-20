import type { Permission, StructureRole } from "@qoovex/types";

const ROLE_PERMISSIONS: Record<StructureRole, readonly Permission[]> = {
  ADMIN: [
    "structure:read", "structure:manage", "members:read", "members:invite-head",
    "members:invite-crew", "members:revoke", "hall:read", "kitchen:read",
    "kitchen:plan", "crew:tasks:read", "crew:tasks:update",
  ],
  HEAD_OF_HALL: ["structure:read", "hall:read"],
  HEAD_CHEF: [
    "structure:read", "members:read", "members:invite-crew", "members:revoke",
    "kitchen:read", "kitchen:plan", "crew:tasks:read",
  ],
  KITCHEN_CREW: ["structure:read", "crew:tasks:read", "crew:tasks:update"],
};

export function getPermissionsForRole(role: StructureRole | null): Permission[] {
  return role ? [...ROLE_PERMISSIONS[role]] : [];
}

export function canInviteRole(actor: StructureRole, target: StructureRole) {
  if (target === "ADMIN") return false;
  if (actor === "ADMIN") return true;
  return actor === "HEAD_CHEF" && target === "KITCHEN_CREW";
}

export function canRevokeRole(actor: StructureRole, target: StructureRole) {
  if (target === "ADMIN") return false;
  if (actor === "ADMIN") return true;
  return actor === "HEAD_CHEF" && target === "KITCHEN_CREW";
}
