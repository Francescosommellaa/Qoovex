import { FoundationCreateForm } from "@/views/foundation/FoundationCreateForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
export default function NewWorkerPage() { return <WorkspacePage><WorkspacePageHeader title="Nuova persona operativa" description="Crea un profilo Worker neutro; non crea un ruolo account." /><WorkspacePanel><FoundationCreateForm kind="worker" /></WorkspacePanel></WorkspacePage>; }
