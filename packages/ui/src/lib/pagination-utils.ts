export function pageHref(
  baseHref: string,
  page: number,
  searchParams?: Record<string, string>,
): string {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `${baseHref}?${params.toString()}`;
}

export function parsePage(
  value: string | undefined,
  defaultPage = 1,
): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 10_000 ? Math.floor(n) : defaultPage;
}
