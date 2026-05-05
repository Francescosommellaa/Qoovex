"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@qoovex/db";
import { syncClerkUser } from "@shared/server/clerk-user-sync";

interface BootstrapUserOptions {
  phoneNumber?: string | null;
}

export async function bootstrapUser(options?: BootstrapUserOptions) {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) return null;

  return await syncClerkUser({
    clerkId: userId,
    email: primaryEmail,
    username: clerkUser.username,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    phoneNumber: options?.phoneNumber,
  });
}

export async function hasBootstrappedUser() {
  const { userId } = await auth();
  if (!userId) return false;

  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  return Boolean(existingUser);
}
