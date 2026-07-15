import type { WorkspaceRole } from "./workspace-records";

export interface WorkspaceNavigationItem {
  label: string;
  href: string;
}

export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  add: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
}

const everydayNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Cantieri", href: "/job-sites" },
    { label: "Lavoratori", href: "/workers" },
    { label: "Documenti", href: "/documents" },
  ],
  ADMIN: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Cantieri", href: "/job-sites" },
    { label: "Lavoratori", href: "/workers" },
    { label: "Documenti", href: "/documents" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Cantieri", href: "/job-sites" },
    { label: "Lavoratori", href: "/workers" },
    { label: "Documenti", href: "/documents" },
  ],
  SITE_MANAGER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Cantieri", href: "/job-sites" },
    { label: "Documenti", href: "/documents" },
  ],
  WORKER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Cantieri", href: "/job-sites" },
    { label: "Documenti", href: "/documents" },
  ],
};

const addNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Documento", href: "/documents/new" },
    { label: "Cantiere", href: "/job-sites/new" },
    { label: "Lavoratore", href: "/workers/new" },
    { label: "Prova", href: "/evidence/new" },
  ],
  ADMIN: [
    { label: "Documento", href: "/documents/new" },
    { label: "Cantiere", href: "/job-sites/new" },
    { label: "Lavoratore", href: "/workers/new" },
    { label: "Prova", href: "/evidence/new" },
  ],
  SAFETY_CONSULTANT: [
    { label: "File a un documento", href: "/documents?intent=upload" },
    { label: "Checklist", href: "/checklists/new" },
    { label: "Prova", href: "/evidence/new" },
    { label: "Condivisione", href: "/document-packages/new" },
  ],
  SITE_MANAGER: [{ label: "Prova", href: "/evidence/new" }],
  WORKER: [
    { label: "File a un documento", href: "/documents?intent=upload" },
    { label: "Prova", href: "/evidence/new" },
  ],
};

export function buildWorkspaceNavigation(role: WorkspaceRole | null, platformRole: "USER" | "SUPER_ADMIN" | null): WorkspaceNavigationModel {
  const account: WorkspaceNavigationItem[] = [];
  if (role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT") {
    account.push({ label: "Impostazioni", href: "/settings" });
  }
  if (platformRole) account.push({ label: "Sicurezza", href: "/account/security" });
  if (platformRole === "SUPER_ADMIN") account.unshift({ label: "Console Qoovex", href: "/qoovex-admin" });

  return {
    primary: role ? [...everydayNavigation[role]] : [],
    add: role ? [...addNavigation[role]] : [],
    account,
  };
}

export function canReadWorkspaceNotifications(role: WorkspaceRole | null) {
  return role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT";
}
