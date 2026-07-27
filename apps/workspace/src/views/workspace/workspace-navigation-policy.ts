import type { OrganizationPermission, OrganizationRole } from "@qoovex/types";
import { getPermissionsForRole } from "@shared/server/authorization-policy";

export interface WorkspaceNavigationItem { label: string; href: string; }
export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  actions: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
  searchEnabled: boolean;
}

function has(permissions: readonly OrganizationPermission[], permission: OrganizationPermission) {
  return permissions.includes(permission);
}

export function buildWorkspaceNavigation(access: readonly OrganizationPermission[] | OrganizationRole | null, platformRole: "USER" | "SUPER_ADMIN" | null): WorkspaceNavigationModel {
  const permissions = Array.isArray(access) ? access : getPermissionsForRole(access as OrganizationRole | null);
  const primary: WorkspaceNavigationItem[] = [];
  if (has(permissions, "organization:read")) primary.push({ label: "Centro operativo", href: "/dashboard" });
  if (has(permissions, "documents:read")) primary.push({ label: "Documenti", href: "/documents" });
  if (has(permissions, "workers:read")) primary.push({ label: "Lavoratori", href: "/workers" });
  if (has(permissions, "jobSites:read")) primary.push({ label: "Cantieri", href: "/job-sites" });
  if (has(permissions, "documentPackages:read")) primary.push({ label: "Condivisioni", href: "/document-packages" });
  if (has(permissions, "settings:update") || has(permissions, "members:read")) primary.push({ label: "Impostazioni", href: "/settings" });

  const actions: WorkspaceNavigationItem[] = [];
  if (has(permissions, "documents:upload")) actions.push({ label: "Documento", href: "/documents?intent=upload" });
  if (has(permissions, "jobSites:create")) actions.push({ label: "Cantiere", href: "/job-sites/new" });
  if (has(permissions, "workers:create")) actions.push({ label: "Lavoratore", href: "/workers/new" });
  if (has(permissions, "evidence:upload")) actions.push({ label: "Prova", href: "/evidence/new" });

  const account: WorkspaceNavigationItem[] = [];
  if (platformRole) account.push({ label: "Sicurezza", href: "/account/security" });
  if (platformRole === "SUPER_ADMIN") account.unshift({ label: "Console Qoovex", href: "/qoovex-admin" });
  return { primary, actions: actions.slice(0, 4), account, searchEnabled: has(permissions, "organization:read") };
}

export function canReadWorkspaceNotifications(access: readonly OrganizationPermission[] | OrganizationRole | null) {
  const permissions = Array.isArray(access) ? access : getPermissionsForRole(access as OrganizationRole | null);
  return permissions.includes("organization:read");
}
