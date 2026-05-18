import "server-only";

export function isLegacyPublicBlobUrl(url: string) {
  return url.includes(".public.blob.vercel-storage.com");
}

export function isPrivateBlobUrl(url: string) {
  return url.includes(".private.blob.vercel-storage.com");
}

export function isVercelBlobUrl(url: string) {
  return url.includes(".blob.vercel-storage.com");
}

export function extractBlobPathname(url: string) {
  try {
    const parsed = new URL(url);
    if (!isVercelBlobUrl(url)) return null;

    const pathname = parsed.pathname.startsWith("/")
      ? parsed.pathname.slice(1)
      : parsed.pathname;

    return pathname || null;
  } catch {
    return null;
  }
}

export function getRecipeMediaProxyUrl(pathname: string) {
  return `/api/recipes/media?pathname=${encodeURIComponent(pathname)}`;
}

export async function resolveRecipeImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;

  if (!isPrivateBlobUrl(imageUrl)) {
    return imageUrl;
  }

  const pathname = extractBlobPathname(imageUrl);
  if (!pathname) return imageUrl;

  return getRecipeMediaProxyUrl(pathname);
}

export async function resolveRecipeImageUrls<T extends { imageUrl: string | null }>(
  items: T[],
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      imageUrl: await resolveRecipeImageUrl(item.imageUrl),
    })),
  );
}
