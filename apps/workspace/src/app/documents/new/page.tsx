import { FoundationCreateForm } from "@/views/foundation/FoundationCreateForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
export default function NewDocumentPage() { return <WorkspacePage><WorkspacePageHeader title="Nuovo file" description="Crea metadati e, se selezionata, una versione privata." /><WorkspacePanel><FoundationCreateForm kind="document" /></WorkspacePanel></WorkspacePage>; }
