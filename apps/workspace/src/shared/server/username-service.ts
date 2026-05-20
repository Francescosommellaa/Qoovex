import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@qoovex/db";
import {
  buildUsernameSuggestions,
  normalizeUsernameInput,
  validateUsername,
} from "@shared/lib/username";
import { updateUserUsernameByClerkId } from "@shared/server/repositories/user-repository";

const USERNAME_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export class UsernameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsernameValidationError";
  }
}

export function getNextUsernameChangeAt(changedAt: Date | null | undefined) {
  return changedAt
    ? new Date(changedAt.getTime() + USERNAME_CHANGE_COOLDOWN_MS)
    : null;
}

export async function getUsernameAvailability(input: {
  username: string;
  currentUserId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const username = normalizeUsernameInput(input.username);
  const validationError = validateUsername(username);

  if (validationError) {
    return {
      username,
      valid: false,
      available: false,
      message: validationError,
      suggestions: buildUsernameSuggestions(input),
    };
  }

  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  const available = !existing || existing.id === input.currentUserId;

  return {
    username,
    valid: true,
    available,
    message: available ? "Username disponibile." : "Username gia in uso.",
    suggestions: available ? [] : await getAvailableUsernameSuggestions(input),
  };
}

export async function getAvailableUsernameSuggestions(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const baseSuggestions = buildUsernameSuggestions(input);
  const expanded = [
    ...baseSuggestions,
    ...baseSuggestions.flatMap((base) => [
      `${base}.chef`,
      `${base}_${Math.floor(10 + Math.random() * 90)}`,
    ]),
  ].filter((value) => validateUsername(value) === undefined);

  const existing = await db.user.findMany({
    where: { username: { in: expanded } },
    select: { username: true },
  });
  const taken = new Set(existing.map((item) => item.username));

  return expanded.filter((value) => !taken.has(value)).slice(0, 4);
}

export async function changeUsernameForClerkUser(input: {
  clerkId: string;
  username: string;
}) {
  const user = await db.user.findUnique({
    where: { clerkId: input.clerkId },
    select: { id: true, username: true, usernameChangedAt: true },
  });

  if (!user) {
    throw new UsernameValidationError("Sessione non valida.");
  }

  const username = normalizeUsernameInput(input.username);
  const validationError = validateUsername(username);
  if (validationError) {
    throw new UsernameValidationError(validationError);
  }

  if (username === user.username) {
    return user;
  }

  const nextChangeAt = getNextUsernameChangeAt(user.usernameChangedAt);
  if (nextChangeAt && nextChangeAt.getTime() > Date.now()) {
    throw new UsernameValidationError(
      "Puoi cambiare username una volta ogni 7 giorni.",
    );
  }

  const availability = await getUsernameAvailability({
    username,
    currentUserId: user.id,
  });
  if (!availability.available) {
    throw new UsernameValidationError("Username gia in uso.");
  }

  const client = await clerkClient();
  await client.users.updateUser(input.clerkId, { username });

  return await updateUserUsernameByClerkId({
    clerkId: input.clerkId,
    username,
    changedAt: new Date(),
  });
}
