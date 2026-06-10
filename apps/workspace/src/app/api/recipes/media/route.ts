import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/server/current-user-service";
import { extractBlobPathname, isPrivateBlobUrl } from "@shared/server/recipe-image-access";
import { canAccessRecipeImagePathname } from "@shared/server/recipe-image-media-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathnameParam = url.searchParams.get("pathname");
  const blobUrlParam = url.searchParams.get("url");

  const pathname =
    pathnameParam?.trim() ||
    (blobUrlParam && isPrivateBlobUrl(blobUrlParam) ? extractBlobPathname(blobUrlParam) : null);

  if (!pathname) {
    return NextResponse.json({ message: "Percorso immagine non valido." }, { status: 400 });
  }

  const user = await bootstrapUser();
  const allowed = await canAccessRecipeImagePathname(pathname, user?.id ?? null);
  if (!allowed) {
    return NextResponse.json({ message: "Immagine non disponibile." }, { status: 404 });
  }

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ message: "Immagine non trovata." }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
