import type { WorkspaceRole } from "./workspace-records";

export interface WorkspaceNavigationItem {
  label: string;
  href: string;
}

export interface WorkspaceFavoritesModel {
  role: WorkspaceRole | null;
  candidates: WorkspaceNavigationItem[];
  defaultHrefs: string[];
}

export interface WorkspaceNavigationModel {
  primary: WorkspaceNavigationItem[];
  documents: WorkspaceNavigationItem[];
  people: WorkspaceNavigationItem[];
  jobSites: WorkspaceNavigationItem[];
  jobSitesLabel: string;
  favorites: WorkspaceFavoritesModel;
  add: WorkspaceNavigationItem[];
  account: WorkspaceNavigationItem[];
  showAnalytics: boolean;
}

const everydayNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Calendario", href: "/calendar" },
  ],
  ADMIN: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Calendario", href: "/calendar" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Calendario", href: "/calendar" },
  ],
  SITE_MANAGER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Calendario", href: "/calendar" },
  ],
  WORKER: [
    { label: "Da fare", href: "/dashboard" },
    { label: "Calendario", href: "/calendar" },
  ],
};

const jobSiteNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [{ label: "Panoramica", href: "/job-sites" }, { label: "Tutti i cantieri", href: "/job-sites/all" }, { label: "Archivio", href: "/job-sites/archive" }],
  ADMIN: [{ label: "Panoramica", href: "/job-sites" }, { label: "Tutti i cantieri", href: "/job-sites/all" }, { label: "Archivio", href: "/job-sites/archive" }],
  SAFETY_CONSULTANT: [{ label: "Panoramica", href: "/job-sites" }, { label: "Tutti i cantieri", href: "/job-sites/all" }],
  SITE_MANAGER: [{ label: "Panoramica", href: "/job-sites" }, { label: "Elenco assegnato", href: "/job-sites/all" }],
  WORKER: [{ label: "Panoramica", href: "/job-sites" }, { label: "Elenco assegnato", href: "/job-sites/all" }],
};

const documentNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Panoramica", href: "/documents" },
    { label: "Azienda", href: "/documents/company" },
    { label: "Lavoratori", href: "/documents/workers" },
    { label: "Cantieri", href: "/documents/job-sites" },
    { label: "Pacchetti e condivisioni", href: "/document-packages" },
    { label: "Archivio", href: "/documents/archive" },
  ],
  ADMIN: [
    { label: "Panoramica", href: "/documents" },
    { label: "Azienda", href: "/documents/company" },
    { label: "Lavoratori", href: "/documents/workers" },
    { label: "Cantieri", href: "/documents/job-sites" },
    { label: "Pacchetti e condivisioni", href: "/document-packages" },
    { label: "Archivio", href: "/documents/archive" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Panoramica", href: "/documents" },
    { label: "Azienda", href: "/documents/company" },
    { label: "Lavoratori", href: "/documents/workers" },
    { label: "Cantieri", href: "/documents/job-sites" },
    { label: "Pacchetti e condivisioni", href: "/document-packages" },
  ],
  SITE_MANAGER: [
    { label: "Panoramica", href: "/documents" },
    { label: "Cantieri", href: "/documents/job-sites" },
  ],
  WORKER: [
    { label: "Panoramica", href: "/documents" },
    { label: "Lavoratori", href: "/documents/workers" },
  ],
};

