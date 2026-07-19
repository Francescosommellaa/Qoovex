import type { WorkspaceNavigationItem } from "./workspace-navigation-policy";

export const RECENT_WORKSPACE_PAGES_STORAGE_KEY = "qoovex.workspace.recent-pages.v1";
export const MAX_RECENT_WORKSPACE_PAGES = 3;

export interface WorkspaceRecentPage {
  href: string;
  label: string;
}

const specificPageLabels = [
  ["/qoovex-admin/organizations", "Aziende"],
  ["/qoovex-admin/users", "Utenti"],
  ["/qoovex-admin/errors", "Errori"],
  ["/documents/new", "Nuovo documento"],
  ["/job-sites/new", "Nuovo cantiere"],
  ["/workers/new", "Nuovo lavoratore"],
  ["/evidence/new", "Nuova prova"],
  ["/checklists/new", "Nuova checklist"],
  ["/document-packages/new", "Nuova condivisione"],
  ["/deadlines/new", "Nuova scadenza"],
  ["/settings/people/invite", "Invita persona"],
  ["/settings/people", "Persone e ruoli"],
  ["/settings/documents", "Tipi di documento"],
  ["/settings/notifications", "Preferenze notifiche"],
  ["/qoovex-admin", "Console Qoovex"],
  ["/account/security", "Sicurezza account"],
  ["/notifications", "Notifiche"],
  ["/document-packages", "Condivisioni"],
  ["/deadlines", "Calendario"],
  ["/checklists", "Checklist"],
  ["/evidence", "Prove"],
  ["/audit-log", "Registro attivita"],
  ["/data-control", "Controllo dati"],
  ["/access", "Accessi operativi"],
  ["/settings", "Impostazioni"],
] as const;

export function resolveWorkspacePageLabel(
  pathname: string,
  navigation: readonly WorkspaceNavigationItem[],
  fallback: string,
) {
  const specific = specificPageLabels.find(([href]) => pathname === href || pathname.startsWith(`${href}/`));
  if (specific) return specific[1];

  const primary = navigation.find(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)),
  );
  return primary?.label ?? fallback;
}

export function pushRecentWorkspacePage(
  pages: readonly WorkspaceRecentPage[],
  current: WorkspaceRecentPage,
) {
  return [...pages.filter((page) => page.href !== current.href), current].slice(-MAX_RECENT_WORKSPACE_PAGES);
}

export function parseRecentWorkspacePages(value: string | null): WorkspaceRecentPage[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (page): page is WorkspaceRecentPage =>
          typeof page === "object" &&
          page !== null &&
          "href" in page &&
          typeof page.href === "string" &&
          page.href.startsWith("/") &&
          !page.href.startsWith("//") &&
          "label" in page &&
          typeof page.label === "string" &&
          page.label.trim().length > 0,
      )
      .slice(-MAX_RECENT_WORKSPACE_PAGES);
  } catch {
    return [];
  }
}
