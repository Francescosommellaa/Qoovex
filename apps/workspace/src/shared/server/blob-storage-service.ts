import "server-only";

import { del, get, list, put } from "@vercel/blob";

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
  allowOverwrite?: boolean;
}): Promise<StoredPrivateBlob> {
  const blob = await put(input.pathname, input.body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: input.allowOverwrite ?? false,
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

export async function deletePrivateBlobs(pathnames: string[]) {
  if (!pathnames.length) return;
  await del(pathnames);
}

export interface ListedPrivateBlob {
  pathname: string;
  size?: number | null;
  uploadedAt?: Date | null;
}

export async function listPrivateBlobs(input: { prefix: string; limit?: number; cursor?: string }) {
  const result = await list({
    prefix: input.prefix,
    limit: input.limit ?? 100,
    cursor: input.cursor,
  });
  return {
    cursor: result.cursor,
    hasMore: result.hasMore,
    blobs: result.blobs.map((blob) => ({
      pathname: blob.pathname,
      size: blob.size ?? null,
      uploadedAt: blob.uploadedAt ?? null,
    })),
  };
}
