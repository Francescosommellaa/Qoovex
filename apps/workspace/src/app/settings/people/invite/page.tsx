import { CollaboratorInviteForm } from "@/views/foundation/CollaboratorInviteForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
export default function InvitePersonPage() { return <WorkspacePage><WorkspacePageHeader title="Invita Collaborator" description="Invito aziendale foundation: OWNER e COLLABORATOR restano gli unici ruoli Azienda." /><WorkspacePanel><CollaboratorInviteForm /></WorkspacePanel></WorkspacePage>; }
