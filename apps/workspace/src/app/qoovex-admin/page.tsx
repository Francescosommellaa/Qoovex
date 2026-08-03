import Link from "next/link";
import { requireIdentity } from "@shared/server/access-context-service";
import { requireQoovexOperatorById } from "@shared/server/qoovex-operator-access";
import { getPlatformAdminOverview } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import { SupportSessionForm } from "@/views/platform-admin/SupportSessionForm";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";

export default async function QoovexAdminPage() {
  try {
    const identity = await requireIdentity();
    const operator = await requireQoovexOperatorById(identity.id);
    if (operator.platformRole === "SUPPORT_AGENT") {
      return (
        <WorkspacePage>
          <WorkspacePageHeader title="Console supporto" description="Apri una sessione temporanea su un'azienda usando il codice comunicato dal cliente e un motivo specifico." />
          <WorkspacePanel title="Nuova sessione supporto" description="La sessione scade dopo 30 minuti e ogni accesso resta auditabile.">
            <SupportSessionForm />
          </WorkspacePanel>
          <WorkspacePanel title="Confini operativi">
            <p className="text-muted-foreground">Il Support Agent non accede alla gestione globale di utenti, aziende, errori o configurazione piattaforma.</p>
          </WorkspacePanel>
        </WorkspacePage>
      );
    }
    const data = await getPlatformAdminOverview();
    const items = [
      ["Utenti", data.users, "/qoovex-admin/users"],
      ["Utenti sospesi", data.suspendedUsers, "/qoovex-admin/users?status=suspended"],
      ["Aziende", data.organizations, "/qoovex-admin/organizations"],
      ["Supporti attivi", data.activeSupportSessions, "/qoovex-admin/organizations"],
      ["Errori aperti", data.openErrors, "/qoovex-admin/errors?status=OPEN"],
      ["Job falliti", data.failedJobs, "/qoovex-admin/errors"],
    ] as const;
    return (
      <WorkspacePage>
        <WorkspacePageHeader title="Console Qoovex" description="Gestione utenti, supporto e stato operativo della piattaforma." />
        <WorkspacePanel title="Panoramica" description={`Aggiornata ${new Date(data.generatedAt).toLocaleString("it-IT")}`}>
          <div className={styles.summaryGrid}>
            {items.map(([label, value, href]) => (
              <Link className={styles.summaryItem} href={href} key={label}>
                <strong>{value}</strong><span>{label}</span>
              </Link>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Confini operativi">
          <p className="text-muted-foreground">Le azioni sugli account richiedono un motivo e sono auditabili. La console non mostra password, token, segreti MFA, riferimenti storage privati o contenuti documentali.</p>
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState />;
  }
}
