export interface WorkspaceBreadcrumbItem {
  label: string;
  href?: string;
  className?: string;
  mobileBehavior?: "back" | "hidden";
  mobileLabel?: string;
  separatorClassName?: string;
}

interface WorkspaceBreadcrumbInput {
  fallbackLabel: string;
  pageLabel: string | null;
  pathname: string;
  sectionLabel: string | null;
}

const organizationJobSitePath = /^\/job-sites\/[^/]+$/;
const clientJobSitePath = /^\/client\/job-sites\/[^/]+$/;
const settingsAreaPaths = [
  "/settings/organization-profile",
  "/people/access",
  "/payment-profile",
  "/account/notifications",
  "/audit-log",
  "/data-control",
] as const;

function currentItem(label: string): WorkspaceBreadcrumbItem {
  return { label, className: "min-w-0 flex-1" };
}

function jobSiteItems({ areaHref, areaLabel, jobSiteLabel, pathname, sectionLabel }: { areaHref: string; areaLabel: string; jobSiteLabel: string; pathname: string; sectionLabel: string | null }): WorkspaceBreadcrumbItem[] {
  if (!sectionLabel || sectionLabel === "Panoramica") return [
    { label: areaLabel, href: areaHref, className: "shrink-0", mobileBehavior: "back" },
    { label: jobSiteLabel, className: "min-w-0 flex-1" },
  ];
  return [
    { label: areaLabel, href: areaHref, className: "shrink-0", mobileBehavior: "hidden" },
    { label: jobSiteLabel, href: pathname, className: "shrink-0", mobileBehavior: "back", separatorClassName: "max-sm:hidden" },
    { label: sectionLabel, className: "min-w-0 flex-1", mobileLabel: `${jobSiteLabel} · ${sectionLabel}` },
  ];
}

export function buildWorkspaceBreadcrumb({ fallbackLabel, pageLabel, pathname, sectionLabel }: WorkspaceBreadcrumbInput): WorkspaceBreadcrumbItem[] {
  if (pathname === "/") return [currentItem("Panoramica")];
  if (pathname === "/job-sites") return [currentItem("Cantieri")];
  if (pathname === "/client") return [currentItem("I tuoi lavori")];

  if (organizationJobSitePath.test(pathname)) {
    return jobSiteItems({ areaHref: "/job-sites", areaLabel: "Cantieri", jobSiteLabel: pageLabel ?? "Cantiere", pathname, sectionLabel });
  }
  if (clientJobSitePath.test(pathname)) {
    return jobSiteItems({ areaHref: "/client", areaLabel: "Lavori", jobSiteLabel: pageLabel ?? "Lavoro", pathname, sectionLabel });
  }

  const label = pageLabel ?? fallbackLabel;
  if (pathname !== "/settings" && settingsAreaPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return [
      { label: "Azienda e impostazioni", href: "/settings", className: "shrink-0", mobileBehavior: "back" },
      currentItem(label),
    ];
  }
  return [currentItem(label)];
}
