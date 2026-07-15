import Link from "next/link";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";
import styles from "@/views/admin-core/AdminCore.module.css";

export function SettingsHubView({ capabilities }: { capabilities: WorkspaceCapabilities }) {
  const areas = [
    capabilities.canReadMembers ? { title: "Persone e accessi", description: "Inviti, ruoli, collegamenti e assegnazioni.", href: "/settings/people" } : null,
    capabilities.canReadDocumentSettings ? { title: "Impostazioni documenti", description: "Tipi documento e requisiti documentali.", href: "/settings/documents" } : null,
    capabilities.canReadNotifications ? { title: "Notifiche ed email", description: "Preferenze, riepilogo e invii recenti.", href: "/settings/notifications" } : null,
    { title: "Sicurezza account", description: "MFA, codici di recupero e sessione account.", href: "/account/security" },
    capabilities.canReadAudit ? { title: "Audit", description: "Consulta gli eventi registrati per l'azienda.", href: "/audit-log" } : null,
    capabilities.canReadDataControl ? { title: "Controllo dati", description: "Retention, inventario ed export delle informazioni.", href: "/data-control" } : null,
  ].filter((area): area is { title: string; description: string; href: string } => Boolean(area));

  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Impostazioni" description="Gestisci le configurazioni aziendali senza interrompere il lavoro quotidiano." />
      <WorkspacePanel title="Azienda e account" description="Sono mostrate solo le aree disponibili per il tuo ruolo.">
        <div className={styles.list}>
          {areas.map((area) => (
            <article className={styles.record} key={area.href}>
              <div className={styles.recordMain}><strong>{area.title}</strong><span>{area.description}</span></div>
              <div className={styles.actions}><Link className={styles.linkButton} href={area.href}>Apri</Link></div>
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
