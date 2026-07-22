const WORKER_SLUG_SEPARATOR = "--";
const MAX_WORKER_SLUG_LENGTH = 80;

function displayNameSlug(displayName: string) {
  return displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_WORKER_SLUG_LENGTH)
    .replace(/-+$/g, "") || "lavoratore";
}

export function workerRouteSlug(worker: { id: string; displayName: string }) {
  return `${displayNameSlug(worker.displayName)}${WORKER_SLUG_SEPARATOR}${worker.id}`;
}

export function workerRouteId(routeParam: string) {
  const separatorIndex = routeParam.lastIndexOf(WORKER_SLUG_SEPARATOR);
  return separatorIndex >= 0 ? routeParam.slice(separatorIndex + WORKER_SLUG_SEPARATOR.length) : routeParam;
}

export function workerDetailsHref(worker: { id: string; displayName: string }, query?: URLSearchParams) {
  const pathname = `/workers/${encodeURIComponent(workerRouteSlug(worker))}`;
  const search = query?.toString();
  return search ? `${pathname}?${search}` : pathname;
}
