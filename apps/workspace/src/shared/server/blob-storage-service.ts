import "server-only";

import { del, get, put } from "@vercel/blob";

export interface StoredPrivateBlob {
  pathname: string;
  etag: string;
  contentType: string;
}

export interface ReadPrivateBlobResult {
  stream: ReadableStream<Uint8Array>;
  contentType: string;
  size: number;
}

export async function putPrivateBlob(input: {
  pathname: string;
  body: Buffer;
  contentType: string;
  maximumSizeInBytes: number;
}): Promise<StoredPrivateBlob> {
  const blob = await put(input.pathname, input.body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: input.contentType,
    maximumSizeInBytes: input.maximumSizeInBytes,
  });
  return { pathname: blob.pathname, etag: blob.etag, contentType: blob.contentType };
}

export async function getPrivateBlob(pathname: string): Promise<ReadPrivateBlobResult | null> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return {
    stream: result.stream,
    contentType: result.blob.contentType,
    size: result.blob.size,
  };
}

export async function deletePrivateBlob(pathname: string) {
  await del(pathname);
}
