"use client";

import * as React from "react";
import { IconChevronLeft, IconChevronRight, IconMenu2 } from "@tabler/icons-react";
import { Button } from "#components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#components/sheet";
import { ThemeToggle } from "#components/theme-toggle";
import { cn } from "#lib/utils";

export type FloatingNavigationLink = {
  href: string;
  label: string;
};

export type FloatingNavigationSection = {
  id: string;
  label: string;
};

function navigationOffset() {
  const value = Number.parseFloat(
    window.getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  return Number.isFinite(value) ? value : 0;
}

function animatePageScroll(top: number, reduceMotion: boolean) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  const previousOverflowAnchor = root.style.overflowAnchor;
  const start = window.scrollY;
  const distance = top - start;
  let animationFrame = 0;
  let finished = false;

  root.style.scrollBehavior = "auto";
  root.style.overflowAnchor = "none";

  const cancel = () => {
    if (finished) return;
    finished = true;
    window.cancelAnimationFrame(animationFrame);
    root.style.scrollBehavior = previousScrollBehavior;
    root.style.overflowAnchor = previousOverflowAnchor;
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("pointerdown", cancel);
  };

  if (reduceMotion || Math.abs(distance) < 1) {
    window.scrollTo(0, top);
    cancel();
    return cancel;
  }

  const startedAt = performance.now();
  const duration = 460;
  const step = (time: number) => {
    const progress = Math.min((time - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, start + distance * eased);
    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(step);
    } else {
      animationFrame = window.requestAnimationFrame(() => {
        window.scrollTo(0, top);
        cancel();
      });
    }
  };

  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("pointerdown", cancel, { passive: true });
  animationFrame = window.requestAnimationFrame(step);
  return cancel;
}

