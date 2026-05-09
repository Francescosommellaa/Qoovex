import "server-only";

import {
  deleteUserByClerkId,
  findUserIdByClerkId,
  findUserIdentityByClerkId,
  findUserIdentityByEmail,
  findUserIdentityByUsername,
  upsertSyncedUser,
} from "@shared/server/repositories/user-repository";

interface SyncClerkUserInput {
  clerkId: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
}

export class ClerkUserSyncConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClerkUserSyncConflictError";
  }
}

export function normalizePhoneNumber(
  phoneNumber?: string | null,
): string | undefined {
  if (!phoneNumber) return undefined;

  const trimmed = phoneNumber.trim();
  if (!trimmed) return undefined;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return undefined;

  return hasPlus ? `+${digits}` : digits;
}

function normalizeUsername(username: string): string {
  const normalized = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32);

  return normalized.length >= 3 ? normalized : "";
}

function getStableFallbackUsername(clerkId: string): string {
  return `user_${clerkId.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toLowerCase()}`;
}

function getDisplayName(input: SyncClerkUserInput, username: string): string {
  return (
    [input.firstName, input.lastName].filter(Boolean).join(" ").trim() ||
    username
  );
}

export async function syncClerkUser(input: SyncClerkUserInput) {
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const existingByEmail = await findUserIdentityByEmail(email);

  if (existingByEmail && existingByEmail.clerkId !== input.clerkId) {
    throw new ClerkUserSyncConflictError(
      `Email ${email} already belongs to a different Clerk user.`,
    );
  }

  const existingByClerkId = await findUserIdentityByClerkId(input.clerkId);

  const normalizedUsername =
    normalizeUsername(input.username ?? "") ||
    existingByClerkId?.username ||
    getStableFallbackUsername(input.clerkId);

  const existingByUsername =
    await findUserIdentityByUsername(normalizedUsername);

  if (existingByUsername && existingByUsername.clerkId !== input.clerkId) {
    throw new ClerkUserSyncConflictError(
      `Username ${normalizedUsername} already belongs to a different Clerk user.`,
    );
  }

  const normalizedPhoneNumber = normalizePhoneNumber(input.phoneNumber);
  const name = getDisplayName(input, normalizedUsername);

  return await upsertSyncedUser({
    clerkId: input.clerkId,
    name,
    email,
    username: normalizedUsername,
    phoneNumber: normalizedPhoneNumber,
  });
}

export async function deleteClerkUser(clerkId: string) {
  return await deleteUserByClerkId(clerkId);
}

export async function hasSyncedClerkUser(clerkId: string) {
  const existingUser = await findUserIdByClerkId(clerkId);
  return Boolean(existingUser);
}
