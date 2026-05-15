"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

interface BootstrapUserOptions {
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface CompleteCurrentUserProfileInput {
  firstName: string;
  lastName?: string | null;
  phoneNumber?: string | null;
}

function getUnsafeMetadataPhoneNumber(
  unsafeMetadata: Record<string, unknown>,
): string | undefined {
  const phoneNumber = unsafeMetadata.phoneNumber;
  return typeof phoneNumber === "string" ? phoneNumber : undefined;
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

  const { syncClerkUser } = await import("@shared/server/clerk-user-sync");

  return await syncClerkUser({
    clerkId: userId,
    email: primaryEmail,
    username: clerkUser.username,
    firstName: options?.firstName ?? clerkUser.firstName,
    lastName: options?.lastName ?? clerkUser.lastName,
    phoneNumber:
      options?.phoneNumber ?? getUnsafeMetadataPhoneNumber(clerkUser.unsafeMetadata),
  });
}

export async function hasBootstrappedUser() {
  const { userId } = await auth();
  if (!userId) return false;

  const { hasSyncedClerkUser } = await import("@shared/server/clerk-user-sync");

  return await hasSyncedClerkUser(userId);
}

export async function updateCurrentUserProfile(
  input: CompleteCurrentUserProfileInput,
) {
  const { userId } = await auth();
  if (!userId) return null;

  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim() || undefined;
  if (!firstName) return null;

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    firstName,
    lastName,
  });

  return { ok: true };
}
