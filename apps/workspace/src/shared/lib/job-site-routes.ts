const JOB_SITE_SLUG_SEPARATOR = "--";
const MAX_JOB_SITE_SLUG_LENGTH = 80;

function jobSiteNameSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_JOB_SITE_SLUG_LENGTH)
    .replace(/-+$/g, "") || "cantiere";
}

export function jobSiteRouteSlug(jobSite: { id: string; name: string }) {
  return `${jobSiteNameSlug(jobSite.name)}${JOB_SITE_SLUG_SEPARATOR}${jobSite.id}`;
}

export function jobSiteRouteId(routeParam: string) {
  const separatorIndex = routeParam.lastIndexOf(JOB_SITE_SLUG_SEPARATOR);
  return separatorIndex >= 0 ? routeParam.slice(separatorIndex + JOB_SITE_SLUG_SEPARATOR.length) : routeParam;
}

export function jobSiteDetailsHref(jobSite: { id: string; name: string }, query?: URLSearchParams) {
  const pathname = `/job-sites/${encodeURIComponent(jobSiteRouteSlug(jobSite))}`;
  const search = query?.toString();
  return search ? `${pathname}?${search}` : pathname;
}
