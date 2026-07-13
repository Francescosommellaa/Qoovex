import type { ReactNode } from "react";
import { Badge, EmptyState, Panel } from "@qoovex/ui";
import styles from "./WorkspacePrimitives.module.css";

export function WorkspacePage({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

export function WorkspacePageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export function WorkspacePanel({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <Panel as="section" className={styles.panel}>
      {title ? (
        <div className={styles.panelHeader}>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </Panel>
  );
}

export function WorkspaceEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <EmptyState className={styles.emptyState} description={description} headingLevel={3} title={title} />
  );
}

export function WorkspaceAccessState({ title = "Area non disponibile", description = "Questa sezione non e disponibile per il ruolo corrente." }) {
  return (
    <div className={styles.page}>
      <Panel as="section" className={styles.accessState}>
        <h1>{title}</h1>
        <p>{description}</p>
      </Panel>
    </div>
  );
}

export function WorkspaceStatusBadge({ label, tone = "neutral" }: { label: string; tone?: "danger" | "warning" | "info" | "good" | "neutral" }) {
  const variant = tone === "good" ? "positive" : tone;
  return <Badge variant={variant}>{label}</Badge>;
}
