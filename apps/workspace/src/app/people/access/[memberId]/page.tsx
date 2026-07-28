import { getAccessResourceOptions, getMemberAccess } from "@shared/server/organization-access-service";
import { serializeForClient } from "@/views/admin-core/admin-core-server";
import { CollaboratorAccessView } from "@/views/people/CollaboratorAccessView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function CollaboratorAccessPage({ params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params;
    const [member, resourceOptions] = await Promise.all([getMemberAccess(memberId), getAccessResourceOptions()]);
    return <CollaboratorAccessView member={serializeForClient(member)} resourceOptions={resourceOptions} />;
  } catch {
    return <WorkspaceAccessState title="Accesso non disponibile" description="Il Collaboratore non esiste, e stato revocato o non puoi modificarne l'accesso." />;
  }
}
