"use client";

import * as React from "react";
import { IconMenu2 } from "@tabler/icons-react";
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
    const sectionObserver = new IntersectionObserver(
      () => {
        const readingLine = Math.min(window.innerHeight * 0.28, 240);
        let current = sections[0]?.id ?? "";
        for (const element of elements) {
          if (element.getBoundingClientRect().top <= readingLine) current = element.id;
        }
        setActiveSection((previous) => (previous === current ? previous : current));
      },
      { rootMargin: "0px 0px -72% 0px" },
    );
    for (const element of elements) sectionObserver.observe(element);

    return () => {
      compactObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [sections]);

  const activeLabel = sections.find((section) => section.id === activeSection)?.label;
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
          <a className="shrink-0 rounded-md" href={homeHref}>
            {brand(compact)}
          </a>

          {showSections && activeLabel ? (
            <a
              className="mx-auto max-w-36 truncate rounded-full bg-secondary px-3 py-1.5 text-xs font-medium md:hidden"
              href={`#${activeSection}`}
            >
              {activeLabel}
            </a>
          ) : null}

          <nav
            aria-label={showSections ? "Sezioni della pagina" : "Navigazione principale"}
            className="mx-auto hidden min-w-0 items-center gap-1 md:flex"
          >
            {(showSections ? sections.map((section) => ({ href: `#${section.id}`, label: section.label })) : surfaceLinks).map(
              (link) => {
                const active = showSections ? link.href === `#${activeSection}` : link.href === activeHref;
                return (
                  <a
                    aria-current={active ? (showSections ? "location" : "page") : undefined}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      active && "bg-foreground text-background hover:bg-foreground hover:text-background",
                    )}
                    href={link.href}
                    key={link.href}
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
                        onClick={() => setMobileOpen(false)}
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
