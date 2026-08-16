"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
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
type PositionedJobSiteSection = { section: JobSiteNavigationSection; top: number };

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

export function resolveActiveJobSiteNavigationSection({ activationLine, atEnd, fallback, positions }: { activationLine: number; atEnd: boolean; fallback: JobSiteNavigationSection; positions: readonly PositionedJobSiteSection[] }) {
  const orderedPositions = [...positions].sort((left, right) => left.top - right.top);
  if (atEnd) return orderedPositions.at(-1)?.section ?? fallback;
  let current = fallback;
  for (const position of orderedPositions) {
    if (position.top > activationLine) break;
    current = position.section;
  }
  return current;
}

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
  const [activeSection, setActiveSection] = useState<JobSiteNavigationSection>(sections[0] ?? "overview");
  const navigationRef = useRef<HTMLElement>(null);
  const pendingSelectFocusRef = useRef<JobSiteNavigationSection | null>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById("workspace-main-content");
    if (!scrollContainer || !sections.length) return;
    const container = scrollContainer;

    const sectionByTarget = new Map(sections.map((section) => [targets[section], section]));
    let frame: number | null = null;

    function updateActiveSection() {
      frame = null;
      const navigationHeight = navigationRef.current?.getBoundingClientRect().height ?? 0;
      const containerRect = container.getBoundingClientRect();
      const activationLine = containerRect.top + navigationHeight + 16;
      const fallback = sections[0] ?? "overview";
      const positionedSections = sections
        .map((section) => ({ section, target: document.getElementById(targets[section]) }))
        .filter((entry): entry is { section: JobSiteNavigationSection; target: HTMLElement } => Boolean(entry.target))
        .map((entry) => ({ section: entry.section, top: entry.target.getBoundingClientRect().top }));
      setActiveSection(resolveActiveJobSiteNavigationSection({
        activationLine,
        atEnd: container.scrollTop + container.clientHeight >= container.scrollHeight - 2,
        fallback,
        positions: positionedSections,
      }));
    }

    function scheduleUpdate() {
      if (frame !== null) return;
      frame = requestAnimationFrame(updateActiveSection);
    }

    function syncHash() {
      const section = sectionByTarget.get(window.location.hash.slice(1));
      if (section) setActiveSection(section);
      scheduleUpdate();
    }

    syncHash();
    container.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [sections, targets]);

  function navigateToSection(section: JobSiteNavigationSection, focus = true) {
    const sectionId = targets[section];
    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSection(section);
    if (focus) focusSection(sectionId);
  }

  function handleSectionNavigation(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const section = sections.find((candidate) => targets[candidate] === sectionId);
    if (section) navigateToSection(section);
  }

  return (
    <nav
      aria-label="Sezioni cantiere"
      className="sticky top-0 z-20 -mx-3 border-y border-border/80 bg-background/95 px-3 py-2 backdrop-blur-sm [&~section[id]]:scroll-mt-24 sm:-mx-4 sm:px-4 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
      ref={navigationRef}
    >
      <div className="md:hidden">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Sezione corrente</span>
        <Select
          items={sections.map((section) => ({ label: sectionLabels[section], value: section }))}
          onOpenChange={(open) => {
            const section = pendingSelectFocusRef.current;
            if (open || !section) return;
            pendingSelectFocusRef.current = null;
            requestAnimationFrame(() => focusSection(targets[section]));
          }}
          onValueChange={(value) => {
            if (!value || !sections.includes(value as JobSiteNavigationSection)) return;
            pendingSelectFocusRef.current = value as JobSiteNavigationSection;
            navigateToSection(value as JobSiteNavigationSection, false);
          }}
          value={activeSection}
        >
          <SelectTrigger aria-label="Sezione corrente del cantiere" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent align="start"><SelectGroup>{sections.map((section) => <SelectItem key={section} value={section}>{sectionLabels[section]}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </div>
      <div className="hidden flex-wrap gap-2 md:flex">
        {sections.map((section) => (
          <a
            aria-current={activeSection === section ? "location" : undefined}
            className={buttonVariants({ className: activeSection === section ? "bg-accent font-semibold shadow-none" : undefined, variant: "outline", size: "sm" })}
            href={`#${targets[section]}`}
            key={section}
            onClick={(event) => handleSectionNavigation(event, targets[section])}
          >
            {sectionLabels[section]}
          </a>
        ))}
      </div>
    </nav>
  );
}
