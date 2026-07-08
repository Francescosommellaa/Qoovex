import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  registerCredentialsUser: vi.fn(),
  verifyCredentialsEmail: vi.fn(),
  getRequestIpHash: vi.fn(() => "ip-hash"),
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
  registerCredentialsUser: mocks.registerCredentialsUser,
  verifyCredentialsEmail: mocks.verifyCredentialsEmail,
}));
vi.mock("@shared/server/auth-code-service", () => ({
  AuthCodeError: class AuthCodeError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthCodeError";
    }
  },
}));

function jsonRequest(payload: Record<string, unknown>) {
  return new Request("http://local.test", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  mocks.registerCredentialsUser.mockReset();
  mocks.verifyCredentialsEmail.mockReset();
  mocks.getRequestIpHash.mockClear();
  mocks.getRequestIpHash.mockReturnValue("ip-hash");
});

describe("auth entry route handlers", () => {
  it("creates a credentials signup without returning password data", async () => {
    const { POST } = await import("../../app/api/auth/credentials/sign-up/route");
    mocks.registerCredentialsUser.mockResolvedValue({ userId: "user-1", email: "mario@example.com" });

    const response = await POST(jsonRequest({ email: "mario@example.com", username: "mario", password: "Password123!" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ created: true });
    expect(mocks.registerCredentialsUser).toHaveBeenCalledWith({
      email: "mario@example.com",
      username: "mario",
      password: "Password123!",
      ipHash: "ip-hash",
    });
    expect(JSON.stringify(body)).not.toContain("Password123");
  });

  it("returns safe signup errors", async () => {
    const { AuthCredentialsError } = await import("@shared/server/auth-credentials-service");
    const { POST } = await import("../../app/api/auth/credentials/sign-up/route");
    mocks.registerCredentialsUser.mockRejectedValue(new AuthCredentialsError("Inserisci una email valida."));

    const response = await POST(jsonRequest({ email: "", username: "", password: "" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ message: "Inserisci una email valida." });
    expect(JSON.stringify(body)).not.toMatch(/passwordHash|stack|blobKey|tokenHash/);
  });

  it("verifies a credentials email code through the auth service", async () => {
    const { POST } = await import("../../app/api/auth/credentials/verify-email/route");
    mocks.verifyCredentialsEmail.mockResolvedValue({ id: "user-1", email: "mario@example.com" });

    const response = await POST(jsonRequest({ email: "mario@example.com", code: "123456" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ verified: true });
    expect(mocks.verifyCredentialsEmail).toHaveBeenCalledWith({
      email: "mario@example.com",
      code: "123456",
      ipHash: "ip-hash",
    });
  });

  it("returns safe verification errors", async () => {
    const { AuthCodeError } = await import("@shared/server/auth-code-service");
    const { POST } = await import("../../app/api/auth/credentials/verify-email/route");
    mocks.verifyCredentialsEmail.mockRejectedValue(new AuthCodeError("Codice scaduto o non valido."));

    const response = await POST(jsonRequest({ email: "mario@example.com", code: "000000" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ message: "Codice scaduto o non valido." });
    expect(JSON.stringify(body)).not.toMatch(/stack|blobKey|tokenHash|passwordHash/);
  });
});
