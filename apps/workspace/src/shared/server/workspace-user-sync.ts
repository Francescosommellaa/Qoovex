import "server-only";

import { db } from "@qoovex/db";
import {
  deleteUserById,
  findUserIdById,
  findUserIdentityByEmail,
  findUserIdentityById,
  findUserIdentityByUsername,
  updateWorkspaceUserByEmail,
  upsertWorkspaceUser,
} from "@shared/server/repositories/user-repository";
import { normalizeUsernameInput, validateUsername } from "@shared/lib/username";

export interface SyncWorkspaceUserInput {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  name?: string | null;
  image?: string | null;
}

export class WorkspaceUserSyncConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceUserSyncConflictError";
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
  const normalized = normalizeUsernameInput(username);

  return validateUsername(normalized) === undefined ? normalized : "";
}

function getStableFallbackUsername(userId: string): string {
  return `user_${userId.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toLowerCase()}`;
}

function normalizeNamePart(value: string | null | undefined) {
  return value?.trim() || undefined;
}

export async function syncWorkspaceUser(input: SyncWorkspaceUserInput) {
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const existingByEmail = await findUserIdentityByEmail(email);
  const existingById = await findUserIdentityById(input.id);

  if (
    existingByEmail &&
    existingByEmail.id !== input.id &&
    existingById &&
    existingById.id !== existingByEmail.id
  ) {
    throw new WorkspaceUserSyncConflictError(
      `User ${input.id} already belongs to a different email.`,
    );
  }

  const normalizedUsername =
    normalizeUsername(input.username ?? "") ||
    existingById?.username ||
    existingByEmail?.username ||
    getStableFallbackUsername(input.id);

  const existingByUsername =
    await findUserIdentityByUsername(normalizedUsername);

  if (
    existingByUsername &&
    existingByUsername.id !== input.id &&
    existingByUsername.id !== existingByEmail?.id
  ) {
    throw new WorkspaceUserSyncConflictError(
      `Username ${normalizedUsername} already belongs to a different user.`,
    );
  }

  const normalizedPhoneNumber = normalizePhoneNumber(input.phoneNumber);
  const firstName = normalizeNamePart(input.firstName) ?? normalizedUsername;
  const lastName = normalizeNamePart(input.lastName) ?? null;

  if (existingByEmail && existingByEmail.id !== input.id) {
    return await updateWorkspaceUserByEmail({
      id: input.id,
      firstName,
      lastName,
      email,
      username: normalizedUsername,
      phoneNumber: normalizedPhoneNumber,
      name: input.name,
      image: input.image,
    });
  }

  return await upsertWorkspaceUser({
    id: input.id,
    firstName,
    lastName,
    email,
    username: normalizedUsername,
    phoneNumber: normalizedPhoneNumber,
    name: input.name,
    image: input.image,
  });
}

export async function deleteWorkspaceUser(userId: string) {
  return await deleteUserById(userId);
}

export async function hasWorkspaceUser(userId: string) {
  const existingUser = await findUserIdById(userId);
  return Boolean(existingUser);
}

export async function createUserForAuthAdapter(user: {
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
}) {
  const email = user.email.trim().toLowerCase();
  const nameParts = user.name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstName = nameParts[0] || email.split("@")[0] || "utente";
  const lastName = nameParts.slice(1).join(" ") || null;

  const baseUsername =
    normalizeUsername(email.split("@")[0] ?? "") ||
    normalizeUsername(firstName) ||
    "utente";

  let username = baseUsername;
  let suffix = 0;
  while (await db.user.findUnique({ where: { username }, select: { id: true } })) {
    suffix += 1;
    username = `${baseUsername.slice(0, 28)}_${suffix}`;
  }

  const record = await db.user.create({
    data: {
      email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
      firstName,
      lastName,
      username,
      usernameOnboarded: false,
      profileOnboarded: false,
    },
  });

  return {
    id: record.id,
    email: record.email,
    emailVerified: record.emailVerified,
    name: record.name,
    image: record.image,
  };
}

export async function ensureWorkspaceUserProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      username: true,
      name: true,
      image: true,
    },
  });

  if (!user) return null;

  const needsUsername = !user.username || user.username.length < 3;
  const needsFirstName = !user.firstName || user.firstName.length < 1;

  if (!needsUsername && !needsFirstName) {
    return user;
  }

  const emailLocal = user.email.split("@")[0] ?? "utente";
  const username =
    user.username && user.username.length >= 3
      ? user.username
      : getStableFallbackUsername(userId);

  return await db.user.update({
    where: { id: userId },
    data: {
      username: needsUsername ? username : user.username,
      ...(needsUsername ? { usernameOnboarded: false } : {}),
      firstName: needsFirstName
        ? normalizeNamePart(user.name) ?? emailLocal
        : user.firstName,
    },
  });
}
