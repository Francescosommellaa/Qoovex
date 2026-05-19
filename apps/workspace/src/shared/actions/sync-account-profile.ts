"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

function getPrimaryEmailAddress(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | undefined {
  if (!user) return undefined;

  return (
    user.emailAddresses.find(
      (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
    )?.emailAddress ?? user.emailAddresses[0]?.emailAddress
  );
}

function getPrimaryPhoneNumber(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | undefined {
  if (!user) return undefined;

  return (
    user.phoneNumbers.find(
      (phoneNumber) => phoneNumber.id === user.primaryPhoneNumberId,
    )?.phoneNumber ?? user.phoneNumbers[0]?.phoneNumber
  );
}

export async function syncCurrentAccountProfile() {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, code: "UNAUTHENTICATED" };
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { ok: false as const, code: "UNAUTHENTICATED" };
  }

  const primaryEmail = getPrimaryEmailAddress(clerkUser);
  if (!primaryEmail) {
    return { ok: false as const, code: "MISSING_EMAIL" };
  }

  const { syncClerkUser } = await import("@shared/server/clerk-user-sync");

  await syncClerkUser({
    clerkId: userId,
    email: primaryEmail,
    username: clerkUser.username,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    phoneNumber: getPrimaryPhoneNumber(clerkUser),
    imageUrl: clerkUser.imageUrl,
  });

  return { ok: true as const };
}
