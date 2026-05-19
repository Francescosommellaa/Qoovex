"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { bootstrapDevUser } from "@shared/server/dev-auth";
import { getAccountAvatarUrlFromMetadata } from "@shared/server/account-avatar-storage";
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

type CompleteCurrentUserProfileResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "UNAUTHENTICATED"
        | "MISSING_NAME"
        | "CLERK_UPDATE_FAILED"
        | "DATABASE_SYNC_FAILED";
      message: string;
    };

type ClerkProfileForSync = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  primaryEmailAddressId?: string | null;
  emailAddresses?: Array<{
    id?: string | null;
    emailAddress?: string | null;
    email_address?: string | null;
  }>;
  unsafeMetadata?: Record<string, unknown>;
};

function getTrimmedInputValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getUnsafeMetadataPhoneNumber(
  unsafeMetadata: Record<string, unknown>,
): string | undefined {
  const phoneNumber = unsafeMetadata.phoneNumber;
  return typeof phoneNumber === "string" ? phoneNumber : undefined;
}

/** Admin only from Clerk publicMetadata / session claims set server-side — never from client-writable fields. */
function hasAdminAccess(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  const adminMetadata = metadata as Record<string, unknown>;

  return adminMetadata.role === "admin" || adminMetadata.isAdmin === true;
}

function getPrimaryEmailFromClerkProfile(
  clerkUser: ClerkProfileForSync,
): string | undefined {
  const primaryEmail =
    clerkUser.emailAddresses?.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    ) ?? clerkUser.emailAddresses?.[0];

  return primaryEmail?.emailAddress ?? primaryEmail?.email_address ?? undefined;
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

function getClerkAvatarUrl(clerkUser: ClerkProfileForSync | null | undefined) {
  if (!clerkUser) return null;

  return getAccountAvatarUrlFromMetadata(clerkUser.unsafeMetadata) ?? clerkUser.imageUrl ?? null;
}

export async function bootstrapUser(options?: BootstrapUserOptions) {
  const devUser = await bootstrapDevUser();
  if (devUser) return devUser;

  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  if (!options) {
    const existingUser = await findWorkspaceUserByClerkId(userId);
    if (existingUser) {
      const clerkUser = await currentUser().catch(() => null);

      return {
        ...existingUser,
        imageUrl: getClerkAvatarUrl(clerkUser),
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
    imageUrl: getClerkAvatarUrl(clerkUser),
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

  const firstName = getTrimmedInputValue(input?.firstName);
  const lastName = getTrimmedInputValue(input?.lastName) || undefined;
  if (!firstName) return null;

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    firstName,
    lastName,
  });

  return { ok: true };
}

export async function completeCurrentUserProfile(
  input: CompleteCurrentUserProfileInput,
): Promise<CompleteCurrentUserProfileResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Sessione scaduta. Accedi di nuovo per completare il profilo.",
    };
  }

  const firstName = getTrimmedInputValue(input?.firstName);
  const lastName = getTrimmedInputValue(input?.lastName) || undefined;
  if (!firstName) {
    return {
      ok: false,
      code: "MISSING_NAME",
      message: "Inserisci il nome prima di entrare nel workspace.",
    };
  }

  let updatedClerkUser: ClerkProfileForSync;
  try {
    const client = await clerkClient();
    updatedClerkUser = await client.users.updateUser(userId, {
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("[complete-profile] clerk profile update failed", {
      userId,
      error,
    });

    return {
      ok: false,
      code: "CLERK_UPDATE_FAILED",
      message:
        "Non siamo riusciti a salvare nome e cognome su Clerk. Riprova tra qualche istante.",
    };
  }

  const primaryEmail = getPrimaryEmailFromClerkProfile(updatedClerkUser);
  if (!primaryEmail) {
    return {
      ok: false,
      code: "DATABASE_SYNC_FAILED",
      message:
        "Profilo salvato su Clerk, ma manca un'email primaria per sincronizzare il database.",
    };
  }

  try {
    const { syncClerkUser } = await import("@shared/server/clerk-user-sync");
    await syncClerkUser({
      clerkId: userId,
      email: primaryEmail,
      username: updatedClerkUser.username,
      firstName: updatedClerkUser.firstName ?? firstName,
      lastName: updatedClerkUser.lastName ?? lastName,
      phoneNumber:
        input.phoneNumber ??
        getUnsafeMetadataPhoneNumber(updatedClerkUser.unsafeMetadata ?? {}),
    });
  } catch (error) {
    console.error("[complete-profile] database profile sync failed", {
      userId,
      error,
    });

    return {
      ok: false,
      code: "DATABASE_SYNC_FAILED",
      message:
        "Profilo salvato su Clerk, ma la sincronizzazione con il database non e riuscita. Riprova.",
    };
  }

  return { ok: true };
}
