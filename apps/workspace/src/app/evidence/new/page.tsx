import { FoundationCreateForm } from "@/views/foundation/FoundationCreateForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
export default function NewEvidencePage() { return <WorkspacePage><WorkspacePageHeader title="Nuova prova" description="Registra una nota o un file privato generico." /><WorkspacePanel><FoundationCreateForm kind="evidence" /></WorkspacePanel></WorkspacePage>; }
