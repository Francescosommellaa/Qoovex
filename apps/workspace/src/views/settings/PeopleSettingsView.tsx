import Link from "next/link";
import type { OrganizationRole } from "@qoovex/types";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import styles from "@/views/admin-core/AdminCore.module.css";

const roleLabels: Record<OrganizationRole, string> = { OWNER: "Proprietario", ADMIN: "Amministratore", SAFETY_CONSULTANT: "Consulente", SITE_MANAGER: "Responsabile cantiere", WORKER: "Lavoratore" };

interface Member { id: string; role: OrganizationRole; user: { email: string; firstName: string | null; lastName: string | null } }
interface Invitation { id: string; email: string; role: Exclude<OrganizationRole, "OWNER">; expiresAt: string | Date }

export function PeopleSettingsView({ members, invitations, canManage }: { members: Member[]; invitations: Invitation[]; canManage: boolean }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Persone e accessi" description="Gestisci chi può entrare nell'azienda e collega le persone ai contesti operativi." action={canManage ? <Link className={styles.linkButton} href="/settings/people/invite">Invita persona</Link> : undefined} />
      <WorkspacePanel title="Persone" description="Il proprietario è il ruolo originario dell'azienda e non si assegna tramite invito.">
        <div className={styles.list}>
          {!members.length ? <WorkspaceEmptyState title="Nessuna persona" description="Le persone con accesso all'azienda appariranno qui." /> : members.map((member) => {
            const name = `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim();
            return <article className={styles.record} key={member.id}><div className={styles.recordMain}><strong>{name || member.user.email}</strong><span>{member.user.email}</span></div><div className={styles.actions}><WorkspaceState label={roleLabels[member.role]} /></div></article>;
          })}
        </div>
      </WorkspacePanel>
      <WorkspacePanel title="Inviti in attesa" description="Gli inviti scaduti o revocati non compaiono in questo elenco.">
        <div className={styles.list}>
          {!invitations.length ? <WorkspaceEmptyState title="Nessun invito in attesa" description="Invita una persona quando deve accedere al workspace." /> : invitations.map((invitation) => <article className={styles.record} key={invitation.id}><div className={styles.recordMain}><strong>{invitation.email}</strong><span>{roleLabels[invitation.role]}</span><small>Scade il {new Date(invitation.expiresAt).toLocaleDateString("it-IT")}</small></div></article>)}
        </div>
      </WorkspacePanel>
      <WorkspacePanel title="Collegamenti e assegnazioni" description="Collega utenti e lavoratori oppure assegna persone ai cantieri."><Link className={styles.ghostButton} href="/access">Apri gestione avanzata</Link></WorkspacePanel>
    </WorkspacePage>
  );
}
