import "server-only";

import { fileTypeFromBuffer } from "file-type";
import { AccessError } from "@shared/server/access-errors";

export async function validateBinaryFileContent(
  buffer: Buffer,
  declaredMimeType: string,
  allowedMimeTypes: readonly string[],
) {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || detected.mime !== declaredMimeType || !allowedMimeTypes.includes(detected.mime)) {
    throw new AccessError("Il contenuto del file non corrisponde a un formato supportato.", 409);
  }
  return detected.mime;
}
