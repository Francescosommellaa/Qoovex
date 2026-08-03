import Link from "next/link";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { NotificationEmailDigestPanel } from "@/views/admin-core/notifications/NotificationEmailDigestPanel";
import { NotificationEmailPreferencesPanel } from "@/views/admin-core/notifications/NotificationEmailPreferencesPanel";
import styles from "@/views/admin-core/AdminCore.module.css";

export function NotificationSettingsView() {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Notifiche ed email" description="Scegli come ricevere i riepiloghi. Le notifiche operative restano nell'inbox." action={<Link className={styles.ghostButton} href="/notifications">Apri notifiche</Link>} />
      <WorkspacePanel title="Preferenze email" description="Configura il riepilogo automatico e consulta gli invii recenti."><NotificationEmailPreferencesPanel /></WorkspacePanel>
      <WorkspacePanel title="Riepilogo email" description="Controlla l'anteprima e invia un riepilogo a te stesso, senza allegati o link di download."><NotificationEmailDigestPanel /></WorkspacePanel>
    </WorkspacePage>
  );
}
