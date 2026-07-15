import Link from "next/link";
import type { ReactNode } from "react";
import { AccessError } from "@shared/server/access-errors";
import { getWorkspaceAccessContext, requirePrimaryIdentity } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import { getMfaStatusByUserId } from "@shared/server/mfa-service";
import { getDevAuthSession } from "@shared/server/dev-auth";
import { getUnreadNotificationCount } from "@shared/server/notification-service";
import { AccountSecurityFlow } from "@/views/account-security/AccountSecurityFlow";
import { DevRoleSwitcher } from "./DevRoleSwitcher";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";
import { SupportSessionBanner, WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import styles from "./WorkspaceShell.module.css";

async function getShellState() {
  try {
    const context = await getWorkspaceAccessContext();
    const devSession = await getDevAuthSession();
    const role = getEffectiveOrganizationRole(context);
    const unreadNotificationCount = canReadWorkspaceNotifications(role)
      ? await getUnreadNotificationCount().catch(() => 0)
      : 0;
    return {
      kind: "workspace" as const,
      context,
      devRole: devSession?.role ?? null,
      role,
      navigation: buildWorkspaceNavigation(role, context.platformRole),
      unreadNotificationCount,
    };
  } catch (error) {
    if (error instanceof AccessError && error.code === "MFA_REQUIRED") {
      const identity = await requirePrimaryIdentity();
      const status = await getMfaStatusByUserId(identity.id);
      if (status?.enabled) {
        return {
          kind: "mfa-required" as const,
          platformRole: identity.platformRole,
          status: { ...status, satisfied: false },
        };
      }
    }
    return { kind: "public" as const };
  }
}

export async function WorkspaceShell({ children }: { children: ReactNode }) {
  const shellState = await getShellState();
  const isWorkspace = shellState.kind === "workspace";
  const isMfaRequired = shellState.kind === "mfa-required";
  return (
    <div className={styles.shell}>
      <aside className={styles.index}>
        <div className={styles.brand}>
          <Link href="/dashboard">Qoovex</Link>
          <span>{(isWorkspace ? shellState.context.platformRole : isMfaRequired ? shellState.platformRole : null) === "SUPER_ADMIN" ? "Operatore Qoovex" : "Indice operativo"}</span>
        </div>
        {isMfaRequired ? <nav className={styles.sessionNav} aria-label="Sessione"><WorkspaceLogoutButton /></nav> : (
            <WorkspaceNavigation
              authenticated={isWorkspace}
              navigation={isWorkspace ? shellState.navigation : { primary: [], add: [], account: [] }}
              unreadNotificationCount={isWorkspace ? shellState.unreadNotificationCount : 0}
              platformRole={isWorkspace ? shellState.context.platformRole : null}
              support={isWorkspace ? shellState.context.support : null}
            />
        )}
      </aside>
      {isWorkspace && shellState.devRole && !shellState.context.support ? <DevRoleSwitcher key={shellState.devRole} role={shellState.devRole} /> : null}
      {isWorkspace && shellState.context.support ? <SupportSessionBanner support={shellState.context.support} /> : null}
      <main className={styles.content}>
        {isMfaRequired ? <AccountSecurityFlow initialStatus={shellState.status} mode="gate" /> : children}
      </main>
    </div>
  );
}
