import { del, put } from "@vercel/blob";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  ACCOUNT_AVATAR_METADATA_KEY,
  buildAccountAvatarPathname,
  getAccountAvatarPathnameFromMetadata,
  getAccountAvatarProxyUrl,
  InvalidAccountAvatarError,
  validateAccountAvatarFile,
} from "@shared/server/account-avatar-storage";
import { assertRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  try {
    assertRateLimit({
      userId,
      bucket: "account:avatar",
      limit: 12,
      windowMs: 10 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }

    throw error;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Immagine non valida." }, { status: 400 });
  }

  let validated;
  try {
    validated = await validateAccountAvatarFile(file);
  } catch (error) {
    if (error instanceof InvalidAccountAvatarError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    throw error;
  }

  const clerkUser = await currentUser();
  const previousPathname = getAccountAvatarPathnameFromMetadata(
    clerkUser?.unsafeMetadata,
  );

  try {
    const pathname = buildAccountAvatarPathname(userId, validated.extension);
    await put(pathname, validated.buffer, {
      access: "private",
      contentType: validated.contentType,
      addRandomSuffix: false,
    });

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      unsafeMetadata: {
        ...(clerkUser?.unsafeMetadata ?? {}),
        [ACCOUNT_AVATAR_METADATA_KEY]: pathname,
      },
    });

    if (previousPathname && previousPathname !== pathname) {
      await del(previousPathname).catch(() => undefined);
    }

    return NextResponse.json({
      url: getAccountAvatarProxyUrl(pathname),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")
        ? "Configura BLOB_READ_WRITE_TOKEN per caricare immagini."
        : "Upload immagine non riuscito.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const pathname = getAccountAvatarPathnameFromMetadata(clerkUser?.unsafeMetadata);
  const nextMetadata = { ...(clerkUser?.unsafeMetadata ?? {}) };
  delete nextMetadata[ACCOUNT_AVATAR_METADATA_KEY];

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    unsafeMetadata: nextMetadata,
  });

  if (pathname) {
    await del(pathname).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
