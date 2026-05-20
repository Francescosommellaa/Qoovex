import "server-only";

import { db } from "@qoovex/db";

export interface UpsertSyncedUserInput {
  clerkId: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  username: string;
  phoneNumber?: string;
}

export async function findUserIdentityByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
    select: { id: true, clerkId: true, username: true },
  });
}

export async function findUserIdentityByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerkId },
    select: { id: true, email: true, username: true },
  });
}

export async function findUserIdentityByUsername(username: string) {
  return await db.user.findUnique({
    where: { username },
    select: { id: true, clerkId: true },
  });
}

export async function findUserIdByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
}

export async function findWorkspaceUserByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      clerkId: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phoneNumber: true,
      mfaEnabled: true,
      usernameChangedAt: true,
      plan: true,
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
      plan: true,
    },
  });
}

export async function upsertSyncedUser(input: UpsertSyncedUserInput) {
  return await db.user.upsert({
    where: { clerkId: input.clerkId },
    create: {
      clerkId: input.clerkId,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email,
      username: input.username,
      phoneNumber: input.phoneNumber,
      plan: "FREE",
    },
    update: {
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email,
      username: input.username,
      ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
    },
  });
}

export async function updateSyncedUserByEmail(input: UpsertSyncedUserInput) {
  return await db.user.update({
    where: { email: input.email },
    data: {
      clerkId: input.clerkId,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      username: input.username,
      ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
    },
  });
}

export async function deleteUserByClerkId(clerkId: string) {
  return await db.user.deleteMany({
    where: { clerkId },
  });
}

export async function updateUserUsernameByClerkId(input: {
  clerkId: string;
  username: string;
  changedAt: Date;
}) {
  return await db.user.update({
    where: { clerkId: input.clerkId },
    data: {
      username: input.username,
      usernameChangedAt: input.changedAt,
    },
    select: {
      id: true,
      username: true,
      usernameChangedAt: true,
    },
  });
}
