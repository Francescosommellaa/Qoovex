"use client";

import * as React from "react";
import { Modal, ModalBody } from "@qoovex/ui";
import { DisplayPreferencesProvider } from "@shared/ui";
import { WorkspaceTopbar } from "@widgets/navbar";
import { WorkspaceSidebar } from "@widgets/sidebar";
import { WorkspaceRoutePrefetcher } from "./workspace-route-prefetcher";
import { WorkspaceRouteTransition } from "./workspace-route-transition";
import { WorkspaceScrollArea } from "./workspace-scroll-area";
import type { WorkspaceShellProps } from "./workspace-shell.types";

export function WorkspaceShell({
  children,
  user,
  nowIso,
}: WorkspaceShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] =
    React.useState(false);

  return (
    <DisplayPreferencesProvider>
      <WorkspaceRoutePrefetcher />
      <div className="flex h-dvh min-h-dvh overflow-hidden bg-(--color-bg) text-(--color-text)">
        <aside className="hidden w-[17.5rem] shrink-0 border-r border-(--color-border) bg-(--color-surface)/94 lg:flex">
          <WorkspaceSidebar user={user} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <WorkspaceTopbar
            nowIso={nowIso}
            onOpenNavigation={() => setMobileNavigationOpen(true)}
          />
          <WorkspaceScrollArea>
            <WorkspaceRouteTransition>{children}</WorkspaceRouteTransition>
          </WorkspaceScrollArea>
        </div>

        <Modal
          open={mobileNavigationOpen}
          onOpenChange={setMobileNavigationOpen}
          placement="left"
          size="sm"
          title="Navigazione"
          scroll="inside"
          showHandle="never"
        >
          <ModalBody padding="none">
            <WorkspaceSidebar
              user={user}
              variant="sheet"
              onNavigate={() => setMobileNavigationOpen(false)}
            />
          </ModalBody>
        </Modal>
      </div>
    </DisplayPreferencesProvider>
  );
}
