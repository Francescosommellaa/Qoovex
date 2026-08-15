import Image from "next/image";
import workspaceIconLight from "@qoovex/brand-resources/qoovex-marketing-icon/qoovex-icona-nera-no-sfondo.svg";
import workspaceIconDark from "@qoovex/brand-resources/qoovex-worckspace-icon/qoovex-icona-bianca-no-sfondo.svg";
import Link from "next/link";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { SidebarHeader, SidebarInset, SidebarTrigger } from "@qoovex/ui/components/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@qoovex/ui/lib/sidebar-state";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { AccessError } from "@shared/server/access-errors";
import { getWorkspaceAccessContext, requirePrimaryIdentity } from "@shared/server/access-context-service";
import { getMfaStatusByUserId } from "@shared/server/mfa-service";
import { getDevAuthSession } from "@shared/server/dev-auth";
import { getUnreadNotificationCount } from "@shared/server/notification-service";
import { AccountSecurityFlow } from "@/views/account-security/AccountSecurityFlow";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { WorkspaceSidebarProvider, WorkspaceSidebarResizeHandle, WorkspaceSidebarSurface } from "./WorkspaceSidebarFrame";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";
import { SupportSessionBanner, WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import { WorkspaceTopbar } from "./WorkspaceTopbar";
import { WorkspacePageIdentityProvider } from "./WorkspacePageIdentity";

async function getShellState() {
  try {
    const context = await getWorkspaceAccessContext();
    const [devSession, identity] = await Promise.all([getDevAuthSession(), requirePrimaryIdentity()]);
    return {
      kind: "workspace" as const,
      context,
      devView: devSession?.view ?? null,
      navigation: buildWorkspaceNavigation(context.permissions, context.platformRole),
      unreadNotificationCount: canReadWorkspaceNotifications(context.permissions) ? await getUnreadNotificationCount().catch(() => 0) : 0,
      account: { email: identity.email ?? null, organizationName: context.support?.organization.name ?? context.company?.organization.name ?? null },
    };
  } catch (error) {
    if (error instanceof AccessError && error.code === "MFA_REQUIRED") {
      const identity = await requirePrimaryIdentity();
      const status = await getMfaStatusByUserId(identity.id);
      if (status?.enabled) return { kind: "mfa-required" as const, platformRole: identity.platformRole, status: { ...status, satisfied: false } };
    }
    return { kind: "public" as const };
  }
}

export async function WorkspaceShell({ children }: { children: ReactNode }) {
  const state = await getShellState();
  const sidebarDefaultOpen = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value !== "false";
  if (state.kind === "public") return <div className="min-h-dvh bg-background"><div className="fixed right-[max(.75rem,var(--safe-area-right))] top-[max(.75rem,var(--safe-area-top))] z-40"><ThemeToggle /></div>{children}</div>;
  const isWorkspace = state.kind === "workspace";
  return (
    <WorkspaceSidebarProvider defaultOpen={sidebarDefaultOpen}>
      <a
        className="pointer-events-none fixed left-[max(.75rem,var(--safe-area-left))] top-[max(.75rem,var(--safe-area-top))] z-[60] max-w-[calc(100vw-1.5rem-var(--safe-area-left)-var(--safe-area-right))] -translate-y-16 rounded-lg border border-transparent bg-background px-3 py-2 text-sm font-medium text-foreground opacity-0 shadow-lg outline-none transition-[transform,opacity] focus:pointer-events-auto focus:translate-y-0 focus:opacity-100 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:left-[max(1rem,var(--safe-area-left))] sm:top-[max(1rem,var(--safe-area-top))]"
        href="#workspace-main-content"
      >
        Vai al contenuto principale
      </a>
      <WorkspaceSidebarSurface>
        <nav aria-label="Navigazione workspace" className="contents">
          <SidebarHeader className="h-14 flex-row items-center justify-between border-b px-4 py-0 gap-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
            <Link className="flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden text-lg font-bold tracking-tight group-data-[collapsible=icon]:flex-initial group-data-[collapsible=icon]:justify-center" href={isWorkspace ? "/" : "/account/security"}>
              <span className="truncate group-data-[collapsible=icon]:hidden font-sans text-lg font-bold tracking-tight">Qoovex</span>
              <span className="hidden group-data-[collapsible=icon]:inline-flex size-7 shrink-0 items-center justify-center">
                <Image
                  alt="Qoovex"
                  aria-hidden="true"
                  className="size-6 object-contain dark:hidden"
                  height={24}
                  loading="eager"
                  src={workspaceIconLight}
                  unoptimized
                  width={24}
                />
                <Image
                  alt="Qoovex"
                  aria-hidden="true"
                  className="hidden size-6 object-contain dark:block"
                  height={24}
                  loading="eager"
                  src={workspaceIconDark}
                  unoptimized
                  width={24}
                />
              </span>
            </Link>
            <SidebarTrigger className="md:hidden" />
          </SidebarHeader>
          {isWorkspace ? <WorkspaceNavigation account={state.account} authenticated navigation={state.navigation} platformRole={state.context.platformRole} support={state.context.support} /> : <div className="mt-auto p-3"><WorkspaceLogoutButton /></div>}
        </nav>
        <WorkspaceSidebarResizeHandle />
      </WorkspaceSidebarSurface>
      <SidebarInset as="div" className="h-dvh min-h-0 min-w-0 overflow-hidden">
        <WorkspacePageIdentityProvider>
          <WorkspaceTopbar fallbackLabel={isWorkspace ? "Qoovex" : "Sicurezza account"} platformRole={isWorkspace ? state.context.platformRole : state.platformRole} devView={isWorkspace ? state.devView : null} navigation={isWorkspace ? state.navigation.primary : []} showNotifications={isWorkspace && canReadWorkspaceNotifications(state.context.permissions)} unreadNotificationCount={isWorkspace ? state.unreadNotificationCount : 0} />
          {isWorkspace && state.context.support ? <SupportSessionBanner support={state.context.support} /> : null}
          <main
            className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-4 md:p-6"
            id="workspace-main-content"
            tabIndex={-1}
          >
            {isWorkspace ? children : <AccountSecurityFlow initialStatus={state.status} mode="gate" />}
          </main>
        </WorkspacePageIdentityProvider>
      </SidebarInset>
    </WorkspaceSidebarProvider>
  );
}
