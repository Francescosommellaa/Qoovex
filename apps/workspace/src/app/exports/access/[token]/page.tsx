import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { ExportAccessButton } from "@/views/vnext/ExportAccessButton";
export default async function ExportAccessPage({ params }: { params: Promise<{ token: string }> }) { return <WorkspacePage><WorkspacePageHeader title="Export Qoovex" description="Il link autenticato viene scambiato con un grant monouso valido quindici minuti." /><WorkspacePanel title="Archivio autorizzato"><ExportAccessButton token={(await params).token} /></WorkspacePanel></WorkspacePage>; }
