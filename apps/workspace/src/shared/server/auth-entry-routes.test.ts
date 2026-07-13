import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requestCredentialsSignupEmail: vi.fn(),
  verifyCredentialsSignupEmail: vi.fn(),
  completeCredentialsSignup: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPasswordWithCode: vi.fn(),
  getRequestIpHash: vi.fn(() => "ip-hash"),
  getVerifiedSignupEmailFromCookie: vi.fn(),
  setVerifiedSignupEmailCookie: vi.fn(),
  clearVerifiedSignupEmailCookie: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/security-audit-service", () => ({ getRequestIpHash: mocks.getRequestIpHash }));
vi.mock("@shared/server/auth-credentials-service", () => ({
  AuthCredentialsError: class AuthCredentialsError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthCredentialsError";
    }
  },
  requestCredentialsSignupEmail: mocks.requestCredentialsSignupEmail,
  verifyCredentialsSignupEmail: mocks.verifyCredentialsSignupEmail,
  completeCredentialsSignup: mocks.completeCredentialsSignup,
  requestPasswordReset: mocks.requestPasswordReset,
  resetPasswordWithCode: mocks.resetPasswordWithCode,
}));
vi.mock("@shared/server/auth-code-service", () => ({
  AuthCodeError: class AuthCodeError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthCodeError";
    }
  },
}));
vi.mock("@shared/server/signup-session-service", () => ({
  SignupSessionError: class SignupSessionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "SignupSessionError";
    }
  },
  getVerifiedSignupEmailFromCookie: mocks.getVerifiedSignupEmailFromCookie,
  setVerifiedSignupEmailCookie: mocks.setVerifiedSignupEmailCookie,
  clearVerifiedSignupEmailCookie: mocks.clearVerifiedSignupEmailCookie,
}));

function jsonRequest(payload: Record<string, unknown>) {
  return new Request("http://local.test", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.getRequestIpHash.mockReturnValue("ip-hash");
  mocks.getVerifiedSignupEmailFromCookie.mockResolvedValue(null);
});

describe("auth entry route handlers", () => {
  it("requests email verification before accepting account credentials", async () => {
    const { POST } = await import("../../app/api/auth/credentials/sign-up/route");
    const response = await POST(jsonRequest({
      email: "mario@example.com",
      username: "ignored",
      password: "NeverForwardThis123!",
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ requested: true });
    expect(mocks.requestCredentialsSignupEmail).toHaveBeenCalledWith({
      email: "mario@example.com",
      ipHash: "ip-hash",
    });
    expect(mocks.completeCredentialsSignup).not.toHaveBeenCalled();
    expect(mocks.clearVerifiedSignupEmailCookie).toHaveBeenCalledOnce();
  });

  it("returns safe signup request errors", async () => {
    const { AuthCredentialsError } = await import("@shared/server/auth-credentials-service");
    const { POST } = await import("../../app/api/auth/credentials/sign-up/route");
    mocks.requestCredentialsSignupEmail.mockRejectedValue(new AuthCredentialsError("Inserisci una email valida."));

    const response = await POST(jsonRequest({ email: "" }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ message: "Inserisci una email valida." });
  });

  it("sets a signed signup session only for a new verified email", async () => {
    const { POST } = await import("../../app/api/auth/credentials/verify-email/route");
    mocks.verifyCredentialsSignupEmail.mockResolvedValue({ email: "mario@example.com", next: "complete" });

    const response = await POST(jsonRequest({ email: "mario@example.com", code: "123456" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ verified: true, next: "complete" });
    expect(mocks.setVerifiedSignupEmailCookie).toHaveBeenCalledWith("mario@example.com");
    expect(mocks.clearVerifiedSignupEmailCookie).not.toHaveBeenCalled();
  });

  it("routes a verified legacy credentials account to sign-in without a signup session", async () => {
    const { POST } = await import("../../app/api/auth/credentials/verify-email/route");
    mocks.verifyCredentialsSignupEmail.mockResolvedValue({ email: "mario@example.com", next: "sign-in" });

    const response = await POST(jsonRequest({ email: "mario@example.com", code: "123456" }));

    expect(await response.json()).toEqual({ verified: true, next: "sign-in" });
    expect(mocks.clearVerifiedSignupEmailCookie).toHaveBeenCalledOnce();
    expect(mocks.setVerifiedSignupEmailCookie).not.toHaveBeenCalled();
  });

  it("does not create a credential without the signed verified-email session", async () => {
    const { POST } = await import("../../app/api/auth/credentials/sign-up/complete/route");
    const response = await POST(jsonRequest({ username: "mario", password: "Password123!" }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ message: "Verifica email scaduta. Richiedi un nuovo codice." });
    expect(mocks.completeCredentialsSignup).not.toHaveBeenCalled();
  });

  it("creates credentials only for the email bound to the signed signup session", async () => {
    const { POST } = await import("../../app/api/auth/credentials/sign-up/complete/route");
    mocks.getVerifiedSignupEmailFromCookie.mockResolvedValue("owner@example.com");

    const response = await POST(jsonRequest({
      email: "attacker@example.com",
      username: "owner",
      password: "Password123!",
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ created: true, email: "owner@example.com" });
    expect(mocks.completeCredentialsSignup).toHaveBeenCalledWith({
      email: "owner@example.com",
      username: "owner",
      password: "Password123!",
      ipHash: "ip-hash",
    });
    expect(mocks.clearVerifiedSignupEmailCookie).toHaveBeenCalledOnce();
  });

  it("keeps password-reset requests enumeration-safe", async () => {
    const { POST } = await import("../../app/api/auth/credentials/password-reset/request/route");
    const response = await POST(jsonRequest({ email: "unknown@example.com" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ requested: true });
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
      email: "unknown@example.com",
      ipHash: "ip-hash",
    });
  });

  it("confirms password reset without returning credential data", async () => {
    const { POST } = await import("../../app/api/auth/credentials/password-reset/confirm/route");
    const response = await POST(jsonRequest({
      email: "mario@example.com",
      code: "123456",
      password: "Password123!",
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ reset: true });
    expect(JSON.stringify(body)).not.toMatch(/password|token|hash/i);
    expect(mocks.resetPasswordWithCode).toHaveBeenCalledWith({
      email: "mario@example.com",
      code: "123456",
      password: "Password123!",
      ipHash: "ip-hash",
    });
  });
});
