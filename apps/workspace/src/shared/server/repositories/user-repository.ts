import "server-only";

import { db } from "@qoovex/db";

export interface UpsertSyncedUserInput {
  clerkId: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  imageUrl?: string | null;
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
      name: true,
      username: true,
      email: true,
      phoneNumber: true,
      imageUrl: true,
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
      name: true,
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
      name: input.name,
      email: input.email,
      username: input.username,
      phoneNumber: input.phoneNumber,
      imageUrl: input.imageUrl,
      plan: "FREE",
    },
    update: {
      name: input.name,
      email: input.email,
      username: input.username,
      ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
      imageUrl: input.imageUrl,
    },
  });
}

export async function updateSyncedUserByEmail(input: UpsertSyncedUserInput) {
  return await db.user.update({
    where: { email: input.email },
    data: {
      clerkId: input.clerkId,
      name: input.name,
      username: input.username,
      ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
      imageUrl: input.imageUrl,
    },
  });
}

export async function deleteUserByClerkId(clerkId: string) {
  return await db.user.deleteMany({
    where: { clerkId },
  });
}
