import Link from "next/link";
import type { ReactNode } from "react";
import { getViewerContext } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import styles from "./WorkspaceShell.module.css";

async function getNavigationRole() {
  try {
    const context = await getViewerContext();
    return getEffectiveOrganizationRole(context);
  } catch {
    return null;
  }
}

export async function WorkspaceShell({ children }: { children: ReactNode }) {
  const role = await getNavigationRole();
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.brand}>
            <Link href="/dashboard">Qoovex</Link>
            <span>Workspace admin</span>
          </div>
          <WorkspaceNavigation role={role} />
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
