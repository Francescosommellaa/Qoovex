import "server-only";

import sharp from "sharp";

export const MAX_RECIPE_IMAGE_SIZE = 5 * 1024 * 1024;

export class InvalidRecipeImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRecipeImageError";
  }
}

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

export interface ValidatedRecipeImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export async function validateRecipeImageFile(file: File): Promise<ValidatedRecipeImage> {
  if (file.size > MAX_RECIPE_IMAGE_SIZE) {
    throw new InvalidRecipeImageError("Immagine troppo pesante. Massimo 5 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    throw new InvalidRecipeImageError("Formato non supportato. Usa JPG, PNG o WebP.");
  }

  const format = metadata.format;
  if (!format || !SUPPORTED_FORMATS.has(format)) {
    throw new InvalidRecipeImageError("Formato non supportato. Usa JPG, PNG o WebP.");
  }

  const normalizedFormat = format as keyof typeof CONTENT_TYPE_BY_FORMAT;

  return {
    buffer,
    contentType: CONTENT_TYPE_BY_FORMAT[normalizedFormat],
    extension: EXTENSION_BY_FORMAT[normalizedFormat],
  };
}

export function buildRecipeImagePathname(userId: string, extension: string) {
  return `recipes/${userId}/${crypto.randomUUID()}.${extension}`;
}
