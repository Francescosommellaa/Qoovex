"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@qoovex/db";

export async function bootstrapUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (existing) return existing;

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
      plan: "FREE",
    },
  });
}
