import { get } from "@vercel/blob";
import { auth } from "@shared/server/auth/config";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ message: "Immagine non disponibile." }, { status: 404 });
  }

  const url = new URL(request.url);
  const pathname = url.searchParams.get("pathname")?.trim();
  if (!pathname || !pathname.startsWith(`avatars/${userId}/`)) {
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
