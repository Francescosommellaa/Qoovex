import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import {
  buildRecipeImagePathname,
  InvalidRecipeImageError,
  validateRecipeImageFile,
} from "@shared/server/recipe-image-upload";
import { getRecipeMediaProxyUrl } from "@shared/server/recipe-image-access";
import { assertRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";

export async function POST(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  try {
    assertRateLimit({
      userId: user.id,
      bucket: "recipes:image",
      limit: 30,
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
    validated = await validateRecipeImageFile(file);
  } catch (error) {
    if (error instanceof InvalidRecipeImageError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    throw error;
  }

  try {
    const pathname = buildRecipeImagePathname(user.id, validated.extension);
    const blob = await put(pathname, validated.buffer, {
      access: "private",
      contentType: validated.contentType,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      displayUrl: getRecipeMediaProxyUrl(pathname),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")
        ? "Configura BLOB_READ_WRITE_TOKEN per caricare immagini."
        : "Upload immagine non riuscito.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
