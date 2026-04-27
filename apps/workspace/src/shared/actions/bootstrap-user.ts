"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@qoovex/db";

interface BootstrapUserOptions {
  phoneNumber?: string | null;
}

function normalizePhoneNumber(phoneNumber?: string | null): string | undefined {
  if (!phoneNumber) return undefined;

  const trimmed = phoneNumber.trim();
  if (!trimmed) return undefined;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return undefined;

  return hasPlus ? `+${digits}` : digits;
}

export async function bootstrapUser(options?: BootstrapUserOptions) {
  const { userId } = await auth();
  if (!userId) return null;

  const normalizedPhoneNumber = normalizePhoneNumber(options?.phoneNumber);
  const existing = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (existing) {
    if (
      normalizedPhoneNumber &&
      existing.phoneNumber !== normalizedPhoneNumber
    ) {
      return await db.user.update({
        where: { id: existing.id },
        data: { phoneNumber: normalizedPhoneNumber },
      });
    }

    return existing;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) return null;

  const username = clerkUser.username;
  if (!username) {
    throw new Error(
      "[bootstrap] Username mancante — abilitalo come obbligatorio in Clerk Dashboard",
    );
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || username;

  return await db.user.create({
    data: {
      clerkId: userId,
      name,
      email: primaryEmail,
      username,
      phoneNumber: normalizedPhoneNumber,
      plan: "FREE",
    },
  });
}
