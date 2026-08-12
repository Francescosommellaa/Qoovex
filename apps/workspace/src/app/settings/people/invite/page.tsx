import { CollaboratorInviteForm } from "@/views/foundation/CollaboratorInviteForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
export default function InvitePersonPage() { return <WorkspacePage><WorkspacePageHeader title="Invita un Collaboratore" description="L'invito assegna il ruolo di Collaboratore nell'Azienda." /><WorkspacePanel><CollaboratorInviteForm /></WorkspacePanel></WorkspacePage>; }
