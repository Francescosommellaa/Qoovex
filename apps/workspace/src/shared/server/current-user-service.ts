import "server-only";

import { auth } from "@shared/server/auth/config";
import { bootstrapDevUser } from "@shared/server/dev-auth";
import { findWorkspaceUserById } from "@shared/server/repositories/user-repository";

interface BootstrapUserOptions {
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function getUserAvatarUrl(input: {
  image?: string | null;
}) {
  return input.image ?? null;
}

export async function bootstrapUser(options?: BootstrapUserOptions) {
  const devUser = await bootstrapDevUser();
  if (devUser) return devUser;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const existingUser = await findWorkspaceUserById(userId);
  if (existingUser && !options) {
    return {
      ...existingUser,
      imageUrl: getUserAvatarUrl(existingUser),
      isAdmin: existingUser.platformRole === "PLATFORM_ADMIN" || (
        existingUser.organizationMemberships.some((membership) => membership.revokedAt === null && membership.role === "OWNER")
      ),
    };
  }

  const email = session.user?.email?.trim().toLowerCase();
  if (!email) return null;

  const { syncWorkspaceUser } = await import(
    "@shared/server/workspace-user-sync"
  );
  const syncedUser = await syncWorkspaceUser({
    id: userId,
    email,
    firstName: options?.firstName ?? existingUser?.firstName ?? session.user?.name,
    lastName: options?.lastName ?? existingUser?.lastName,
    phoneNumber: options?.phoneNumber ?? existingUser?.phoneNumber,
    name: session.user?.name,
    image: session.user?.image,
  });

  if (!syncedUser) return null;

  const workspaceUser = await findWorkspaceUserById(userId);
  if (!workspaceUser) return null;

  return {
    ...workspaceUser,
    imageUrl: getUserAvatarUrl(workspaceUser),
    isAdmin: workspaceUser.platformRole === "PLATFORM_ADMIN" || (
      workspaceUser.organizationMemberships.some((membership) => membership.revokedAt === null && membership.role === "OWNER")
    ),
  };
}
