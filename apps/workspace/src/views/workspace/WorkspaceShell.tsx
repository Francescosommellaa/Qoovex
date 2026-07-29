import Link from "next/link";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import {
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@qoovex/ui/components/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@qoovex/ui/lib/sidebar-state";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { AccessError } from "@shared/server/access-errors";
import { getWorkspaceAccessContext, requirePrimaryIdentity } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import { getMfaStatusByUserId } from "@shared/server/mfa-service";
import { getDevAuthSession } from "@shared/server/dev-auth";
import { getUnreadNotificationCount } from "@shared/server/notification-service";
import { listWorkspaceJobSiteNavigation } from "@shared/server/job-site-read-model-service";
import { UniversalSearchDialog } from "@widgets/universal-search/ui/UniversalSearchDialog";
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
    const role = getEffectiveOrganizationRole(context);
    const [unreadNotificationCount, jobSites] = await Promise.all([
      canReadWorkspaceNotifications(context.permissions) ? getUnreadNotificationCount().catch(() => 0) : 0,
      listWorkspaceJobSiteNavigation(context),
    ]);
    return {
      kind: "workspace" as const,
      context,
      devView: devSession?.view ?? null,
      role,
      navigation: buildWorkspaceNavigation(context.permissions, context.platformRole),
      unreadNotificationCount,
      jobSites,
      account: {
        email: identity.email ?? null,
        organizationName: context.support?.organization.name ?? context.company?.organization.name ?? null,
      },
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

  if (state.kind === "public") {
    return <div className="min-h-dvh bg-background"><div className="fixed top-3 right-3 z-40"><ThemeToggle /></div>{children}</div>;
  }

  const isWorkspace = state.kind === "workspace";
  return (
    <WorkspaceSidebarProvider defaultOpen={sidebarDefaultOpen}>
      <WorkspaceSidebarSurface>
        <nav aria-label="Navigazione workspace" className="contents">
          <SidebarHeader className="pb-0 pt-[max(0.5rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-1">
              <Link
                aria-label="Qoovex, vai alla panoramica"
                className="flex h-10 min-w-0 flex-1 items-center rounded-md px-2 text-lg font-semibold tracking-tight text-sidebar-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
                href={isWorkspace && (state.context.platformRole === "SUPPORT_AGENT" || state.context.platformRole === "PLATFORM_ADMIN") && !state.context.support ? "/qoovex-admin" : isWorkspace ? "/dashboard" : "/account/security"}
              >
                Qoovex
              </Link>
              {isWorkspace && state.navigation.searchEnabled ? (
                <SidebarMenu className="w-auto shrink-0"><SidebarMenuItem><UniversalSearchDialog iconOnly /></SidebarMenuItem></SidebarMenu>
              ) : null}
              <SidebarTrigger aria-label="Chiudi navigazione" className="md:hidden" />
            </div>
          </SidebarHeader>
          {isWorkspace ? (
            <WorkspaceNavigation
              account={state.account}
              authenticated
              jobSites={state.jobSites}
              navigation={state.navigation}
              platformRole={state.context.platformRole}
              support={state.context.support}
            />
          ) : (
            <div className="mt-auto p-3"><WorkspaceLogoutButton /></div>
          )}
        </nav>
        <WorkspaceSidebarResizeHandle />
      </WorkspaceSidebarSurface>

      <SidebarInset className="h-dvh min-h-0 min-w-0 overflow-hidden">
        <WorkspacePageIdentityProvider>
          <WorkspaceTopbar
            fallbackLabel={isWorkspace ? "Area di lavoro" : "Sicurezza account"}
            platformRole={isWorkspace ? state.context.platformRole : state.platformRole}
            devView={isWorkspace ? state.devView : null}
            navigation={isWorkspace ? state.navigation.primary : []}
            showNotifications={isWorkspace && canReadWorkspaceNotifications(state.context.permissions)}
            unreadNotificationCount={isWorkspace ? state.unreadNotificationCount : 0}
          />

          {isWorkspace && state.context.support ? <SupportSessionBanner support={state.context.support} /> : null}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            {isWorkspace ? children : <AccountSecurityFlow initialStatus={state.status} mode="gate" />}
          </main>
        </WorkspacePageIdentityProvider>
      </SidebarInset>
    </WorkspaceSidebarProvider>
  );
}
