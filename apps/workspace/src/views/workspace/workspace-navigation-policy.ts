import type { OrganizationPermission, OrganizationRole, PlatformRole } from "@qoovex/types";
import { getPermissionsForRole } from "@shared/server/authorization-policy";

export interface WorkspaceNavigationItem { label: string; href: string; activePath?: string; }
export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  actions: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
}

function has(permissions: readonly OrganizationPermission[], permission: OrganizationPermission) {
  return permissions.includes(permission);
}

export function buildWorkspaceNavigation(access: readonly OrganizationPermission[] | OrganizationRole | null, platformRole: PlatformRole | null): WorkspaceNavigationModel {
  const permissions = Array.isArray(access) ? access : getPermissionsForRole(access as OrganizationRole | null);
  const primary: WorkspaceNavigationItem[] = [];
  const actions: WorkspaceNavigationItem[] = [];

  const account: WorkspaceNavigationItem[] = [];
  if (has(permissions, "organization:read")) account.push({ label: "Gestisci azienda", href: "/settings/organization-profile" });
  if (has(permissions, "members:read")) account.push({ label: "Gestisci collaboratori", href: "/people/access" });
  if (platformRole) account.push({ label: "Gestisci account", href: "/account/security" });
  if (has(permissions, "settings:update") || has(permissions, "members:read")) account.push({ label: "Impostazioni", href: "/settings" });
  if (platformRole === "SUPPORT_AGENT") account.unshift({ label: "Console supporto", href: "/qoovex-admin" });
  if (platformRole === "PLATFORM_ADMIN") account.unshift({ label: "Console Qoovex", href: "/qoovex-admin" });
  return { primary, actions, account };
}

export function isWorkspaceNavigationItemCurrent(pathname: string, searchParams: Pick<URLSearchParams, "get">, href: string, activePath?: string) {
  const target = new URL(href, "https://workspace.qoovex.local");
  const matchPath = activePath ?? target.pathname;
  const isExactIndexRoute = matchPath === "/qoovex-admin" || matchPath === "/settings" || /^\/org\/[^/]+$/.test(matchPath);
  const pathMatches = pathname === matchPath
    || (!isExactIndexRoute && matchPath !== "/" && pathname.startsWith(`${matchPath}/`));
  return pathMatches && [...target.searchParams].every(([key, value]) => searchParams.get(key) === value);
}

export function canReadWorkspaceNotifications(access: readonly OrganizationPermission[] | OrganizationRole | null) {
  const permissions = Array.isArray(access) ? access : getPermissionsForRole(access as OrganizationRole | null);
  return permissions.includes("organization:read");
}
