import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@shared/server/auth/config";
import {
  buildAccountAvatarPathname,
  getAccountAvatarProxyUrl,
  InvalidAccountAvatarError,
  validateAccountAvatarFile,
} from "@shared/server/account-avatar-storage";
import {
  findUserAvatarPathname,
  updateUserAvatarPathname,
} from "@shared/server/repositories/user-repository";
import { assertRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
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

  const existing = await findUserAvatarPathname(userId);
  const previousPathname = existing?.avatarBlobPathname ?? null;

  try {
    const pathname = buildAccountAvatarPathname(userId, validated.extension);
    await put(pathname, validated.buffer, {
      access: "private",
      contentType: validated.contentType,
      addRandomSuffix: false,
    });

    await updateUserAvatarPathname({
      userId,
      avatarBlobPathname: pathname,
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
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  const existing = await findUserAvatarPathname(userId);
  const pathname = existing?.avatarBlobPathname ?? null;

  await updateUserAvatarPathname({
    userId,
    avatarBlobPathname: null,
  });

  if (pathname) {
    await del(pathname).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
