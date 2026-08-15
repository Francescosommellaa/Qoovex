"use client";

import type { MouseEvent } from "react";
import { buttonVariants } from "@qoovex/ui/components/button";
import type { JobSiteStatus } from "@qoovex/types";
import { focusVisibleTarget } from "@shared/lib/focus-management";

const sectionLabels = {
  overview: "Panoramica",
  activities: "Attività",
  decisions: "Decisioni",
  payments: "Pagamenti",
  files: "File",
  details: "Dettagli",
  closure: "Chiusura",
  archive: "Archivio",
} as const;

export type JobSiteNavigationSection = keyof typeof sectionLabels;
type JobSiteSectionTargets = Record<JobSiteNavigationSection, string>;

export const organizationJobSiteSectionTargets: JobSiteSectionTargets = {
  overview: "riepilogo",
  activities: "timeline",
  decisions: "decisioni",
  payments: "pagamenti",
  files: "file",
  details: "persone",
  closure: "chiusura",
  archive: "archivio",
};

export const clientJobSiteSectionTargets: JobSiteSectionTargets = {
  overview: "riepilogo",
  activities: "timeline",
  decisions: "decisioni",
  payments: "pagamenti",
  files: "documenti",
  details: "persone",
  closure: "chiusura",
  archive: "archivio",
};

const operationalNavigationSections: JobSiteNavigationSection[] = ["overview", "activities", "decisions", "payments", "files", "details"];

function isPostClosure(status: JobSiteStatus) {
  return status === "CLOSED" || status === "ARCHIVED";
}

export function getOrganizationJobSiteNavigationSections({ hasClosure, status }: { hasClosure: boolean; status: JobSiteStatus }): JobSiteNavigationSection[] {
  if (isPostClosure(status)) return [...operationalNavigationSections, "archive"];
  return [...operationalNavigationSections, ...(status === "ACTIVE" || hasClosure ? ["closure" as const] : [])];
}

export function getClientJobSiteNavigationSections({ hasClosure, status }: { hasClosure: boolean; status: JobSiteStatus }): JobSiteNavigationSection[] {
  if (status === "PENDING_INITIAL_CONFIRMATION") return ["overview"];
  if (isPostClosure(status)) return [...operationalNavigationSections, "archive"];
  return [...operationalNavigationSections, ...(hasClosure ? ["closure" as const] : [])];
}

function focusSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.tabIndex = -1;
  target.dataset.focusRefreshFallback = "true";
  target.classList.add("scroll-mt-20", "outline-none", "focus-visible:ring-2", "focus-visible:ring-ring");
  focusVisibleTarget(target, { block: "start" });
}

export function JobSiteSectionNavigation({ sections, targets }: { sections: readonly JobSiteNavigationSection[]; targets: JobSiteSectionTargets }) {
  function handleSectionNavigation(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.replaceState(null, "", `#${sectionId}`);
    focusSection(sectionId);
  }

  return (
    <nav aria-label="Sezioni cantiere" className="flex gap-2 overflow-x-auto pb-1">
      {sections.map((section) => (
        <a className={buttonVariants({ variant: "outline", size: "sm" })} href={`#${targets[section]}`} key={section} onClick={(event) => handleSectionNavigation(event, targets[section])}>
          {sectionLabels[section]}
        </a>
      ))}
    </nav>
  );
}
