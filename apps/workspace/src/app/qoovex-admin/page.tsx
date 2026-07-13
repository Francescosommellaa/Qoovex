import Link from "next/link";
import { getPlatformAdminOverview } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";

export default async function QoovexAdminPage() {
  try {
    const data = await getPlatformAdminOverview();
    const items = [
      ["Utenti", data.users, "/qoovex-admin/users"],
      ["Utenti sospesi", data.suspendedUsers, "/qoovex-admin/users?status=suspended"],
      ["Aziende", data.organizations, "/qoovex-admin/organizations"],
      ["Supporti attivi", data.activeSupportSessions, "/qoovex-admin/organizations"],
      ["Errori aperti", data.openErrors, "/qoovex-admin/errors?status=OPEN"],
      ["Job falliti", data.failedJobs, "/qoovex-admin/errors"],
      ["Email fallite", data.failedEmails, "/qoovex-admin/errors"],
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
          <p className="qv-text-muted">Le azioni sugli account richiedono un motivo e sono auditabili. La console non mostra password, token, segreti MFA, riferimenti storage privati o contenuti documentali.</p>
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState />;
  }
}