export function FloatingNavigation({
  action,
  activeHref,
  brand,
  homeHref,
  sections = [],
  surfaceLabel = "Superfici",
  surfaceLinks,
}: {
  action?: React.ReactNode;
  activeHref?: string;
  brand: (compact: boolean) => React.ReactNode;
  homeHref: string;
  sections?: FloatingNavigationSection[];
  surfaceLabel?: string;
  surfaceLinks: FloatingNavigationLink[];
}) {
  const [compact, setCompact] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState(sections[0]?.id ?? "");
  const sentinelRef = React.useRef<HTMLSpanElement>(null);
  const cancelScrollRef = React.useRef<() => void>(() => undefined);

  const navigateToSection = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = document.getElementById(sectionId);
      if (!target) return;

      event.preventDefault();
      setMobileOpen(false);

      const hash = `#${sectionId}`;
      if (window.location.hash !== hash) {
        window.History.prototype.pushState.call(
          window.history,
          window.history.state,
          "",
          hash,
        );
      }
      const top = window.scrollY + target.getBoundingClientRect().top - navigationOffset();
      cancelScrollRef.current();
      cancelScrollRef.current = animatePageScroll(
        Math.max(0, top),
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    },
    [],
  );

  React.useEffect(() => () => cancelScrollRef.current(), []);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const compactObserver = new IntersectionObserver(([entry]) => {
      if (entry) setCompact(!entry.isIntersecting);
    });
    compactObserver.observe(sentinel);

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    let sectionFrame = 0;

    const updateActiveSection = () => {
      sectionFrame = 0;
      const readingLine = navigationOffset() + 1;
      let current = elements[0]?.id ?? "";

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= readingLine) current = element.id;
        else break;
      }

      const reachedPageEnd =
        Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 1;
      if (reachedPageEnd && elements.length > 0) current = elements[elements.length - 1]!.id;
      setActiveSection((previous) => (previous === current ? previous : current));
    };

    const scheduleSectionUpdate = () => {
      if (sectionFrame) return;
      sectionFrame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
    window.addEventListener("resize", scheduleSectionUpdate, { passive: true });

    return () => {
      compactObserver.disconnect();
      window.cancelAnimationFrame(sectionFrame);
      window.removeEventListener("scroll", scheduleSectionUpdate);
      window.removeEventListener("resize", scheduleSectionUpdate);
    };
  }, [sections]);

  const activeLabel = sections.find((section) => section.id === activeSection)?.label;
  const activeSectionIndex = sections.findIndex((section) => section.id === activeSection);
  const previousSection = activeSectionIndex > 0 ? sections[activeSectionIndex - 1] : undefined;
  const nextSection = activeSectionIndex >= 0 ? sections[activeSectionIndex + 1] : undefined;
  const showSections = compact && sections.length > 0;

  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-12 w-px"
        ref={sentinelRef}
      />
      <header className="pointer-events-none sticky top-0 z-40 h-20 px-3 pt-3">
        <div
          className={cn(
            "pointer-events-auto mx-auto flex items-center gap-2 border bg-background/80 shadow-sm backdrop-blur-xl transition-[max-width,height,border-radius,padding,box-shadow] duration-300 ease-out supports-[backdrop-filter]:bg-background/70",
            compact
              ? "h-12 max-w-4xl rounded-full px-2.5 shadow-md sm:px-3"
              : "h-14 max-w-7xl rounded-2xl px-3 sm:px-4",
          )}
        >
          <a className="flex shrink-0 items-center rounded-md" href={homeHref}>
            {brand(compact)}
          </a>

          {showSections && activeLabel ? (
            <nav
              aria-label="Sezioni vicine"
              className="floating-navigation__mobile-sections mx-auto flex min-w-0 flex-1 items-center justify-center gap-1 md:hidden"
            >
              {previousSection ? (
                <a
                  aria-label={`Sezione precedente: ${previousSection.label}`}
                  className="floating-navigation__mobile-adjacent min-w-0 max-w-20 items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  data-link="plain"
                  href={`#${previousSection.id}`}
                  onClick={(event) => navigateToSection(event, previousSection.id)}
                >
                  <IconChevronLeft aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate">{previousSection.label}</span>
                </a>
              ) : null}
              <a
                aria-current="location"
                className="max-w-24 shrink-0 truncate rounded-full bg-secondary px-3 py-1.5 text-xs font-medium"
                data-link="plain"
                href={`#${activeSection}`}
                onClick={(event) => navigateToSection(event, activeSection)}
              >
                {activeLabel}
              </a>
              {nextSection ? (
                <a
                  aria-label={`Sezione successiva: ${nextSection.label}`}
                  className="floating-navigation__mobile-adjacent min-w-0 max-w-20 items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  data-link="plain"
                  href={`#${nextSection.id}`}
                  onClick={(event) => navigateToSection(event, nextSection.id)}
                >
                  <span className="truncate">{nextSection.label}</span>
                  <IconChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
                </a>
              ) : null}
            </nav>
          ) : null}

          <nav
            aria-label={showSections ? "Sezioni della pagina" : "Navigazione principale"}
            className="mx-auto hidden min-w-0 items-center gap-1 md:flex"
          >
            {(showSections ? sections.map((section) => ({ href: `#${section.id}`, label: section.label })) : surfaceLinks).map(
              (link) => {
                const active = showSections ? link.href === `#${activeSection}` : link.href === activeHref;
                const sectionId = showSections
                  ? link.href.slice(1)
                  : link.href.startsWith("/#")
                    ? link.href.slice(2)
                    : null;
                return (
                  <a
                    aria-current={active ? (showSections ? "location" : "page") : undefined}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      active && "bg-foreground text-background hover:bg-foreground hover:text-background",
                    )}
                    href={link.href}
                    key={link.href}
                    onClick={sectionId ? (event) => navigateToSection(event, sectionId) : undefined}
                  >
                    {link.label}
                  </a>
                );
              },
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <ThemeToggle />
            {action}
            <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    aria-label="Apri navigazione"
                    className="md:hidden"
                    size="icon"
                    variant="ghost"
                  />
                }
              >
                <IconMenu2 />
              </SheetTrigger>
              <SheetContent className="w-[min(22rem,calc(100vw-1rem))]">
                <SheetHeader>
                  <SheetTitle>{brand(false)}</SheetTitle>
                  <SheetDescription>Naviga tra sezioni e destinazioni disponibili.</SheetDescription>
                </SheetHeader>
                {sections.length > 0 ? (
                  <nav aria-label="Sezioni della pagina" className="grid gap-1 px-4">
                    <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">In questa pagina</p>
                    {sections.map((section) => (
                      <a
                        aria-current={section.id === activeSection ? "location" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                          section.id === activeSection && "bg-accent",
                        )}
                        href={`#${section.id}`}
                        key={section.id}
                        onClick={(event) => navigateToSection(event, section.id)}
                      >
                        {section.label}
                      </a>
                    ))}
                  </nav>
                ) : null}
                <nav aria-label={surfaceLabel} className="grid gap-1 px-4">
                  <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{surfaceLabel}</p>
                  {surfaceLinks.map((link) => (
                    <a
                      aria-current={link.href === activeHref ? "page" : undefined}
                      className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                      href={link.href}
                      key={link.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
