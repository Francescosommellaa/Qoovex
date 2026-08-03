const DOCUMENT_SLUG_SEPARATOR = "--";
const MAX_DOCUMENT_SLUG_LENGTH = 80;

function titleSlug(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_DOCUMENT_SLUG_LENGTH)
    .replace(/-+$/g, "") || "documento";
}

export function documentRouteSlug(document: { id: string; title: string }) {
  return `${titleSlug(document.title)}${DOCUMENT_SLUG_SEPARATOR}${document.id}`;
}

export function documentRouteId(routeParam: string) {
  const separatorIndex = routeParam.lastIndexOf(DOCUMENT_SLUG_SEPARATOR);
  return separatorIndex >= 0 ? routeParam.slice(separatorIndex + DOCUMENT_SLUG_SEPARATOR.length) : routeParam;
}

export function documentDetailsHref(document: { id: string; title: string }, query?: URLSearchParams) {
  const pathname = `/documents/${encodeURIComponent(documentRouteSlug(document))}`;
  const search = query?.toString();
  return search ? `${pathname}?${search}` : pathname;
}
