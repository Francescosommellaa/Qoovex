import "server-only";

import { auth } from "@shared/server/auth/config";
import { bootstrapDevUser } from "@shared/server/dev-auth";
import { getAccountAvatarProxyUrl } from "@shared/server/account-avatar-storage";
import { findWorkspaceUserById } from "@shared/server/repositories/user-repository";

interface BootstrapUserOptions {
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function getUserAvatarUrl(input: {
  avatarBlobPathname?: string | null;
  image?: string | null;
}) {
  if (input.avatarBlobPathname) {
    return getAccountAvatarProxyUrl(input.avatarBlobPathname);
  }

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
      isAdmin: false,
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
    isAdmin: false,
  };
}
