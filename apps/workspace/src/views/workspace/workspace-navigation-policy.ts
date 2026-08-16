import type { OrganizationPermission, OrganizationRole, PlatformRole } from "@qoovex/types";
import { getPermissionsForRole } from "@shared/server/authorization-policy";

export interface WorkspaceNavigationItem { label: string; href: string; activePaths?: readonly string[]; }
export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  actions: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
}

export const organizationPrimaryNavigation: readonly WorkspaceNavigationItem[] = [
  { label: "Panoramica", href: "/" },
  { label: "Cantieri", href: "/job-sites" },
];

function has(permissions: readonly OrganizationPermission[], permission: OrganizationPermission) {
  return permissions.includes(permission);
}

export function buildWorkspaceNavigation(access: readonly OrganizationPermission[] | OrganizationRole | null, platformRole: PlatformRole | null): WorkspaceNavigationModel {
  const permissions = Array.isArray(access) ? access : getPermissionsForRole(access as OrganizationRole | null);
  const primary: WorkspaceNavigationItem[] = [];
  const actions: WorkspaceNavigationItem[] = [];

  const account: WorkspaceNavigationItem[] = [];
  if (has(permissions, "organization:read")) {
    account.push({
      label: "Azienda e impostazioni",
      href: "/settings",
      activePaths: [
        "/settings",
        "/people/access",
        "/payment-profile",
        "/account/security",
        "/account/notifications",
        "/audit-log",
        "/data-control",
      ],
    });
  } else if (platformRole) {
    account.push({ label: "Account e sicurezza", href: "/account/security" });
  }
  if (platformRole === "SUPPORT_AGENT") account.unshift({ label: "Console supporto", href: "/qoovex-admin" });
  if (platformRole === "PLATFORM_ADMIN") account.unshift({ label: "Console Qoovex", href: "/qoovex-admin" });
  return { primary, actions, account };
}

export function isWorkspaceNavigationItemCurrent(pathname: string, searchParams: Pick<URLSearchParams, "get">, href: string, activePaths?: readonly string[]) {
  const target = new URL(href, "https://workspace.qoovex.local");
  const matchPaths = activePaths?.length ? activePaths : [target.pathname];
  const pathMatches = matchPaths.some((matchPath) => {
    const isExactIndexRoute = matchPath === "/" || matchPath === "/qoovex-admin";
    return pathname === matchPath
      || (!isExactIndexRoute && matchPath !== "/" && pathname.startsWith(`${matchPath}/`));
  });
  return pathMatches && [...target.searchParams].every(([key, value]) => searchParams.get(key) === value);
}

export function canReadWorkspaceNotifications(access: readonly OrganizationPermission[] | OrganizationRole | null) {
  const permissions = Array.isArray(access) ? access : getPermissionsForRole(access as OrganizationRole | null);
  return permissions.includes("organization:read");
}
