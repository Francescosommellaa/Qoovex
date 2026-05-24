"use server";

import { auth } from "@shared/server/auth/config";
import { syncWorkspaceUser } from "@shared/server/workspace-user-sync";

export async function syncCurrentAccountProfile() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email?.trim().toLowerCase();

  if (!userId || !email) {
    return { ok: false as const, code: "UNAUTHENTICATED" };
  }

  await syncWorkspaceUser({
    id: userId,
    email,
    username: null,
    firstName: session.user?.name,
    name: session.user?.name,
    image: session.user?.image,
  });

  return { ok: true as const };
}
