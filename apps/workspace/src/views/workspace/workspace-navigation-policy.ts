import type { WorkspaceRole } from "./workspace-records";

export interface WorkspaceNavigationItem { label: string; href: string; }
export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
}

const packageRoles: readonly WorkspaceRole[] = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"];
const settingsRoles: readonly WorkspaceRole[] = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"];

function primaryNavigation(role: WorkspaceRole): WorkspaceNavigationItem[] {
  return [
    { label: "Centro operativo", href: "/dashboard" },
    { label: "Documenti", href: "/documents" },
    { label: role === "WORKER" ? "Il mio profilo" : "Lavoratori", href: "/workers" },
    { label: role === "SITE_MANAGER" || role === "WORKER" ? "I miei cantieri" : "Cantieri", href: "/job-sites" },
    ...(packageRoles.includes(role) ? [{ label: "Pacchetti", href: "/document-packages" }] : []),
    ...(settingsRoles.includes(role) ? [{ label: "Impostazioni", href: "/settings" }] : []),
  ];
}

export function buildWorkspaceNavigation(role: WorkspaceRole | null, platformRole: "USER" | "SUPER_ADMIN" | null): WorkspaceNavigationModel {
  const account: WorkspaceNavigationItem[] = [];
  if (platformRole) account.push({ label: "Sicurezza", href: "/account/security" });
  if (platformRole === "SUPER_ADMIN") account.unshift({ label: "Console Qoovex", href: "/qoovex-admin" });
  return {
    primary: role ? primaryNavigation(role) : [],
    account,
  };
}

export function canReadWorkspaceNotifications(role: WorkspaceRole | null) {
  return role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT";
}
