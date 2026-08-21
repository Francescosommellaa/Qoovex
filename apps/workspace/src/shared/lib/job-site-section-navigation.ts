import type { JobSiteStatus } from "@qoovex/types";
import {
  jobSiteNotificationTargetFallbacks,
  type JobSiteNotificationTargetKind,
} from "@shared/lib/job-site-notification-destination";

export type JobSiteNavigationSection =
  | "overview"
  | "activities"
  | "decisions"
  | "payments"
  | "files"
  | "details"
  | "closure"
  | "archive";

export type JobSiteSectionTargets = Record<JobSiteNavigationSection, string>;

type PositionedJobSiteSection = { section: JobSiteNavigationSection; top: number };
type DeepLinkResolution = { missing: boolean; section: JobSiteNavigationSection; targetId: string };

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

export function resolveJobSiteDeepLink({ hash, hasTarget, sections, targets }: { hash: string; hasTarget: (id: string) => boolean; sections: readonly JobSiteNavigationSection[]; targets: JobSiteSectionTargets }): DeepLinkResolution | null {
  let targetId: string;
  try {
    targetId = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return null;
  }
  if (!targetId) return null;
  const directSection = sections.find((section) => targets[section] === targetId);
  if (directSection) return { missing: false, section: directSection, targetId };
  const unavailableSection = (Object.keys(targets) as JobSiteNavigationSection[]).find((section) => targets[section] === targetId);
  if (unavailableSection) {
    const fallbackSection = sections[0] ?? "overview";
    return { missing: true, section: fallbackSection, targetId: targets[fallbackSection] };
  }

  const targetKind = (Object.keys(jobSiteNotificationTargetFallbacks) as JobSiteNotificationTargetKind[])
    .find((kind) => targetId.startsWith(`${kind}-`));
  if (!targetKind) return null;
  const fallbackId = targetKind === "attachment" ? targets.files : jobSiteNotificationTargetFallbacks[targetKind];
  const fallbackSection = sections.find((section) => targets[section] === fallbackId) ?? sections[0] ?? "overview";
  return hasTarget(targetId)
    ? { missing: false, section: fallbackSection, targetId }
    : { missing: true, section: fallbackSection, targetId: targets[fallbackSection] };
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
