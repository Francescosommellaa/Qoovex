import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { OrganizationProfileView } from "@/views/settings/OrganizationProfileView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import { getOrganizationProfile } from "@shared/server/organization-profile-service";

export default async function OrganizationProfilePage() {
  try {
    const [data, capabilities] = await Promise.all([getOrganizationProfile(), getWorkspaceCapabilities()]);
    return <OrganizationProfileView canUpdate={capabilities.canUpdateOrganizationProfile} data={serializeForClient(data)} />;
  } catch {
    return <WorkspaceAccessState title="Profilo azienda non disponibile" description="Il profilo non esiste oppure non e accessibile per il ruolo corrente." />;
  }
}
