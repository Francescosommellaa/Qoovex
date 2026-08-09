import { redirect } from "next/navigation";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";
import { requireAccountRole } from "@shared/server/account-role-service";
import { AuthPageShell, AuthStage } from "@/views/auth/AuthPageShell";
import { OrganizationSetupForm } from "@/views/auth/OrganizationSetupForm";

export default async function AccountOrganizationPage() {
  const [context] = await Promise.all([
    getWorkspaceAccessContext(),
    requireAccountRole("BUSINESS"),
  ]);
  if (context.company) redirect(`/org/${context.company.organization.id}`);

  return (
    <AuthPageShell
      description={<p>La tua Azienda è il contesto di lavoro unico del tuo account. Potrai poi creare e gestire i cantieri.</p>}
      kicker="Configurazione Azienda"
      title="Crea la tua Azienda"
      titleId="organization-setup-title"
    >
      <AuthStage><OrganizationSetupForm /></AuthStage>
    </AuthPageShell>
  );
}
