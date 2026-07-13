import "server-only";

import { db } from "@qoovex/db";
import { normalizeUsernameInput, validateUsername } from "@shared/lib/username";
import {
  hashPassword,
  PasswordValidationError,
  validatePasswordPolicy,
  verifyPassword,
} from "@shared/server/auth-password";
import { issueAuthCode, verifyAuthCode } from "@shared/server/auth-code-service";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { recordSecurityEvent } from "@shared/server/security-audit-service";
import { TransactionalEmailError } from "@shared/server/transactional-email-service";
import { getUsernameAvailability } from "@shared/server/username-service";

export class AuthCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthCredentialsError";
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertPasswordPolicy(password: string) {
  try {
    validatePasswordPolicy(password);
  } catch (error) {
    if (error instanceof PasswordValidationError) throw new AuthCredentialsError(error.message);
    throw error;
  }
}

export async function requestCredentialsSignupEmail(input: {
  email: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw new AuthCredentialsError("Inserisci una email valida.");
  }

  const existing = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      emailVerified: true,
      credential: { select: { userId: true } },
    },
  });

  await assertPersistentRateLimit({
    identifier: email,
    bucket: "auth:signup-email",
    limit: 4,
    windowMs: 60 * 60 * 1000,
    userId: existing?.id,
  });

  const canRecoverUnverifiedCredentials = Boolean(existing?.credential && !existing.emailVerified);
  if (existing && !canRecoverUnverifiedCredentials) {
    await recordSecurityEvent({
      userId: existing.id,
      email,
      type: "credentials_signup_existing_email",
      ipHash: input.ipHash,
    });
    return { email };
  }

  try {
    await issueAuthCode({
      email,
      userId: existing?.id,
      purpose: "EMAIL_VERIFICATION",
      ipHash: input.ipHash,
      metadata: { flow: existing ? "credentials_verification" : "credentials_signup" },
    });
  } catch (error) {
    if (!(error instanceof TransactionalEmailError)) throw error;
    await recordSecurityEvent({
      userId: existing?.id,
      email,
      type: "credentials_verification_delivery_failed",
      ipHash: input.ipHash,
    });
  }
  await recordSecurityEvent({
    email,
    type: existing ? "credentials_verification_requested" : "credentials_signup_email_requested",
    ipHash: input.ipHash,
  });

  return { email };
}

