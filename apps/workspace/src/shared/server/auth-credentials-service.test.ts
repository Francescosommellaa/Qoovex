import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userFindFirst: vi.fn(),
  userUpdate: vi.fn(),
  userCreate: vi.fn(),
  credentialCreate: vi.fn(),
  credentialUpdate: vi.fn(),
  rateLimitUpdateMany: vi.fn(),
  sessionDeleteMany: vi.fn(),
  transaction: vi.fn(),
  issueAuthCode: vi.fn(),
  verifyAuthCode: vi.fn(),
  assertPersistentRateLimit: vi.fn(),
  recordSecurityEvent: vi.fn(),
  getUsernameAvailability: vi.fn(),
  hashPassword: vi.fn(),
  validatePasswordPolicy: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/lib/username", () => ({
  normalizeUsernameInput: (value: string) => value.trim().toLowerCase(),
  validateUsername: () => null,
}));
vi.mock("@qoovex/db", () => ({
  db: {
    user: {
      findUnique: mocks.userFindUnique,
      findFirst: mocks.userFindFirst,
      update: mocks.userUpdate,
      create: mocks.userCreate,
    },
    userCredential: {
      create: mocks.credentialCreate,
      update: mocks.credentialUpdate,
    },
    authRateLimit: { updateMany: mocks.rateLimitUpdateMany },
    session: { deleteMany: mocks.sessionDeleteMany },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@shared/server/auth-code-service", () => ({
  issueAuthCode: mocks.issueAuthCode,
  verifyAuthCode: mocks.verifyAuthCode,
}));
vi.mock("@shared/server/rate-limit", () => ({ assertPersistentRateLimit: mocks.assertPersistentRateLimit }));
vi.mock("@shared/server/security-audit-service", () => ({ recordSecurityEvent: mocks.recordSecurityEvent }));
vi.mock("@shared/server/username-service", () => ({ getUsernameAvailability: mocks.getUsernameAvailability }));
vi.mock("@shared/server/auth-password", () => ({
  PasswordValidationError: class PasswordValidationError extends Error {},
  hashPassword: mocks.hashPassword,
  validatePasswordPolicy: mocks.validatePasswordPolicy,
  verifyPassword: mocks.verifyPassword,
}));
vi.mock("@shared/server/transactional-email-service", () => ({
  TransactionalEmailError: class TransactionalEmailError extends Error {},
}));

beforeEach(() => {
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.assertPersistentRateLimit.mockResolvedValue("rate-limit-key");
  mocks.recordSecurityEvent.mockResolvedValue(undefined);
  mocks.getUsernameAvailability.mockResolvedValue({ available: true });
  mocks.hashPassword.mockResolvedValue("hashed-password");
  mocks.validatePasswordPolicy.mockReturnValue(undefined);
  mocks.rateLimitUpdateMany.mockResolvedValue({ count: 1 });
});

describe("credentials lifecycle security", () => {
  it("does not issue a signup code or attach credentials to an existing passwordless account", async () => {
    const { requestCredentialsSignupEmail } = await import("./auth-credentials-service");
    mocks.userFindUnique.mockResolvedValue({
      id: "oauth-user",
      emailVerified: new Date(),
      credential: null,
    });

    await expect(requestCredentialsSignupEmail({ email: "Owner@Example.com" }))
      .resolves.toEqual({ email: "owner@example.com" });

    expect(mocks.issueAuthCode).not.toHaveBeenCalled();
    expect(mocks.credentialCreate).not.toHaveBeenCalled();
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("allows an unverified legacy credentials account to request a new verification code", async () => {
    const { requestCredentialsSignupEmail } = await import("./auth-credentials-service");
    mocks.userFindUnique.mockResolvedValue({
      id: "legacy-user",
      emailVerified: null,
      credential: { userId: "legacy-user" },
    });

    await requestCredentialsSignupEmail({ email: "legacy@example.com", ipHash: "ip" });

    expect(mocks.issueAuthCode).toHaveBeenCalledWith({
      email: "legacy@example.com",
      userId: "legacy-user",
      purpose: "EMAIL_VERIFICATION",
      ipHash: "ip",
      metadata: { flow: "credentials_verification" },
    });
    expect(mocks.credentialCreate).not.toHaveBeenCalled();
  });

  it("does not expose signup eligibility when email delivery fails", async () => {
    const { requestCredentialsSignupEmail } = await import("./auth-credentials-service");
    const { TransactionalEmailError } = await import("@shared/server/transactional-email-service");
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.issueAuthCode.mockRejectedValue(new TransactionalEmailError("Invio email non riuscito."));

    await expect(requestCredentialsSignupEmail({ email: "new@example.com" }))
      .resolves.toEqual({ email: "new@example.com" });

    expect(mocks.recordSecurityEvent).toHaveBeenCalledWith(expect.objectContaining({
      email: "new@example.com",
      type: "credentials_verification_delivery_failed",
    }));
  });

  it("accepts a verified new-email code without creating a user or credential", async () => {
    const { verifyCredentialsSignupEmail } = await import("./auth-credentials-service");
    mocks.verifyAuthCode.mockResolvedValue({
      userId: null,
      metadata: { flow: "credentials_signup" },
    });
    mocks.userFindUnique.mockResolvedValue(null);

    await expect(verifyCredentialsSignupEmail({ email: "new@example.com", code: "123456" }))
      .resolves.toEqual({ email: "new@example.com", next: "complete" });

    expect(mocks.userCreate).not.toHaveBeenCalled();
    expect(mocks.credentialCreate).not.toHaveBeenCalled();
  });

  it("refuses to turn an existing passwordless account into a credentials account", async () => {
    const { AuthCredentialsError, verifyCredentialsSignupEmail } = await import("./auth-credentials-service");
    mocks.verifyAuthCode.mockResolvedValue({ userId: "oauth-user", metadata: null });
    mocks.userFindUnique.mockResolvedValue({
      id: "oauth-user",
      email: "owner@example.com",
      emailVerified: null,
      credential: null,
    });

    await expect(verifyCredentialsSignupEmail({ email: "owner@example.com", code: "123456" }))
      .rejects.toBeInstanceOf(AuthCredentialsError);

    expect(mocks.userUpdate).not.toHaveBeenCalled();
    expect(mocks.credentialCreate).not.toHaveBeenCalled();
  });

  it("marks a legacy credentials account verified only after its bound code succeeds", async () => {
    const { verifyCredentialsSignupEmail } = await import("./auth-credentials-service");
    mocks.verifyAuthCode.mockResolvedValue({ userId: "legacy-user", metadata: null });
    mocks.userFindUnique.mockResolvedValue({
      id: "legacy-user",
      email: "legacy@example.com",
      emailVerified: null,
      credential: { userId: "legacy-user" },
    });

    await expect(verifyCredentialsSignupEmail({ email: "legacy@example.com", code: "123456" }))
      .resolves.toEqual({ email: "legacy@example.com", next: "sign-in" });

    expect(mocks.verifyAuthCode).toHaveBeenCalledBefore(mocks.userUpdate);
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "legacy-user" },
      data: { emailVerified: expect.any(Date) },
    });
  });

  it("rechecks email uniqueness before creating a credential after verification", async () => {
    const { AuthCredentialsError, completeCredentialsSignup } = await import("./auth-credentials-service");
    mocks.userFindUnique.mockResolvedValue({ id: "racing-oauth-user" });

    await expect(completeCredentialsSignup({
      email: "owner@example.com",
      username: "owner",
      password: "Password123!",
    })).rejects.toBeInstanceOf(AuthCredentialsError);

    expect(mocks.hashPassword).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.credentialCreate).not.toHaveBeenCalled();
  });

  it("creates the user and credential atomically after the verified-email gate", async () => {
    const { completeCredentialsSignup } = await import("./auth-credentials-service");
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.transaction.mockImplementation(async (operation: (tx: unknown) => Promise<unknown>) => operation({
      user: { create: mocks.userCreate },
      userCredential: { create: mocks.credentialCreate },
      authRateLimit: { updateMany: mocks.rateLimitUpdateMany },
    }));
    mocks.userCreate.mockResolvedValue({ id: "new-user" });
    mocks.credentialCreate.mockResolvedValue({ userId: "new-user" });

    await expect(completeCredentialsSignup({
      email: "new@example.com",
      username: "new_user",
      password: "Password123!",
    })).resolves.toEqual({ userId: "new-user", email: "new@example.com" });

    expect(mocks.userCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ email: "new@example.com", emailVerified: expect.any(Date) }),
    }));
    expect(mocks.credentialCreate).toHaveBeenCalledWith({
      data: { userId: "new-user", passwordHash: "hashed-password" },
    });
  });

  it("does not send an unusable verification code during failed sign-in", async () => {
    const { authorizeCredentials } = await import("./auth-credentials-service");
    mocks.userFindFirst.mockResolvedValue({
      id: "legacy-user",
      email: "legacy@example.com",
      emailVerified: null,
      name: null,
      image: null,
      suspendedAt: null,
      credential: { passwordHash: "hash", passwordResetRequired: false },
    });
    mocks.verifyPassword.mockResolvedValue(true);

    await expect(authorizeCredentials({ identifier: "legacy@example.com", password: "Password123!" }))
      .resolves.toBeNull();

    expect(mocks.issueAuthCode).not.toHaveBeenCalled();
  });

  it("revokes sessions and increments authVersion when a password reset completes", async () => {
    const { resetPasswordWithCode } = await import("./auth-credentials-service");
    mocks.verifyAuthCode.mockResolvedValue({ userId: "user-1" });
    mocks.userFindUnique.mockResolvedValue({ id: "user-1", credential: { userId: "user-1" } });
    mocks.credentialUpdate.mockReturnValue(Promise.resolve({ userId: "user-1" }));
    mocks.userUpdate.mockReturnValue(Promise.resolve({ id: "user-1" }));
    mocks.sessionDeleteMany.mockReturnValue(Promise.resolve({ count: 2 }));
    mocks.transaction.mockResolvedValue([]);

    await resetPasswordWithCode({
      email: "owner@example.com",
      code: "123456",
      password: "NewPassword123!",
    });

    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { authVersion: { increment: 1 } },
    });
    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("keeps password-reset responses generic when email delivery fails", async () => {
    const { requestPasswordReset } = await import("./auth-credentials-service");
    const { TransactionalEmailError } = await import("@shared/server/transactional-email-service");
    mocks.userFindUnique.mockResolvedValue({ id: "user-1", credential: { userId: "user-1" } });
    mocks.issueAuthCode.mockRejectedValue(new TransactionalEmailError("Invio email non riuscito."));

    await expect(requestPasswordReset({ email: "owner@example.com" })).resolves.toBeUndefined();
    expect(mocks.recordSecurityEvent).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      type: "password_reset_delivery_failed",
    }));
  });
});
