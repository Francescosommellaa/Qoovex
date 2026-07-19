import type { WorkspaceRole } from "./workspace-records";

export interface WorkspaceNavigationItem {
  label: string;
  href: string;
}

export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  people: WorkspaceNavigationItem[];
  quickLinks: WorkspaceNavigationItem[];
  add: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
  showAnalytics: boolean;
}

const everydayNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Documenti", href: "/documents" },
    { label: "Calendario", href: "/deadlines" },
    { label: "Cantieri", href: "/job-sites" },
  ],
  ADMIN: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Documenti", href: "/documents" },
    { label: "Calendario", href: "/deadlines" },
    { label: "Cantieri", href: "/job-sites" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Documenti", href: "/documents" },
    { label: "Calendario", href: "/deadlines" },
    { label: "Cantieri", href: "/job-sites" },
  ],
  SITE_MANAGER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Documenti", href: "/documents" },
    { label: "Calendario", href: "/deadlines" },
    { label: "Cantieri", href: "/job-sites" },
  ],
  WORKER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Documenti", href: "/documents" },
    { label: "Calendario", href: "/deadlines" },
    { label: "Cantieri", href: "/job-sites" },
  ],
};

const peopleNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Lavoratori", href: "/workers" },
    { label: "Persone e ruoli", href: "/settings/people" },
    { label: "Accessi operativi", href: "/access" },
  ],
  ADMIN: [
    { label: "Lavoratori", href: "/workers" },
    { label: "Persone e ruoli", href: "/settings/people" },
    { label: "Accessi operativi", href: "/access" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Lavoratori", href: "/workers" },
    { label: "Accessi operativi", href: "/access" },
  ],
  SITE_MANAGER: [],
  WORKER: [],
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

const quickLinkNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Prove", href: "/evidence" },
    { label: "Checklist", href: "/checklists" },
    { label: "Condivisioni", href: "/document-packages" },
    { label: "Accessi operativi", href: "/access" },
  ],
  ADMIN: [
    { label: "Prove", href: "/evidence" },
    { label: "Checklist", href: "/checklists" },
    { label: "Condivisioni", href: "/document-packages" },
    { label: "Accessi operativi", href: "/access" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Prove", href: "/evidence" },
    { label: "Checklist", href: "/checklists" },
    { label: "Condivisioni", href: "/document-packages" },
    { label: "Accessi operativi", href: "/access" },
  ],
  SITE_MANAGER: [
    { label: "Prove", href: "/evidence" },
    { label: "Checklist", href: "/checklists" },
  ],
  WORKER: [
    { label: "Prove", href: "/evidence" },
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
    people: role ? [...peopleNavigation[role]] : [],
    quickLinks: role ? [...quickLinkNavigation[role]] : [],
    add: role ? [...addNavigation[role]] : [],
    account,
    showAnalytics: role === "OWNER" || role === "ADMIN",
  };
}

export function canReadWorkspaceNotifications(role: WorkspaceRole | null) {
  return role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT";
}
