"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CaretDown,
  List,
  X,
} from "@phosphor-icons/react";
import { Box, Button, Icon, Stack, Text } from "@qoovex/ui";
import { workspaceSignInHref, workspaceSignUpHref } from "@/shared/workspace-url";
const scrollDirectionThreshold = 4;
const topbarHideOffset = 24;

function getScrollY() {
  return Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
    0,
  );
}

function getScrollYFromEvent(event: Event) {
  const eventTarget = event.target;

  if (eventTarget instanceof Element) {
    return Math.max(eventTarget.scrollTop, getScrollY());
  }

  return getScrollY();
}

const mainNavItems = [
  { href: "/product", label: "Prodotto" },
  { href: "/pricing", label: "Prezzi" },
  { href: "/enterprise", label: "Azienda" },
] as const;

const resourceLinks = [
  { href: "/resources", label: "Tutte le risorse", description: "Guide e materiali utili" },
  { href: "/resources#community", label: "Community", description: "Ricette e idee da altri professionisti" },
  { href: "/resources#documents", label: "Documenti", description: "Allergeni, menu e organizzazione" },
  { href: "/resources#guides", label: "Guide", description: "Come mettere ordine nei processi" },
] as const;

function ResourceDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={isOpen}
        aria-controls="site-resources-menu"
        onClick={() => setIsOpen((current) => !current)}
        iconRight={<Icon icon={CaretDown} size="xs" weight="bold" />}
        className="px-(--spacing-2)"
      >
        Risorse
      </Button>

      <div
        id="site-resources-menu"
        className={
          isOpen
            ? "absolute left-1/2 top-full z-(--z-dropdown) w-[20rem] -translate-x-1/2 pt-(--spacing-2) opacity-100"
            : "pointer-events-none absolute left-1/2 top-full z-(--z-dropdown) w-[20rem] -translate-x-1/2 pt-(--spacing-2) opacity-0"
        }
      >
        <Box radius="xl" border="subtle" surface="surface" shadow="sm" padding="2">
          <Stack gap="1">
            {resourceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-(--radius-lg) p-(--spacing-3) no-underline transition-colors hover:bg-(--color-surface-2)">
                <Stack gap="1">
                  <Text as="span" size="sm" weight="semibold">
                    {item.label}
                  </Text>
                  <Text as="span" size="xs" tone="muted" leading="snug">
                    {item.description}
                  </Text>
                </Stack>
              </Link>
            ))}
          </Stack>
        </Box>
      </div>
    </div>
  );
}

