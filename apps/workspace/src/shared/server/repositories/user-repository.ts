import "server-only";

import { db } from "@qoovex/db";

export interface UpsertSyncedUserInput {
  clerkId: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
}

export async function findUserIdentityByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
    select: { clerkId: true },
  });
}

export async function findUserIdentityByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerkId },
    select: { id: true, username: true },
  });
}

export async function findUserIdentityByUsername(username: string) {
  return await db.user.findUnique({
    where: { username },
    select: { clerkId: true },
  });
}

export async function findUserIdByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
}

export async function findUserEmailByUsername(username: string) {
  return await db.user.findUnique({
    where: { username },
    select: { email: true },
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
      plan: "FREE",
    },
    update: {
      name: input.name,
      email: input.email,
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
