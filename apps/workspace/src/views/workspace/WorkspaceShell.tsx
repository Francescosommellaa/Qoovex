import Link from "next/link";
import type { ReactNode } from "react";
import { IconShieldLock } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@qoovex/ui/components/breadcrumb";
import { Separator } from "@qoovex/ui/components/separator";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@qoovex/ui/components/sidebar";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { AccessError } from "@shared/server/access-errors";
import { getWorkspaceAccessContext, requirePrimaryIdentity } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import { getMfaStatusByUserId } from "@shared/server/mfa-service";
import { getDevAuthSession } from "@shared/server/dev-auth";
import { getUnreadNotificationCount } from "@shared/server/notification-service";
import { WorkspaceBrandMark } from "../../components/workspace-brand-mark";
import { AccountSecurityFlow } from "@/views/account-security/AccountSecurityFlow";
import { DevRoleSwitcher } from "./DevRoleSwitcher";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";
import { SupportSessionBanner, WorkspaceLogoutButton } from "./WorkspaceSessionControls";

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
      if (status?.enabled) return { kind: "mfa-required" as const, platformRole: identity.platformRole, status: { ...status, satisfied: false } };
    }
    return { kind: "public" as const };
  }
}

export async function WorkspaceShell({ children }: { children: ReactNode }) {
  const state = await getShellState();

  if (state.kind === "public") {
    return <div className="min-h-dvh bg-background"><div className="fixed top-3 right-3 z-40"><ThemeToggle /></div><main>{children}</main></div>;
  }

  const isWorkspace = state.kind === "workspace";
  const isSuperAdmin = (isWorkspace ? state.context.platformRole : state.platformRole) === "SUPER_ADMIN";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <nav aria-label="Navigazione workspace" className="contents">
          <SidebarHeader>
            <Link className="rounded-md px-2 py-1" href={isWorkspace ? "/dashboard" : "/account/security"}>
              <WorkspaceBrandMark />
            </Link>
          </SidebarHeader>
          {isWorkspace ? (
            <WorkspaceNavigation
              authenticated
              navigation={state.navigation}
              platformRole={state.context.platformRole}
              support={state.context.support}
              unreadNotificationCount={state.unreadNotificationCount}
            />
          ) : (
            <div className="mt-auto p-3"><WorkspaceLogoutButton /></div>
          )}
        </nav>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl">
          <SidebarTrigger />
          <Separator className="h-4" orientation="vertical" />
          <Breadcrumb className="min-w-0 flex-1"><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>{isWorkspace ? "Area di lavoro" : "Sicurezza account"}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          {isSuperAdmin ? <Badge variant="outline">Operatore Qoovex</Badge> : null}
          {!isWorkspace ? <IconShieldLock aria-hidden="true" /> : null}
          <ThemeToggle />
        </header>

        {isWorkspace && state.devRole && !state.context.support ? <DevRoleSwitcher key={state.devRole} role={state.devRole} /> : null}
        {isWorkspace && state.context.support ? <SupportSessionBanner support={state.context.support} /> : null}
        <main className="min-w-0 flex-1 p-4 md:p-6">
          {isWorkspace ? children : <AccountSecurityFlow initialStatus={state.status} mode="gate" />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
