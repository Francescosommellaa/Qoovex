import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { ExportAccessButton } from "@/views/job-site/ExportAccessButton";
export default async function ExportAccessPage({ params }: { params: Promise<{ token: string }> }) { return <WorkspacePage><WorkspacePageHeader title="Archivio Qoovex" description="Il link consente un solo accesso ed è valido per quindici minuti." /><WorkspacePanel title="Archivio autorizzato"><ExportAccessButton token={(await params).token} /></WorkspacePanel></WorkspacePage>; }
