import Link from "next/link";
import type { ReactNode } from "react";
import { getViewerContext } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { SupportSessionBanner } from "./WorkspaceSessionControls";
import styles from "./WorkspaceShell.module.css";

async function getNavigationRole() {
  try {
    const context = await getViewerContext();
    return { context, role: getEffectiveOrganizationRole(context) };
  } catch {
    return null;
  }
}

export async function WorkspaceShell({ children }: { children: ReactNode }) {
  const shellContext = await getNavigationRole();
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.brand}>
            <Link href="/dashboard">Qoovex</Link>
            <span>{shellContext?.context.platformRole === "SUPER_ADMIN" ? "Operatore Qoovex" : "Workspace admin"}</span>
          </div>
          <WorkspaceNavigation
            authenticated={Boolean(shellContext)}
            platformRole={shellContext?.context.platformRole ?? null}
            role={shellContext?.role ?? null}
            support={shellContext?.context.support ?? null}
          />
        </div>
      </header>
      {shellContext?.context.support ? <SupportSessionBanner support={shellContext.context.support} /> : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
