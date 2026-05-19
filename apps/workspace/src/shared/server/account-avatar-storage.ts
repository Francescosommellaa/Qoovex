import "server-only";

import sharp from "sharp";

export const ACCOUNT_AVATAR_METADATA_KEY = "avatarBlobPathname";
export const MAX_ACCOUNT_AVATAR_SIZE = 3 * 1024 * 1024;

const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp"]);

const CONTENT_TYPE_BY_FORMAT = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

const EXTENSION_BY_FORMAT = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
} as const;

export class InvalidAccountAvatarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAccountAvatarError";
  }
}

export interface ValidatedAccountAvatar {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export async function validateAccountAvatarFile(
  file: File,
): Promise<ValidatedAccountAvatar> {
  if (file.size > MAX_ACCOUNT_AVATAR_SIZE) {
    throw new InvalidAccountAvatarError("Immagine troppo pesante. Massimo 3 MB.");
  }

  const sourceBuffer = Buffer.from(await file.arrayBuffer());
  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(sourceBuffer).metadata();
  } catch {
    throw new InvalidAccountAvatarError(
      "Formato non supportato. Usa JPG, PNG o WebP.",
    );
  }

  const format = metadata.format;
  if (!format || !SUPPORTED_FORMATS.has(format)) {
    throw new InvalidAccountAvatarError(
      "Formato non supportato. Usa JPG, PNG o WebP.",
    );
  }

  const normalizedFormat = format as keyof typeof CONTENT_TYPE_BY_FORMAT;
  const buffer = await sharp(sourceBuffer)
    .resize(512, 512, { fit: "cover" })
    .toFormat(normalizedFormat)
    .toBuffer();

  return {
    buffer,
    contentType: CONTENT_TYPE_BY_FORMAT[normalizedFormat],
    extension: EXTENSION_BY_FORMAT[normalizedFormat],
  };
}

export function buildAccountAvatarPathname(userId: string, extension: string) {
  return `avatars/${userId}/${crypto.randomUUID()}.${extension}`;
}

export function getAccountAvatarProxyUrl(pathname: string) {
  return `/api/account/avatar/media?pathname=${encodeURIComponent(pathname)}`;
}

export function getAccountAvatarPathnameFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null;

  const value = (metadata as Record<string, unknown>)[ACCOUNT_AVATAR_METADATA_KEY];
  return typeof value === "string" && value.startsWith("avatars/")
    ? value
    : null;
}

export function getAccountAvatarUrlFromMetadata(metadata: unknown) {
  const pathname = getAccountAvatarPathnameFromMetadata(metadata);
  return pathname ? getAccountAvatarProxyUrl(pathname) : null;
}
