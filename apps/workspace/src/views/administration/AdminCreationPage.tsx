import Link from "next/link";
import type { ReactNode } from "react";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import styles from "./AdminCore.module.css";

export function AdminCreationPage({ title, description, backHref, backLabel, panelTitle, panelDescription, children }: { title: string; description: string; backHref: string; backLabel: string; panelTitle: string; panelDescription: string; children: ReactNode }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title={title} description={description} action={<Link className={styles.ghostButton} href={backHref}>{backLabel}</Link>} />
      <WorkspacePanel title={panelTitle} description={panelDescription}>{children}</WorkspacePanel>
    </WorkspacePage>
  );
}
