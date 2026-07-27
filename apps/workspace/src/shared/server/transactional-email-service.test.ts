import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sendTransactionalEmail, TransactionalEmailError } from "./transactional-email-service";

describe("transactional email delivery", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "test" };
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.QOOVEX_E2E_MODE;
    delete process.env.QOOVEX_E2E_EMAIL_SINK_URL;
    delete process.env.QOOVEX_E2E_EMAIL_SINK_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fails closed without Resend and never logs recipient, OTP or body", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendTransactionalEmail({
      to: "secret-recipient@example.test",
      template: { kind: "auth-code", purpose: "EMAIL_VERIFICATION", code: "123456" },
    })).rejects.toBeInstanceOf(TransactionalEmailError);

    expect(consoleInfo).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses only an authenticated loopback sink in explicit E2E mode", async () => {
    process.env.QOOVEX_E2E_MODE = "1";
    process.env.QOOVEX_E2E_EMAIL_SINK_URL = "http://127.0.0.1:43119/messages";
    process.env.QOOVEX_E2E_EMAIL_SINK_SECRET = "ephemeral-test-secret";
    process.env.RESEND_API_KEY = "configured-provider-key";
    process.env.RESEND_FROM_EMAIL = "Qoovex <noreply@example.test>";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ id: "sink-1" }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendTransactionalEmail({
      to: "fixture@example.test",
      template: { kind: "auth-code", purpose: "MFA_ENROLLMENT", code: "654321" },
    })).resolves.toEqual({ providerMessageId: "sink-1" });

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:43119/messages", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer ephemeral-test-secret" }),
    }));
  });

  it("rejects a non-loopback E2E sink", async () => {
    process.env.QOOVEX_E2E_MODE = "1";
    process.env.QOOVEX_E2E_EMAIL_SINK_URL = "https://example.test/messages";
    process.env.QOOVEX_E2E_EMAIL_SINK_SECRET = "ephemeral-test-secret";

    await expect(sendTransactionalEmail({
      to: "fixture@example.test",
      template: { kind: "auth-code", purpose: "PASSWORD_RESET", code: "987654" },
    })).rejects.toThrow("Email sink E2E non consentito.");
  });
});