const peopleNavigation: Record<WorkspaceRole, readonly WorkspaceNavigationItem[]> = {
  OWNER: [
    { label: "Panoramica", href: "/people" },
    { label: "Lavoratori", href: "/workers" },
    { label: "Accessi", href: "/people/access" },
    { label: "Assegnazioni", href: "/people/assignments" },
  ],
  ADMIN: [
    { label: "Panoramica", href: "/people" },
    { label: "Lavoratori", href: "/workers" },
    { label: "Accessi", href: "/people/access" },
    { label: "Assegnazioni", href: "/people/assignments" },
  ],
  SAFETY_CONSULTANT: [
    { label: "Panoramica", href: "/people" },
    { label: "Lavoratori", href: "/workers" },
    { label: "Assegnazioni", href: "/people/assignments" },
  ],
  SITE_MANAGER: [{ label: "Lavoratori", href: "/workers" }],
  WORKER: [{ label: "Il mio profilo", href: "/workers" }],
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

const favoritesNavigation: Record<WorkspaceRole, {
  candidates: readonly WorkspaceNavigationItem[];
  defaultHrefs: readonly string[];
}> = {
  OWNER: {
    candidates: [
      { label: "Documenti da controllare", href: "/documents?view=attention" },
      { label: "Scadenze", href: "/deadlines" },
      { label: "Checklist aperte", href: "/checklists?view=open" },
      { label: "Prove recenti", href: "/evidence?sort=recent" },
      { label: "Pacchetti pronti", href: "/document-packages?view=ready" },
      { label: "Documenti Azienda", href: "/documents/company?view=attention" },
      { label: "Documenti lavoratori", href: "/documents/workers?view=attention" },
      { label: "Documenti cantieri", href: "/documents/job-sites?view=attention" },
    ],
    defaultHrefs: ["/documents?view=attention", "/deadlines"],
  },
  ADMIN: {
    candidates: [
      { label: "Documenti da controllare", href: "/documents?view=attention" },
      { label: "Scadenze", href: "/deadlines" },
      { label: "Checklist aperte", href: "/checklists?view=open" },
      { label: "Prove recenti", href: "/evidence?sort=recent" },
      { label: "Pacchetti pronti", href: "/document-packages?view=ready" },
      { label: "Documenti Azienda", href: "/documents/company?view=attention" },
      { label: "Documenti lavoratori", href: "/documents/workers?view=attention" },
      { label: "Documenti cantieri", href: "/documents/job-sites?view=attention" },
    ],
    defaultHrefs: ["/documents?view=attention", "/deadlines"],
  },
  SAFETY_CONSULTANT: {
    candidates: [
      { label: "Checklist aperte", href: "/checklists?view=open" },
      { label: "Documenti da controllare", href: "/documents?view=attention" },
      { label: "Scadenze", href: "/deadlines" },
      { label: "Prove recenti", href: "/evidence?sort=recent" },
      { label: "Pacchetti pronti", href: "/document-packages?view=ready" },
      { label: "Documenti lavoratori", href: "/documents/workers?view=attention" },
      { label: "Documenti cantieri", href: "/documents/job-sites?view=attention" },
    ],
    defaultHrefs: ["/checklists?view=open", "/documents?view=attention"],
  },
  SITE_MANAGER: {
    candidates: [
      { label: "Prove recenti", href: "/evidence?sort=recent" },
      { label: "Checklist aperte", href: "/checklists?view=open" },
      { label: "Scadenze", href: "/deadlines" },
      { label: "Documenti da controllare", href: "/documents?view=attention" },
      { label: "Documenti cantieri", href: "/documents/job-sites?view=attention" },
    ],
    defaultHrefs: ["/evidence?sort=recent", "/checklists?view=open"],
  },
  WORKER: {
    candidates: [
      { label: "Prove recenti", href: "/evidence?sort=recent" },
      { label: "Scadenze", href: "/deadlines" },
      { label: "I miei documenti da controllare", href: "/documents?view=attention" },
    ],
    defaultHrefs: ["/evidence?sort=recent", "/deadlines"],
  },
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
    documents: role ? [...documentNavigation[role]] : [],
    people: role ? [...peopleNavigation[role]] : [],
    jobSites: role ? [...jobSiteNavigation[role]] : [],
    jobSitesLabel: role === "SITE_MANAGER" || role === "WORKER" ? "I miei cantieri" : "Cantieri",
    favorites: role
      ? {
          role,
          candidates: [...favoritesNavigation[role].candidates],
          defaultHrefs: [...favoritesNavigation[role].defaultHrefs],
        }
      : { role: null, candidates: [], defaultHrefs: [] },
    add: role ? [...addNavigation[role]] : [],
    account,
    showAnalytics: role === "OWNER" || role === "ADMIN",
  };
}

export function canReadWorkspaceNotifications(role: WorkspaceRole | null) {
  return role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT";
}
