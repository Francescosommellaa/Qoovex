import Link from "next/link";
import { linkVariants } from "@qoovex/ui/components/link";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";
import styles from "@/views/administration/AdminCore.module.css";

export function SettingsHubView({ capabilities }: { capabilities: WorkspaceCapabilities }) {
  const sections = [
    {
      title: "Azienda",
      description: "Dati, persone e configurazioni condivise dell’Azienda.",
      areas: [
        capabilities.canReadOrganizationProfile ? { title: "Profilo azienda", description: "Dati societari, sede, attività e contatti operativi.", href: "/settings/organization-profile" } : null,
        capabilities.canReadMembers ? { title: "Collaboratori e inviti", description: "Account abilitati, accessi e inviti in attesa.", href: "/settings/people" } : null,
        capabilities.role === "OWNER" ? { title: "Profilo pagamento", description: "Intestatario e IBAN usati nelle richieste documentate. La modifica richiede MFA.", href: "/payment-profile" } : null,
      ],
    },
    {
      title: "Account personale",
      description: "Sicurezza e preferenze valide per il tuo account.",
      areas: [
        capabilities.canReadNotifications ? { title: "Preferenze notifiche", description: "Scegli quali aggiornamenti ricevere e con quale frequenza.", href: "/account/notifications" } : null,
        { title: "Sicurezza account", description: "MFA, codici di recupero e sessione account.", href: "/account/security" },
      ],
    },
    {
      title: "Dati e controllo",
      description: "Strumenti amministrativi disponibili soltanto ai ruoli autorizzati.",
      areas: [
        capabilities.canReadAudit ? { title: "Registro attività", description: "Consulta gli eventi registrati per l’Azienda.", href: "/audit-log" } : null,
        capabilities.canReadDataControl ? { title: "Controllo dati", description: "Retention, inventario ed export delle informazioni.", href: "/data-control" } : null,
      ],
    },
  ].map((section) => ({
    ...section,
    areas: section.areas.filter((area): area is { title: string; description: string; href: string } => Boolean(area)),
  })).filter((section) => section.areas.length > 0);

  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Azienda e impostazioni" description="Trova configurazioni aziendali, preferenze personali e strumenti di controllo disponibili per il tuo ruolo." />
      {sections.map((section) => (
        <WorkspacePanel description={section.description} key={section.title} title={section.title}>
          <div className={styles.list}>
            {section.areas.map((area) => (
              <article className={styles.record} key={area.href}>
                <div className={styles.recordMain}><strong>{area.title}</strong><span>{area.description}</span></div>
                <div className={styles.actions}><Link className={linkVariants({ variant: "primary" })} href={area.href}>Apri</Link></div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      ))}
    </WorkspacePage>
  );
}
