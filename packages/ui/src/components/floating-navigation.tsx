"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
} from "@tabler/icons-react";
import { Button } from "#components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/dropdown-menu";
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
  description?: string;
  icon?: React.ReactNode;
};

export type FloatingNavigationSection = {
  id: string;
  label: string;
};

type FocusIndicator = {
  height: number;
  visible: boolean;
  x: number;
  y: number;
  width: number;
};

const hiddenFocus: FocusIndicator = {
  height: 0,
  visible: false,
  width: 0,
  x: 0,
  y: 0,
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

function NavigationLinks({
  activeHref,
  links,
  onNavigateToSection,
  resourceLabel,
  resourceLinks,
  sectionMode,
}: {
  activeHref?: string;
  links: FloatingNavigationLink[];
  onNavigateToSection: (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => void;
  resourceLabel: string;
  resourceLinks: FloatingNavigationLink[];
  sectionMode: boolean;
}) {
  const navRef = React.useRef<HTMLElement>(null);
  const resourceContentRef = React.useRef<HTMLDivElement>(null);
  const resourceCloseTimerRef = React.useRef<number | null>(null);
  const resourceTriggerRef = React.useRef<HTMLSpanElement>(null);
  const [navFocus, setNavFocus] = React.useState(hiddenFocus);
  const [resourceFocus, setResourceFocus] = React.useState(hiddenFocus);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);

  const clearResourceCloseTimer = React.useCallback(() => {
    if (resourceCloseTimerRef.current === null) return;
    window.clearTimeout(resourceCloseTimerRef.current);
    resourceCloseTimerRef.current = null;
  }, []);

  React.useEffect(() => clearResourceCloseTimer, [clearResourceCloseTimer]);

  const moveNavFocus = React.useCallback((element: HTMLElement) => {
    const nav = navRef.current;
    if (!nav) return;
    const navRect = nav.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    setNavFocus({
      height: elementRect.height,
      visible: true,
      width: elementRect.width,
      x: elementRect.left - navRect.left,
      y: elementRect.top - navRect.top,
    });
  }, []);

  const moveResourceFocus = React.useCallback((element: HTMLElement) => {
    const content = resourceContentRef.current;
    if (!content) return;
    const contentRect = content.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    setResourceFocus({
      height: elementRect.height,
      visible: true,
      width: elementRect.width,
      x: elementRect.left - contentRect.left,
      y: elementRect.top - contentRect.top,
    });
  }, []);

  const openResources = React.useCallback(() => {
    clearResourceCloseTimer();
    setResourcesOpen(true);
  }, [clearResourceCloseTimer]);

  const scheduleResourceClose = React.useCallback(() => {
    if (resourceCloseTimerRef.current !== null) return;
    resourceCloseTimerRef.current = window.setTimeout(() => {
      resourceCloseTimerRef.current = null;
      setResourcesOpen(false);
      setResourceFocus((previous) => ({ ...previous, visible: false }));
      setNavFocus((previous) => ({ ...previous, visible: false }));
    }, 120);
  }, []);

  React.useEffect(() => {
    if (!resourcesOpen) return;

    const trackResourcePointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const pointedElement = document.elementFromPoint(event.clientX, event.clientY);
      const insideTrigger =
        pointedElement !== null && resourceTriggerRef.current?.contains(pointedElement);
      const insideContent =
        pointedElement !== null && resourceContentRef.current?.contains(pointedElement);

      if (insideTrigger || insideContent) clearResourceCloseTimer();
      else scheduleResourceClose();
    };

    document.addEventListener("pointermove", trackResourcePointer, { passive: true });
    return () => document.removeEventListener("pointermove", trackResourcePointer);
  }, [clearResourceCloseTimer, resourcesOpen, scheduleResourceClose]);

  React.useEffect(() => {
    if (!sectionMode) return;
    clearResourceCloseTimer();
    setResourcesOpen(false);
    setResourceFocus((previous) => ({ ...previous, visible: false }));
    setNavFocus((previous) => ({ ...previous, visible: false }));
  }, [clearResourceCloseTimer, sectionMode]);

  const navFocusStyle: React.CSSProperties = {
    height: navFocus.height,
    opacity: navFocus.visible ? 1 : 0,
    transform: `translate3d(${navFocus.x}px, ${navFocus.y}px, 0)`,
    width: navFocus.width,
  };
  const resourceFocusStyle: React.CSSProperties = {
    height: resourceFocus.height,
    opacity: resourceFocus.visible ? 1 : 0,
    transform: `translate3d(${resourceFocus.x}px, ${resourceFocus.y}px, 0)`,
    width: resourceFocus.width,
  };

  return (
    <nav
      aria-label={sectionMode ? "Sezioni della pagina" : "Navigazione principale"}
      className="relative flex items-center gap-1 animate-in fade-in-0 zoom-in-95 duration-200"
      onBlur={(event) => {
        if (
          resourcesOpen ||
          (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
        ) {
          return;
        }
        setNavFocus((previous) => ({ ...previous, visible: false }));
      }}
      onMouseLeave={() => {
        if (!resourcesOpen) {
          setNavFocus((previous) => ({ ...previous, visible: false }));
        }
      }}
      ref={navRef}
    >
      <span
        aria-hidden="true"
        className="floating-navigation__focus-indicator"
        style={navFocusStyle}
      />
      {links.map((link) => {
        const active = sectionMode
          ? link.href === activeHref
          : link.href.split("#")[0] === activeHref;
        const sectionId = sectionMode
          ? link.href.slice(1)
          : link.href.startsWith("/#")
            ? link.href.slice(2)
            : null;

        return (
          <a
            aria-current={active ? (sectionMode ? "location" : "page") : undefined}
            className={cn(
              "relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
              active && "bg-foreground text-background hover:text-background focus-visible:text-background",
            )}
            data-link="plain"
            href={link.href}
            key={link.href}
            onClick={sectionId ? (event) => onNavigateToSection(event, sectionId) : undefined}
            onFocus={(event) => moveNavFocus(event.currentTarget)}
            onMouseEnter={(event) => moveNavFocus(event.currentTarget)}
          >
            {link.label}
          </a>
        );
      })}

      {!sectionMode && resourceLinks.length > 0 ? (
        <DropdownMenu
          onOpenChange={(open) => {
            clearResourceCloseTimer();
            setResourcesOpen(open);
            if (!open) {
              setResourceFocus((previous) => ({ ...previous, visible: false }));
            }
          }}
          open={resourcesOpen}
        >
          <span
            className="relative z-10"
            onMouseMove={(event) => {
              const trigger = event.currentTarget.querySelector("button");
              if (trigger) moveNavFocus(trigger);
              openResources();
            }}
            onMouseLeave={scheduleResourceClose}
            ref={resourceTriggerRef}
          >
            <DropdownMenuTrigger
              onFocus={(event) => moveNavFocus(event.currentTarget)}
              render={
                <button
                  className="group/resources relative z-10 flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                  data-link="plain"
                  type="button"
                />
              }
            >
              {resourceLabel}
              <IconChevronDown
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-data-popup-open/resources:rotate-180"
              />
            </DropdownMenuTrigger>
          </span>
          <DropdownMenuContent
            align="center"
            className="floating-navigation__resource-menu w-80 rounded-2xl p-2 duration-200"
            onBlur={(event) => {
              if (
                event.relatedTarget instanceof Node &&
                event.currentTarget.contains(event.relatedTarget)
              ) {
                return;
              }
              setResourceFocus((previous) => ({ ...previous, visible: false }));
            }}
            onMouseEnter={clearResourceCloseTimer}
            onMouseLeave={scheduleResourceClose}
            ref={resourceContentRef}
            sideOffset={10}
          >
            <span
              aria-hidden="true"
              className="floating-navigation__resource-focus"
              style={resourceFocusStyle}
            />
            {resourceLinks.map((link) => (
              <DropdownMenuItem
                className="relative z-10 min-h-14 gap-3 rounded-xl px-3 py-2 focus:bg-transparent"
                key={link.href}
                onFocus={(event) => moveResourceFocus(event.currentTarget)}
                onMouseEnter={(event) => moveResourceFocus(event.currentTarget)}
                render={<a data-link="plain" href={link.href} />}
              >
                {link.icon ? (
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background text-foreground shadow-xs">
                    {link.icon}
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{link.label}</span>
                  {link.description ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {link.description}
                    </span>
                  ) : null}
                </span>
                <IconChevronRight
                  aria-hidden="true"
                  className="ml-auto size-4 text-muted-foreground"
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  );
}

export function FloatingNavigation({
  action,
  activeHref,
  brand,
  desktopBreakpoint = "md",
  homeHref,
  resourceLabel = "Risorse",
  resourceLinks = [],
  sections = [],
  surfaceLabel = "Superfici",
  surfaceLinks,
}: {
  action?: React.ReactNode;
  activeHref?: string;
  brand: (compact: boolean) => React.ReactNode;
  /**
   * Breakpoint a cui la barra orizzontale sostituisce il menu hamburger.
   * Usa "lg" quando i link sono numerosi/lunghi e a "md" non c'è spazio.
   */
  desktopBreakpoint?: "md" | "lg";
  homeHref: string;
  resourceLabel?: string;
  resourceLinks?: FloatingNavigationLink[];
  sections?: FloatingNavigationSection[];
  surfaceLabel?: string;
  surfaceLinks: FloatingNavigationLink[];
}) {
  const [compact, setCompact] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState(sections[0]?.id ?? "");
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
    if (sections.length === 0) {
      setCompact(false);
      return;
    }

    const directionThreshold = 10;
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let scrollFrame = 0;

    setCompact(lastScrollY > 48);

    const updateNavigationMode = () => {
      scrollFrame = 0;
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;

      if (nextScrollY <= 24) {
        accumulatedDelta = 0;
        setCompact(false);
        return;
      }
      if (Math.abs(delta) < 0.5) return;

      if (Math.sign(delta) !== Math.sign(accumulatedDelta)) accumulatedDelta = delta;
      else accumulatedDelta += delta;

      if (accumulatedDelta >= directionThreshold) {
        setCompact(true);
        accumulatedDelta = 0;
      } else if (accumulatedDelta <= -directionThreshold) {
        setCompact(false);
        accumulatedDelta = 0;
      }
    };

    const scheduleNavigationModeUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateNavigationMode);
    };

    window.addEventListener("scroll", scheduleNavigationModeUpdate, { passive: true });
    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", scheduleNavigationModeUpdate);
    };
  }, [sections.length]);

  React.useEffect(() => {
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
  const desktopLinks = showSections
    ? sections.map((section) => ({ href: `#${section.id}`, label: section.label }))
    : surfaceLinks;

  // Classi literali (necessarie perché Tailwind rileva solo stringhe complete).
  const isLg = desktopBreakpoint === "lg";
  const desktopNavVisibility = isLg ? "hidden lg:block" : "hidden md:block";
  const belowDesktopVisibility = isLg ? "lg:hidden" : "md:hidden";

  return (
    <header className="pointer-events-none sticky top-0 z-40 h-20 px-3 pt-3">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex items-center gap-2 border bg-background/80 shadow-sm backdrop-blur-xl transition-[max-width,height,border-radius,padding,box-shadow] duration-300 ease-out supports-[backdrop-filter]:bg-background/70",
          compact
            ? "h-12 max-w-4xl rounded-full px-2.5 shadow-md sm:px-3"
            : "h-14 max-w-7xl rounded-2xl px-3 sm:px-4",
        )}
        data-navigation-mode={showSections ? "sections" : "marketing"}
      >
        <a className="flex shrink-0 items-center rounded-md" data-link="plain" href={homeHref}>
          {brand(compact)}
        </a>

        {showSections && activeLabel ? (
          <nav
            aria-label="Sezioni vicine"
            className={cn(
              "floating-navigation__mobile-sections mx-auto flex min-w-0 flex-1 items-center justify-center gap-1 animate-in fade-in-0 zoom-in-95 duration-200",
              belowDesktopVisibility,
            )}
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

        <div className={cn("mx-auto min-w-0", desktopNavVisibility)}>
          <NavigationLinks
            activeHref={showSections ? `#${activeSection}` : activeHref}
            links={desktopLinks}
            onNavigateToSection={navigateToSection}
            resourceLabel={resourceLabel}
            resourceLinks={showSections ? [] : resourceLinks}
            sectionMode={showSections}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <ThemeToggle />
          {action}
          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger
              render={
                <Button
                  aria-label="Apri navigazione"
                  className={belowDesktopVisibility}
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
                  <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                    In questa pagina
                  </p>
                  {sections.map((section) => (
                    <a
                      aria-current={section.id === activeSection ? "location" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                        section.id === activeSection && "bg-accent",
                      )}
                      data-link="plain"
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
                <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                  {surfaceLabel}
                </p>
                {surfaceLinks.map((link) => (
                  <a
                    aria-current={link.href === activeHref ? "page" : undefined}
                    className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                    data-link="plain"
                    href={link.href}
                    key={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              {resourceLinks.length > 0 ? (
                <nav aria-label={resourceLabel} className="grid gap-1 px-4">
                  <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                    {resourceLabel}
                  </p>
                  {resourceLinks.map((link) => (
                    <a
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                      data-link="plain"
                      href={link.href}
                      key={link.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </nav>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
