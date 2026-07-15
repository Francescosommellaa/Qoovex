import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWorkspaceAccessContext: vi.fn(),
  requirePrimaryIdentity: vi.fn(),
  getMfaStatusByUserId: vi.fn(),
  getDevAuthSession: vi.fn(),
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number, public readonly code?: string) {
      super(message);
    }
  },
}));

vi.mock("@shared/server/access-context-service", () => ({
  getWorkspaceAccessContext: mocks.getWorkspaceAccessContext,
  requirePrimaryIdentity: mocks.requirePrimaryIdentity,
}));
vi.mock("@shared/server/access-errors", () => ({ AccessError: mocks.AccessError }));
vi.mock("@shared/server/domain-access-service", () => ({ getEffectiveOrganizationRole: () => null }));
vi.mock("@shared/server/mfa-service", () => ({ getMfaStatusByUserId: mocks.getMfaStatusByUserId }));
vi.mock("@shared/server/dev-auth", () => ({ getDevAuthSession: mocks.getDevAuthSession }));
vi.mock("@shared/server/notification-service", () => ({ getUnreadNotificationCount: vi.fn().mockResolvedValue(0) }));
vi.mock("@/views/account-security/AccountSecurityFlow", () => ({
  AccountSecurityFlow: () => <div>GLOBAL_MFA_GATE</div>,
}));
vi.mock("./WorkspaceNavigation", () => ({ WorkspaceNavigation: () => <nav>NAVIGATION</nav> }));
vi.mock("./DevRoleSwitcher", () => ({ DevRoleSwitcher: ({ role }: { role: string }) => <div>DEV_ROLE_{role}</div> }));
vi.mock("./WorkspaceSessionControls", () => ({
  SupportSessionBanner: () => <div>SUPPORT</div>,
  WorkspaceLogoutButton: () => <button type="button">LOGOUT</button>,
}));

import { WorkspaceShell } from "./WorkspaceShell";

describe("WorkspaceShell MFA gate", () => {
  beforeEach(() => {
    mocks.getWorkspaceAccessContext.mockReset();
    mocks.requirePrimaryIdentity.mockReset();
    mocks.getMfaStatusByUserId.mockReset();
    mocks.getDevAuthSession.mockReset().mockResolvedValue(null);
  });

  it("does not render workspace children for a primary-only MFA session", async () => {
    mocks.getWorkspaceAccessContext.mockRejectedValue(new mocks.AccessError("Conferma MFA richiesta.", 403, "MFA_REQUIRED"));
    mocks.requirePrimaryIdentity.mockResolvedValue({ id: "user-1", platformRole: "USER" });
    mocks.getMfaStatusByUserId.mockResolvedValue({ enabled: true, backupCodesRemaining: 8, totpVerifiedAt: new Date() });

    const html = renderToStaticMarkup(await WorkspaceShell({ children: <div>SENSITIVE_WORKSPACE_CHILD</div> }));

    expect(html).toContain("GLOBAL_MFA_GATE");
    expect(html).toContain("LOGOUT");
    expect(html).not.toContain("SENSITIVE_WORKSPACE_CHILD");
    expect(html).not.toContain("NAVIGATION");
  });

  it("preserves workspace children after the server access context succeeds", async () => {
    mocks.getWorkspaceAccessContext.mockResolvedValue({
      userId: "user-1",
      platformRole: "USER",
      company: null,
      support: null,
      permissions: [],
    });

    const html = renderToStaticMarkup(await WorkspaceShell({ children: <div>WORKSPACE_CHILD</div> }));

    expect(html).toContain("WORKSPACE_CHILD");
    expect(html).toContain("NAVIGATION");
    expect(html).not.toContain("GLOBAL_MFA_GATE");
  });

  it("shows the selected dev role after the server context succeeds", async () => {
    mocks.getWorkspaceAccessContext.mockResolvedValue({
      userId: "dev-user",
      platformRole: "SUPER_ADMIN",
      company: { role: "WORKER", organization: { id: "org-1", name: "Azienda", code: "DEV" } },
      support: null,
      permissions: [],
    });
    mocks.getDevAuthSession.mockResolvedValue({ role: "WORKER" });

    const html = renderToStaticMarkup(await WorkspaceShell({ children: <div>WORKSPACE_CHILD</div> }));

    expect(html).toContain("DEV_ROLE_WORKER");
    expect(html).toContain("WORKSPACE_CHILD");
  });
});
