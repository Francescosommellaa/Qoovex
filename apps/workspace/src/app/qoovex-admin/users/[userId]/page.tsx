import { AccessError } from "@shared/server/access-errors";
import { getPlatformUserDetail, requireQoovexOperator } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import { PlatformUserActions } from "@/views/platform-admin/PlatformUserActions";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";

export default async function PlatformUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  try {
    const [{ userId }, actor] = await Promise.all([params, requireQoovexOperator()]);
    const user = await getPlatformUserDetail(userId);
    return (
      <WorkspacePage>
        <WorkspacePageHeader title={[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username} description={`${user.email} · @${user.username}`} />
        <WorkspacePanel title="Stato account">
          <div className={styles.stack}>
            <div className={styles.actions}>
              <WorkspaceState label={user.suspendedAt ? "Sospeso" : "Attivo"} tone={user.suspendedAt ? "danger" : "good"} />
              <WorkspaceState label={user.emailVerified ? "Email verificata" : "Email non verificata"} tone={user.emailVerified ? "good" : "warning"} />
              <WorkspaceState label={user.mfaEnabled ? "MFA attiva" : "MFA non attiva"} tone={user.mfaEnabled ? "good" : "neutral"} />
              <WorkspaceState label={`${user._count.sessions} sessioni persistenti`} />
            </div>
            {user.suspensionReason ? <p className={styles.error}>{user.suspensionReason}</p> : null}
            <PlatformUserActions userId={user.id} suspended={Boolean(user.suspendedAt)} protectedAccount={user.id === actor.id || user.platformRole === "SUPPORT_AGENT" || user.platformRole === "PLATFORM_ADMIN"} />
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Membership attive">
          <div className={styles.recordList}>{user.organizationMembership?.revokedAt === null ? <div className={styles.record}><strong>{user.organizationMembership.organization.name}</strong><span className={styles.meta}>{user.organizationMembership.organization.code} · {user.organizationMembership.role}</span></div> : <p className="text-muted-foreground">Nessuna azienda attiva</p>}</div>
        </WorkspacePanel>
        <WorkspacePanel title="Eventi sicurezza recenti">
          <div className={styles.recordList}>{user.securityEvents.map((event) => <div className={styles.record} key={event.id}><strong>{event.type}</strong><span className={styles.meta}>{event.createdAt.toLocaleString("it-IT")}</span></div>)}</div>
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState mfaRequired={error instanceof AccessError && error.status === 403} />;
  }
}
