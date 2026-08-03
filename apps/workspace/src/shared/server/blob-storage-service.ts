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

type E2eBlob = { bytes: Uint8Array; contentType: string; uploadedAt: Date; etag: string };
const globalBlobStore = globalThis as typeof globalThis & { __qoovexE2eBlobs?: Map<string, E2eBlob> };

function getE2eBlobStore() {
  if (process.env.QOOVEX_E2E_MODE !== "1" || process.env.NODE_ENV === "production") return null;
  if (!process.env.BLOB_STORE_ID || process.env.QOOVEX_E2E_BLOB_TARGET !== process.env.BLOB_STORE_ID) throw new Error("E2E Blob target mismatch.");
  if (process.env.QOOVEX_E2E_RUN_ATTESTATION !== "I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP") throw new Error("E2E Blob attestation missing.");
  globalBlobStore.__qoovexE2eBlobs ??= new Map();
  return globalBlobStore.__qoovexE2eBlobs;
}

export async function putPrivateBlob(input: {
  pathname: string;
  body: Buffer | ReadableStream<Uint8Array>;
  contentType: string;
  maximumSizeInBytes: number;
  allowOverwrite?: boolean;
}): Promise<StoredPrivateBlob> {
  const e2e = getE2eBlobStore();
  if (e2e) {
    if (!input.allowOverwrite && e2e.has(input.pathname)) throw new Error("BLOB_ALREADY_EXISTS");
    const bytes = Buffer.isBuffer(input.body)
      ? new Uint8Array(input.body.buffer, input.body.byteOffset, input.body.byteLength)
      : new Uint8Array(await new Response(input.body).arrayBuffer());
    if (bytes.byteLength > input.maximumSizeInBytes) throw new Error("BLOB_TOO_LARGE");
    const etag = `e2e-${bytes.byteLength}-${Date.now()}`;
    e2e.set(input.pathname, { bytes, contentType: input.contentType, uploadedAt: new Date(), etag });
    return { pathname: input.pathname, etag, contentType: input.contentType };
  }
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
  const e2e = getE2eBlobStore();
  if (e2e) {
    const stored = e2e.get(pathname);
    if (!stored) return null;
    return { stream: new ReadableStream({ start(controller) { controller.enqueue(stored.bytes); controller.close(); } }), contentType: stored.contentType, size: stored.bytes.byteLength };
  }
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return {
    stream: result.stream,
    contentType: result.blob.contentType,
    size: result.blob.size,
  };
}

export async function deletePrivateBlob(pathname: string) {
  const e2e = getE2eBlobStore();
  if (e2e) { e2e.delete(pathname); return; }
  await del(pathname);
}

export async function deletePrivateBlobs(pathnames: string[]) {
  if (!pathnames.length) return;
  const e2e = getE2eBlobStore();
  if (e2e) { pathnames.forEach((pathname) => e2e.delete(pathname)); return; }
  await del(pathnames);
}

export interface ListedPrivateBlob {
  pathname: string;
  size?: number | null;
  uploadedAt?: Date | null;
}

export async function listPrivateBlobs(input: { prefix: string; limit?: number; cursor?: string }) {
  const e2e = getE2eBlobStore();
  if (e2e) {
    const all = [...e2e.entries()].filter(([pathname]) => pathname.startsWith(input.prefix)).sort(([left], [right]) => left.localeCompare(right));
    const start = input.cursor ? Number(input.cursor) : 0;
    const limit = input.limit ?? 100;
    const page = all.slice(start, start + limit);
    const next = start + page.length;
    return { cursor: next < all.length ? String(next) : undefined, hasMore: next < all.length, blobs: page.map(([pathname, stored]) => ({ pathname, size: stored.bytes.byteLength, uploadedAt: stored.uploadedAt })) };
  }
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
