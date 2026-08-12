"use client";

import type { MouseEvent } from "react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { focusVisibleTarget } from "@shared/lib/focus-management";

function sectionLabel(section: string) {
  return section[0]!.toUpperCase() + section.slice(1);
}

function focusSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.tabIndex = -1;
  target.dataset.focusRefreshFallback = "true";
  target.classList.add("scroll-mt-20", "outline-none", "focus-visible:ring-2", "focus-visible:ring-ring");
  focusVisibleTarget(target, { block: "start" });
}

export function JobSiteSectionNavigation({ sections }: { sections: readonly string[] }) {
  function handleSectionNavigation(event: MouseEvent<HTMLAnchorElement>, section: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.replaceState(null, "", `#${section}`);
    focusSection(section);
  }

  return (
    <nav aria-label="Sezioni cantiere" className="flex gap-2 overflow-x-auto pb-1">
      {sections.map((section) => (
        <a className={buttonVariants({ variant: "outline", size: "sm" })} href={`#${section}`} key={section} onClick={(event) => handleSectionNavigation(event, section)}>
          {sectionLabel(section)}
        </a>
      ))}
    </nav>
  );
}
