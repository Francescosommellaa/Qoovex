"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { bootstrapDevUser } from "@shared/server/dev-auth";
import { findWorkspaceUserByClerkId } from "@shared/server/repositories/user-repository";

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

function hasAdminAccess(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  const adminMetadata = metadata as Record<string, unknown>;

  return adminMetadata.role === "admin" || adminMetadata.isAdmin === true;
}

function getClaimsMetadata(claims: unknown) {
  if (!claims || typeof claims !== "object") {
    return null;
  }

  const record = claims as Record<string, unknown>;
  return (
    record.publicMetadata ??
    record.public_metadata ??
    record.metadata ??
    null
  );
}

export async function bootstrapUser(options?: BootstrapUserOptions) {
  const devUser = await bootstrapDevUser();
  if (devUser) return devUser;

  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  if (!options) {
    const existingUser = await findWorkspaceUserByClerkId(userId);
    if (existingUser) {
      return {
        ...existingUser,
        isAdmin: hasAdminAccess(getClaimsMetadata(sessionClaims)),
      };
    }
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) return null;

  const { syncClerkUser } = await import("@shared/server/clerk-user-sync");

  const syncedUser = await syncClerkUser({
    clerkId: userId,
    email: primaryEmail,
    username: clerkUser.username,
    firstName: options?.firstName ?? clerkUser.firstName,
    lastName: options?.lastName ?? clerkUser.lastName,
    phoneNumber:
      options?.phoneNumber ?? getUnsafeMetadataPhoneNumber(clerkUser.unsafeMetadata),
  });

  if (!syncedUser) return null;

  return {
    ...syncedUser,
    isAdmin: hasAdminAccess(clerkUser.publicMetadata),
  };
}

export async function hasBootstrappedUser() {
  if (await bootstrapDevUser()) return true;

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
