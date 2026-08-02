import { FoundationCreateForm } from "@/views/foundation/FoundationCreateForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
export default function NewJobSitePage() { return <WorkspacePage><WorkspacePageHeader title="Nuovo cantiere" description="Crea il record minimo neutro della foundation." /><WorkspacePanel><FoundationCreateForm kind="job-site" /></WorkspacePanel></WorkspacePage>; }
