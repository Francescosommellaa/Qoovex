import "server-only";

import { db } from "@qoovex/db";

export interface UpsertWorkspaceUserInput {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  username: string;
  phoneNumber?: string;
  name?: string | null;
  image?: string | null;
}

export async function findUserIdentityByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
    select: { id: true, username: true },
  });
}

export async function findUserIdentityById(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });
}

export async function findUserIdentityByUsername(username: string) {
  return await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
}

export async function findUserIdById(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
}

export async function findWorkspaceUserById(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      usernameOnboarded: true,
      profileOnboarded: true,
      email: true,
      emailVerified: true,
      phoneNumber: true,
      mfaEnabled: true,
      platformRole: true,
      accountRole: true,
      authVersion: true,
      suspendedAt: true,
      suspensionReason: true,
      organizationMemberships: {
        where: { revokedAt: null },
        select: { role: true, organizationId: true, revokedAt: true },
      },
      usernameChangedAt: true,
      avatarBlobPathname: true,
      image: true,
      credential: {
        select: { userId: true },
      },
    },
  });
}

export async function findUserEmailByUsername(username: string) {
  return await db.user.findUnique({
    where: { username },
    select: { email: true },
  });
}

export async function findUserSummaryByIdentifier(identifier: string) {
  const normalized = identifier.trim();

  return await db.user.findFirst({
    where: {
      OR: [{ email: normalized }, { username: normalized }],
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
}

export async function upsertWorkspaceUser(input: UpsertWorkspaceUserInput) {
  return await db.user.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email,
      username: input.username,
      phoneNumber: input.phoneNumber,
      name: input.name ?? null,
      image: input.image ?? null,
    },
    update: {
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email,
      username: input.username,
      ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
    },
  });
}

export async function findUserCredentialState(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      credential: { select: { userId: true } },
    },
  });
}

export async function findUserPasswordHash(userId: string) {
  return await db.userCredential.findUnique({
    where: { userId },
    select: { passwordHash: true },
  });
}

export async function findUserCredentialId(userId: string) {
  return await db.userCredential.findUnique({
    where: { userId },
    select: { userId: true },
  });
}

export async function createUserCredential(input: {
  userId: string;
  passwordHash: string;
}) {
  return await db.userCredential.create({
    data: {
      userId: input.userId,
      passwordHash: input.passwordHash,
    },
    select: { userId: true },
  });
}

export async function updateUserPasswordAndClearSessions(input: {
  userId: string;
  passwordHash: string;
  passwordUpdatedAt: Date;
}) {
  await db.$transaction([
    db.userCredential.update({
      where: { userId: input.userId },
      data: {
        passwordHash: input.passwordHash,
        passwordUpdatedAt: input.passwordUpdatedAt,
        passwordResetRequired: false,
      },
    }),
    db.session.deleteMany({ where: { userId: input.userId } }),
  ]);
}

export async function updateWorkspaceUserByEmail(input: UpsertWorkspaceUserInput) {
  return await db.user.update({
    where: { email: input.email },
    data: {
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      username: input.username,
      ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
    },
  });
}

export async function deleteUserById(userId: string) {
  return await db.user.deleteMany({
    where: { id: userId },
  });
}

export async function updateUserUsernameById(input: {
  userId: string;
  username: string;
  changedAt: Date;
  usernameOnboarded?: boolean;
}) {
  return await db.user.update({
    where: { id: input.userId },
    data: {
      username: input.username,
      ...(input.usernameOnboarded === undefined
        ? {}
        : { usernameOnboarded: input.usernameOnboarded }),
      usernameChangedAt: input.changedAt,
    },
    select: {
      id: true,
      username: true,
      usernameChangedAt: true,
    },
  });
}

export async function updateUserEmailById(input: {
  userId: string;
  email: string;
  verifiedAt: Date;
}) {
  return await db.user.update({
    where: { id: input.userId },
    data: {
      email: input.email,
      emailVerified: input.verifiedAt,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
    },
  });
}

export async function updateUserProfileById(input: {
  userId: string;
  firstName: string;
  lastName?: string | null;
}) {
  return await db.user.update({
    where: { id: input.userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      name: [input.firstName, input.lastName].filter(Boolean).join(" ").trim() || null,
      profileOnboarded: true,
    },
  });
}

export async function updateUserAvatarPathname(input: {
  userId: string;
  avatarBlobPathname: string | null;
}) {
  return await db.user.update({
    where: { id: input.userId },
    data: { avatarBlobPathname: input.avatarBlobPathname },
    select: { avatarBlobPathname: true },
  });
}

export async function findUserAvatarPathname(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: { avatarBlobPathname: true },
  });
}
