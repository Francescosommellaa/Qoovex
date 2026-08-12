import { AccessError } from "@shared/server/access-errors";
import { getPlatformUserDetail, requireQoovexOperator } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import { PlatformUserActions } from "@/views/platform-admin/PlatformUserActions";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";
import { presentOrganizationRole, presentSecurityEventType } from "@shared/lib/product-state-presentation";

export default async function PlatformUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  try {
    const [{ userId }, actor] = await Promise.all([params, requireQoovexOperator()]);
    const user = await getPlatformUserDetail(userId);
    const activeMemberships = user.organizationMemberships.filter((membership) => membership.revokedAt === null);
    return (
      <WorkspacePage>
        <WorkspacePageHeader title={[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username} description={`${user.email} · @${user.username}`} />
        <WorkspacePanel title="Stato account">
          <div className={styles.stack}>
            <div className={styles.actions}>
              <WorkspaceState state={{ label: user.suspendedAt ? "Account sospeso" : "Account attivo", tone: user.suspendedAt ? "danger" : "good" }} />
              <WorkspaceState state={{ label: user.emailVerified ? "Email verificata" : "Email non verificata", tone: user.emailVerified ? "good" : "warning" }} />
              <WorkspaceState state={{ label: user.mfaEnabled ? "MFA attiva" : "MFA non attiva", tone: user.mfaEnabled ? "good" : "neutral" }} />
              <WorkspaceState state={{ label: `${user._count.sessions} sessioni persistenti`, tone: "neutral" }} />
            </div>
            {user.suspensionReason ? <p className={styles.error}>{user.suspensionReason}</p> : null}
            <PlatformUserActions userId={user.id} suspended={Boolean(user.suspendedAt)} protectedAccount={user.id === actor.id || user.platformRole === "SUPPORT_AGENT" || user.platformRole === "PLATFORM_ADMIN"} />
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Membership attive">
          <div className={styles.recordList}>{activeMemberships.length ? activeMemberships.map((membership) => <div className={styles.record} key={membership.id}><strong>{membership.organization.name}</strong><span className={styles.meta}>Codice Azienda: {membership.organization.code} · {presentOrganizationRole(membership.role).label}</span></div>) : <p className="text-muted-foreground">Nessuna azienda attiva</p>}</div>
        </WorkspacePanel>
        <WorkspacePanel title="Eventi sicurezza recenti">
          <div className={styles.recordList}>{user.securityEvents.map((event) => <div className={styles.record} key={event.id}><strong>{presentSecurityEventType(event.type).label}</strong><span className={styles.meta}>{event.createdAt.toLocaleString("it-IT")}</span></div>)}</div>
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState mfaRequired={error instanceof AccessError && error.status === 403} />;
  }
}