export async function completeCredentialsSignup(input: {
  email: string;
  username: string;
  password: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const username = normalizeUsernameInput(input.username);
  const usernameError = validateUsername(username);

  if (!email || !email.includes("@")) {
    throw new AuthCredentialsError("Sessione registrazione non valida.");
  }
  if (usernameError) throw new AuthCredentialsError(usernameError);
  assertPasswordPolicy(input.password);

  const signupRateLimitKey = await assertPersistentRateLimit({
    identifier: email,
    bucket: "auth:signup-complete",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    throw new AuthCredentialsError("Account gia esistente. Accedi o recupera la password.");
  }

  const availability = await getUsernameAvailability({ username });
  if (!availability.available) {
    throw new AuthCredentialsError("Username gia in uso.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await db.$transaction(async (tx) => {
    const record = await tx.user.create({
      data: {
        email,
        emailVerified: new Date(),
        username,
        usernameOnboarded: true,
        profileOnboarded: false,
        firstName: "",
        lastName: null,
        name: null,
      },
    });

    await tx.userCredential.create({
      data: {
        userId: record.id,
        passwordHash,
      },
    });

    await tx.authRateLimit.updateMany({ where: { key: signupRateLimitKey }, data: { userId: record.id } });

    return record;
  });

  await recordSecurityEvent({
    userId: user.id,
    email,
    type: "credentials_signup_completed",
    ipHash: input.ipHash,
  });

  return { userId: user.id, email };
}

export async function verifyCredentialsSignupEmail(input: {
  email: string;
  code: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const codeRecord = await verifyAuthCode({
    email,
    code: input.code,
    purpose: "EMAIL_VERIFICATION",
    ipHash: input.ipHash,
  });

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      credential: { select: { userId: true } },
    },
  });

  if (!user) {
    const metadata = codeRecord.metadata as { flow?: unknown } | null;
    if (codeRecord.userId || metadata?.flow !== "credentials_signup") {
      throw new AuthCredentialsError("Verifica email non valida. Richiedi un nuovo codice.");
    }
    await recordSecurityEvent({
      email,
      type: "credentials_signup_email_verified",
      ipHash: input.ipHash,
    });
    return { email, next: "complete" as const };
  }

  if (user.id !== codeRecord.userId || user.emailVerified || !user.credential) {
    throw new AuthCredentialsError("Account gia esistente. Accedi o recupera la password.");
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await recordSecurityEvent({
    userId: user.id,
    email,
    type: "email_verified",
    ipHash: input.ipHash,
  });

  return { email, next: "sign-in" as const };
}

export async function authorizeCredentials(input: {
  identifier: string;
  password: string;
  ipHash?: string | null;
}) {
  const identifier = input.identifier.trim().toLowerCase().replace(/^@/, "");
  const user = await db.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      suspendedAt: true,
      credential: {
        select: {
          passwordHash: true,
          passwordResetRequired: true,
        },
      },
    },
  });

  await assertPersistentRateLimit({
    identifier,
    bucket: "auth:signin",
    limit: 8,
    windowMs: 15 * 60 * 1000,
    userId: user?.id,
  });

  const valid = await verifyPassword(input.password, user?.credential?.passwordHash ?? null);
  if (!user || !valid || user.suspendedAt || user.credential?.passwordResetRequired) {
    await recordSecurityEvent({
      email: identifier.includes("@") ? identifier : null,
      type: user?.suspendedAt ? "credentials_signin_suspended" : "credentials_signin_failed",
      ipHash: input.ipHash,
    });
    return null;
  }

  if (!user.emailVerified) {
    await recordSecurityEvent({
      userId: user.id,
      email: user.email,
      type: "credentials_signin_unverified",
      ipHash: input.ipHash,
    });
    return null;
  }

  await recordSecurityEvent({
    userId: user.id,
    email: user.email,
    type: "credentials_signin_success",
    ipHash: input.ipHash,
  });

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    image: user.image,
  };
}

export async function requestPasswordReset(input: {
  email: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw new AuthCredentialsError("Inserisci una email valida.");
  }
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, credential: { select: { userId: true } } },
  });

  await assertPersistentRateLimit({
    identifier: email,
    bucket: "auth:password-reset-request",
    limit: 4,
    windowMs: 60 * 60 * 1000,
    userId: user?.id,
  });

  if (user?.credential) {
    try {
      await issueAuthCode({
        email,
        userId: user.id,
        purpose: "PASSWORD_RESET",
        ipHash: input.ipHash,
      });
    } catch (error) {
      if (!(error instanceof TransactionalEmailError)) throw error;
      await recordSecurityEvent({
        userId: user.id,
        email,
        type: "password_reset_delivery_failed",
        ipHash: input.ipHash,
      });
    }
  }

  await recordSecurityEvent({
    userId: user?.id,
    email,
    type: "password_reset_requested",
    ipHash: input.ipHash,
  });
}

export async function resetPasswordWithCode(input: {
  email: string;
  code: string;
  password: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  assertPasswordPolicy(input.password);

  await verifyAuthCode({
    email,
    code: input.code,
    purpose: "PASSWORD_RESET",
    ipHash: input.ipHash,
  });

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, credential: { select: { userId: true } } },
  });
  if (!user?.credential) {
    throw new AuthCredentialsError("Reset password non disponibile.");
  }

  const passwordHash = await hashPassword(input.password);
  await db.$transaction([
    db.userCredential.update({
      where: { userId: user.id },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        passwordResetRequired: false,
      },
    }),
    db.user.update({
      where: { id: user.id },
      data: { authVersion: { increment: 1 } },
    }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);

  await recordSecurityEvent({
    userId: user.id,
    email,
    type: "password_reset_completed",
    ipHash: input.ipHash,
  });
}
