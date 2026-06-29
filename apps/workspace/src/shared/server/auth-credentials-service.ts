import "server-only";

import { db } from "@qoovex/db";
import { normalizeUsernameInput, validateUsername } from "@shared/lib/username";
import { hashPassword, validatePasswordPolicy, verifyPassword } from "@shared/server/auth-password";
import { issueAuthCode } from "@shared/server/auth-code-service";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { recordSecurityEvent } from "@shared/server/security-audit-service";
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

function getNameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, " ").trim() || "Utente";
}

export async function registerCredentialsUser(input: {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const username = normalizeUsernameInput(input.username);
  const usernameError = validateUsername(username);
  if (!email || !email.includes("@")) {
    throw new AuthCredentialsError("Inserisci una email valida.");
  }
  if (usernameError) throw new AuthCredentialsError(usernameError);
  validatePasswordPolicy(input.password);

  await assertPersistentRateLimit({
    identifier: email,
    bucket: "auth:signup",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const availability = await getUsernameAvailability({ username });
  if (!availability.available) {
    throw new AuthCredentialsError("Username gia in uso.");
  }

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, credential: { select: { userId: true } } },
  });
  if (existing?.credential) {
    throw new AuthCredentialsError("Account gia esistente. Accedi o recupera la password.");
  }

  const passwordHash = await hashPassword(input.password);
  const firstName = input.firstName?.trim() || getNameFromEmail(email);
  const lastName = input.lastName?.trim() || null;

  const user = await db.$transaction(async (tx) => {
    const record = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            username,
            usernameOnboarded: true,
            firstName,
            lastName,
            name: [firstName, lastName].filter(Boolean).join(" "),
          },
        })
      : await tx.user.create({
          data: {
            email,
            emailVerified: null,
            username,
            usernameOnboarded: true,
            firstName,
            lastName,
            name: [firstName, lastName].filter(Boolean).join(" "),
          },
        });

    await tx.userCredential.create({
      data: {
        userId: record.id,
        passwordHash,
      },
    });

    return record;
  });

  await issueAuthCode({
    email,
    userId: user.id,
    purpose: "EMAIL_VERIFICATION",
    ipHash: input.ipHash,
  });
  await recordSecurityEvent({
    userId: user.id,
    email,
    type: "credentials_signup_created",
    ipHash: input.ipHash,
  });

  return { userId: user.id, email };
}

export async function requestCredentialsSignupEmail(input: {
  email: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw new AuthCredentialsError("Inserisci una email valida.");
  }

  await assertPersistentRateLimit({
    identifier: email,
    bucket: "auth:signup-email",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    await recordSecurityEvent({
      userId: existing.id,
      email,
      type: "credentials_signup_existing_email",
      ipHash: input.ipHash,
    });
    return { email, existing: true };
  }

  await issueAuthCode({
    email,
    purpose: "EMAIL_VERIFICATION",
    ipHash: input.ipHash,
    metadata: { flow: "email_signup" },
  });
  await recordSecurityEvent({
    email,
    type: "credentials_signup_email_requested",
    ipHash: input.ipHash,
  });

  return { email, existing: false };
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
  validatePasswordPolicy(input.password);

  await assertPersistentRateLimit({
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

export async function verifyCredentialsEmail(input: {
  email: string;
  code: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const codeRecord = await import("@shared/server/auth-code-service").then((module) =>
    module.verifyAuthCode({
      email,
      code: input.code,
      purpose: "EMAIL_VERIFICATION",
      ipHash: input.ipHash,
    }),
  );

  const user = await db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
    select: { id: true, email: true },
  });

  await recordSecurityEvent({
    userId: codeRecord.userId ?? user.id,
    email,
    type: "email_verified",
    ipHash: input.ipHash,
  });

  return user;
}

export async function authorizeCredentials(input: {
  identifier: string;
  password: string;
  ipHash?: string | null;
}) {
  const identifier = input.identifier.trim().toLowerCase().replace(/^@/, "");
  await assertPersistentRateLimit({
    identifier,
    bucket: "auth:signin",
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });

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
      credential: {
        select: {
          passwordHash: true,
          passwordResetRequired: true,
        },
      },
    },
  });

  const valid = await verifyPassword(input.password, user?.credential?.passwordHash ?? null);
  if (!user || !valid || user.credential?.passwordResetRequired) {
    await recordSecurityEvent({
      email: identifier.includes("@") ? identifier : null,
      type: "credentials_signin_failed",
      ipHash: input.ipHash,
    });
    return null;
  }

  if (!user.emailVerified) {
    await issueAuthCode({
      email: user.email,
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      ipHash: input.ipHash,
    });
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
  await assertPersistentRateLimit({
    identifier: email,
    bucket: "auth:password-reset-request",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, credential: { select: { userId: true } } },
  });

  if (user?.credential) {
    await issueAuthCode({
      email,
      userId: user.id,
      purpose: "PASSWORD_RESET",
      ipHash: input.ipHash,
    });
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
  validatePasswordPolicy(input.password);

  await import("@shared/server/auth-code-service").then((module) =>
    module.verifyAuthCode({
      email,
      code: input.code,
      purpose: "PASSWORD_RESET",
      ipHash: input.ipHash,
    }),
  );

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
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);

  await recordSecurityEvent({
    userId: user.id,
    email,
    type: "password_reset_completed",
    ipHash: input.ipHash,
  });
}
