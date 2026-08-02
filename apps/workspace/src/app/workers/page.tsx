import Link from "next/link";
import { listWorkers } from "@shared/server/worker-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceEmptyState } from "@/views/workspace/WorkspacePrimitives";
import { buttonVariants } from "@qoovex/ui/components/button";

export default async function WorkersPage() {
  const workers = await listWorkers();
  return <WorkspacePage><WorkspacePageHeader title="Persone operative" description="Profili operativi foundation, distinti dagli account e dalle membership." action={<Link className={buttonVariants()} href="/workers/new">Aggiungi</Link>} />{workers.length ? <WorkspacePanel><ul className="divide-y">{workers.map((worker) => <li className="py-3" key={worker.id}><strong>{worker.displayName}</strong><span className="ml-2 text-sm text-muted-foreground">{worker.roleLabel ?? "Ruolo non indicato"}</span></li>)}</ul></WorkspacePanel> : <WorkspaceEmptyState title="Nessuna persona operativa" description="Aggiungi un profilo quando serve alla foundation aziendale." />}</WorkspacePage>;
}
