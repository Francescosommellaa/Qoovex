import type { ReactNode } from "react";
import styles from "./WorkspacePrimitives.module.css";

export function WorkspacePage({ children }: { children: ReactNode }) {
  return <main className={styles.page}>{children}</main>;
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
    <section className={styles.panel}>
      {title ? (
        <div className={styles.panelHeader}>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function WorkspaceEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className={styles.emptyState}>
      <strong>{title}</strong>
      <p>{description}</p>
    </section>
  );
}

export function WorkspaceAccessState({ title = "Area non disponibile", description = "Questa sezione non e disponibile per il ruolo corrente." }) {
  return (
    <main className={styles.page}>
      <section className={styles.accessState}>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  );
}

export function WorkspaceState({ label, tone = "neutral" }: { label: string; tone?: "danger" | "warning" | "info" | "good" | "neutral" }) {
  return <strong className={`${styles.state} ${styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`]}`}>{label}</strong>;
}
