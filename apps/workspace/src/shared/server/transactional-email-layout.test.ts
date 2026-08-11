import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildEmailContent, renderEmail } from "./transactional-email-service";
import { getTransactionalEmailLogoUrl, renderTransactionalEmailLayout } from "./email/transactional-email-layout";

describe("transactional email layout", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_URL", "https://app.qoovex.com/auth/");
  });

  it("uses workspace brand assets and semantic tokens in the shell", () => {
    const rendered = renderTransactionalEmailLayout({
      title: "Verifica email",
      intro: "Usa questo codice per continuare.",
      preheader: "Codice monouso per verificare la tua email.",
      code: "123456",
      secondaryNote: "Il codice scade tra 10 minuti.",
    });

    expect(getTransactionalEmailLogoUrl()).toBe("https://app.qoovex.com/brand/qoovex-workspace-icon.svg");
    expect(rendered.html).toContain("https://app.qoovex.com/brand/qoovex-workspace-icon.svg");
    expect(rendered.html).toContain("Workspace");
    expect(rendered.html).toContain("Codice monouso");
    expect(rendered.html).toContain("123456");
    expect(rendered.html).toContain('background:#000000');
    expect(rendered.html).toContain('background:#242424');
    expect(rendered.html).not.toContain("#7dd3fc");
    expect(rendered.text).toContain("Codice monouso: 123456");
  });

  it("renders primary actions instead of raw URLs in intro copy", () => {
    const rendered = renderEmail({
      template: {
        kind: "organization-invitation",
        organizationName: "Azienda Demo",
        role: "COLLABORATOR",
        acceptUrl: "https://app.qoovex.com/invite?token=abc",
        expiresAt: new Date("2026-07-20T10:00:00.000Z"),
      },
    });

    expect(rendered.html).toContain("Accetta invito");
    expect(rendered.html).toContain('href="https://app.qoovex.com/invite?token=abc"');
    expect(rendered.html).not.toContain("Apri https://app.qoovex.com/invite?token=abc");
    expect(rendered.text).toContain("Accetta invito: https://app.qoovex.com/invite?token=abc");
  });

  it("includes notification cards and outline CTA for digest emails", () => {
    const content = buildEmailContent({
      kind: "notification-digest",
      unreadCount: 2,
      items: [{
        title: "Nuovo documento",
        message: "Controlla l'aggiornamento condiviso.",
        severity: "WARNING",
        createdAt: new Date("2026-07-20T10:00:00.000Z"),
      }],
      notificationsUrl: "https://app.qoovex.com/org/demo/notifications",
    });
    const rendered = renderTransactionalEmailLayout(content.layout);

    expect(content.layout.notificationItems).toHaveLength(1);
    expect(rendered.html).toContain("Nuovo documento");
    expect(rendered.html).toContain("Priorita alta");
    expect(rendered.html).toContain("Apri le notifiche nel workspace");
    expect(rendered.text).toContain("Notifiche: https://app.qoovex.com/org/demo/notifications");
  });
});
