import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { bootstrapUser } from "@shared/actions/bootstrap-user";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLocaleLowerCase("it") ?? "image";
  return `${crypto.randomUUID()}.${extension.replace(/[^a-z0-9]/g, "") || "image"}`;
}

export async function POST(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Immagine non valida." }, { status: 400 });
  }

  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Formato non supportato. Usa JPG, PNG o WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { message: "Immagine troppo pesante. Massimo 5 MB." },
      { status: 400 },
    );
  }

  try {
    const blob = await put(`recipes/${user.id}/${safeFileName(file.name)}`, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")
        ? "Configura BLOB_READ_WRITE_TOKEN per caricare immagini."
        : "Upload immagine non riuscito.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
