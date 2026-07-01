import Link from "next/link";
import type { ReactNode } from "react";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import styles from "./WorkspaceShell.module.css";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.brand}>
            <Link href="/dashboard">Qoovex</Link>
            <span>Workspace admin</span>
          </div>
          <WorkspaceNavigation />
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