export function SiteTopbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const visualAnimationFrameRef = useRef<number | null>(null);
  const scrollCheckIntervalRef = useRef<number | null>(null);
  const scrollSentinelRef = useRef<HTMLDivElement | null>(null);
  const lastSentinelTopRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    lastScrollYRef.current = getScrollY();
    lastSentinelTopRef.current = scrollSentinelRef.current?.getBoundingClientRect().top ?? null;

    const updateTopbarVisibilityFromSentinel = () => {
      const sentinelTop = scrollSentinelRef.current?.getBoundingClientRect().top;

      if (sentinelTop === undefined) {
        return;
      }

      const previousSentinelTop = lastSentinelTopRef.current;
      lastSentinelTopRef.current = sentinelTop;

      if (previousSentinelTop === null) {
        return;
      }

      const visualDelta = sentinelTop - previousSentinelTop;

      if (sentinelTop >= topbarHideOffset) {
        setIsHidden(false);
      } else if (visualDelta < -scrollDirectionThreshold) {
        setIsHidden(true);
      } else if (visualDelta > scrollDirectionThreshold) {
        setIsHidden(false);
      }
    };

    const updateTopbarVisibility = (nextScrollY = getScrollY()) => {
      const scrollDelta = nextScrollY - lastScrollYRef.current;

      if (nextScrollY <= topbarHideOffset) {
        setIsHidden(false);
      } else if (scrollDelta > scrollDirectionThreshold) {
        setIsHidden(true);
      } else if (scrollDelta < -scrollDirectionThreshold) {
        setIsHidden(false);
      }

      lastScrollYRef.current = nextScrollY;
      animationFrameRef.current = null;
    };

    const handleScroll = (event: Event) => {
      if (animationFrameRef.current !== null) {
        return;
      }

      const nextScrollY = getScrollYFromEvent(event);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        updateTopbarVisibility(nextScrollY);
      });
    };

    const applyDirection = (deltaY: number) => {
      if (Math.abs(deltaY) <= scrollDirectionThreshold) {
        return;
      }

      const currentScrollY = getScrollY();

      if (currentScrollY <= topbarHideOffset || deltaY < 0) {
        setIsHidden(false);
      } else {
        setIsHidden(true);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      applyDirection(event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const previousTouchY = touchYRef.current;
      const nextTouchY = event.touches[0]?.clientY ?? null;

      if (previousTouchY === null || nextTouchY === null) {
        touchYRef.current = nextTouchY;
        return;
      }

      applyDirection(previousTouchY - nextTouchY);
      touchYRef.current = nextTouchY;
    };

    const watchVisualScrollDirection = () => {
      updateTopbarVisibilityFromSentinel();
      visualAnimationFrameRef.current = window.requestAnimationFrame(watchVisualScrollDirection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    scrollCheckIntervalRef.current = window.setInterval(updateTopbarVisibilityFromSentinel, 120);
    visualAnimationFrameRef.current = window.requestAnimationFrame(watchVisualScrollDirection);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("scroll", handleScroll, { capture: true });

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (visualAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(visualAnimationFrameRef.current);
      }

      if (scrollCheckIntervalRef.current !== null) {
        window.clearInterval(scrollCheckIntervalRef.current);
      }
    };
  }, []);

  const isTopbarHidden = isHidden && !isMobileMenuOpen;

  return (
    <>
      <Box
        as="header"
        surface="bg"
        radius="xl"
        border="subtle"
        className="fixed left-(--spacing-4) right-(--spacing-4) top-(--spacing-4) z-(--z-sticky) mx-auto max-w-[calc(var(--container-wide)_-_var(--spacing-8))] backdrop-blur-md transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none md:left-(--spacing-6) md:right-(--spacing-6) md:top-(--spacing-6) md:max-w-[calc(var(--container-wide)_-_var(--spacing-12))]"
        style={{
          transform: isTopbarHidden ? "translateY(calc(-100% - var(--spacing-8)))" : "translateY(0)",
        }}
      >
        <Stack
          direction="row"
          gap="4"
          align="center"
          className="px-(--spacing-4) py-(--spacing-3) md:px-(--spacing-5)"
        >
          <Link href="/" className="inline-flex items-center gap-(--spacing-2) no-underline">
            <Image
              src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
              alt="Qoovex"
              width={26}
              height={26}
              priority
            />
            <Text as="span" family="display" size="lg" weight="semibold" className="hidden min-[430px]:inline">
              Qoovex
            </Text>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-(--spacing-3) md:flex"
            aria-label="Navigazione principale"
          >
            {mainNavItems.slice(0, 2).map((item) => (
              <Link key={item.href} href={item.href} className="px-(--spacing-2) no-underline">
                <Text
                  as="span"
                  size="sm"
                  tone="muted"
                  className="transition-colors hover:text-(--color-text)"
                >
                  {item.label}
                </Text>
              </Link>
            ))}
            <ResourceDropdown />
            <Link href="/enterprise" className="px-(--spacing-2) no-underline">
              <Text
                as="span"
                size="sm"
                tone="muted"
                className="transition-colors hover:text-(--color-text)"
              >
                Azienda
              </Text>
            </Link>
          </nav>

          <Stack direction="row" gap="2" align="center" className="ml-auto">
            <Button
              as="a"
              href={workspaceSignInHref}
              variant="ghost"
              size="sm"
              className="h-8 px-(--spacing-3) md:hidden"
            >
              Accedi
            </Button>
            <Button
              as="a"
              href={workspaceSignUpHref}
              variant="secondary"
              size="sm"
              className="h-8 px-(--spacing-3) md:hidden"
            >
              Iscriviti
            </Button>
            <Button
              as="a"
              href={workspaceSignUpHref}
              variant="secondary"
              size="sm"
              iconRight={<Icon icon={ArrowRight} size="xs" weight="bold" />}
              className="hidden md:inline-flex"
            >
              Inizia gratis
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => {
                setIsHidden(false);
                setIsMobileMenuOpen((current) => !current);
              }}
              iconLeft={<Icon icon={isMobileMenuOpen ? X : List} size="sm" weight="bold" />}
              className="h-9 w-9 px-0 md:hidden"
            />
          </Stack>
        </Stack>

        {isMobileMenuOpen ? (
          <Box className="border-t border-(--color-divider) px-(--spacing-4) pb-(--spacing-4) pt-(--spacing-2) md:hidden">
            <Stack gap="4">
              <Stack as="nav" gap="1" aria-label="Menu mobile">
                {[...mainNavItems.slice(0, 2), { href: "/enterprise", label: "Azienda" }].map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-(--radius-lg) px-(--spacing-3) py-(--spacing-2) no-underline hover:bg-(--color-surface-2)">
                    <Text as="span" size="sm" weight="medium">
                      {item.label}
                    </Text>
                  </Link>
                ))}
              </Stack>

              <Stack gap="2">
                <Text as="span" size="xs" tone="faint" weight="semibold">
                  Risorse
                </Text>
                <Stack gap="1">
                  {resourceLinks.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-(--radius-lg) px-(--spacing-3) py-(--spacing-2) no-underline hover:bg-(--color-surface-2)">
                      <Text as="span" size="sm" weight="medium">
                        {item.label}
                      </Text>
                    </Link>
                  ))}
                </Stack>
              </Stack>

              <Button
                as="a"
                href={workspaceSignUpHref}
                size="md"
                iconRight={<Icon icon={ArrowRight} size="sm" weight="bold" />}
                className="w-full"
              >
                Metti ordine in cucina
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Box>
      <div
        ref={scrollSentinelRef}
        className="h-[calc(3.75rem_+_var(--spacing-8))] md:h-[calc(3.75rem_+_var(--spacing-10))]"
        aria-hidden="true"
      />
    </>
  );
}
