import Link from "next/link";
import { linkVariants } from "@qoovex/ui/components/link";
import type { ReactNode } from "react";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";

export function AdminCreationPage({ title, description, backHref, backLabel, panelTitle, panelDescription, children }: { title: string; description: string; backHref: string; backLabel: string; panelTitle: string; panelDescription: string; children: ReactNode }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title={title} description={description} action={<Link className={linkVariants({ variant: "outline" })} href={backHref}>{backLabel}</Link>} />
      <WorkspacePanel title={panelTitle} description={panelDescription}>{children}</WorkspacePanel>
    </WorkspacePage>
  );
}
