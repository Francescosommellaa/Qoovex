"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QoovexMark } from "@qoovex/brand/qoovex-mark";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { Button, Icon, cn } from "@qoovex/ui";
import { workspaceSignInHref, workspaceSignUpHref } from "@/shared/workspace-url";
import styles from "./site-topbar.module.css";

type MenuKey = "product" | "solutions" | "resources";
type NavTone = "light" | "dark";

type MenuItem = {
  href: string;
  label: string;
  description: string;
};

type MenuDefinition = {
  key: MenuKey;
  label: string;
  href: string;
  items: readonly MenuItem[];
};

const menuDefinitions: readonly MenuDefinition[] = [
  {
    key: "product",
    label: "Prodotto",
    href: "/product",
    items: [
      {
        href: "/product",
        label: "Ricette",
        description: "Standardizza dosi, processi e costi.",
      },
      {
        href: "/product",
        label: "Menu digitali",
        description: "Organizza piatti, stagioni e servizio.",
      },
      {
        href: "/product",
        label: "Allergeni e valori",
        description: "Mantieni le informazioni sempre disponibili.",
      },
      {
        href: "/product",
        label: "Piani di lavoro",
        description: "Coordina preparazioni, turni e priorita.",
      },
    ],
  },
  {
    key: "solutions",
    label: "Soluzioni",
    href: "/enterprise",
    items: [
      {
        href: "/enterprise",
        label: "Chef e brigate",
        description: "Una regia condivisa per il lavoro quotidiano.",
      },
      {
        href: "/enterprise",
        label: "Ristorazione",
        description: "Processi coerenti tra cucina e servizio.",
      },
      {
        href: "/enterprise",
        label: "Catering",
        description: "Pianifica volumi, menu e preparazioni.",
      },
      {
        href: "/enterprise",
        label: "Strutture",
        description: "Controllo operativo per team e sedi.",
      },
    ],
  },
  {
    key: "resources",
    label: "Risorse",
    href: "/resources",
    items: [
      {
        href: "/resources",
        label: "Tutte le risorse",
        description: "Strumenti e materiali per la cucina.",
      },
      {
        href: "/resources#guides",
        label: "Guide operative",
        description: "Metodi pratici per organizzare il lavoro.",
      },
      {
        href: "/resources#community",
        label: "Community",
        description: "Ricette e idee da altri professionisti.",
      },
      {
        href: "/resources#documents",
        label: "Documenti",
        description: "Allergeni, menu e organizzazione.",
      },
    ],
  },
] as const;

const directLinks = [
  { href: "/contact", label: "Assistenza" },
  { href: "/pricing", label: "Prezzi" },
] as const;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function colorToneFromCss(value: string): NavTone | null {
  const channels = value.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) return null;

  const [red, green, blue, alpha = 1] = channels;
  if (alpha < 0.2) return null;

  const linearChannels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    linearChannels[0] * 0.2126 +
    linearChannels[1] * 0.7152 +
    linearChannels[2] * 0.0722;

  return luminance < 0.32 ? "dark" : "light";
}

function getRenderedTone(
  element: Element,
  header: HTMLElement | null,
): NavTone | null {
  const explicitSurface = element.closest<HTMLElement>("[data-nav-tone]");
  if (explicitSurface && !header?.contains(explicitSurface)) {
    return explicitSurface.dataset.navTone === "dark" ? "dark" : "light";
  }

  let current: HTMLElement | null =
    element instanceof HTMLElement ? element : element.parentElement;

  while (current && !header?.contains(current)) {
    const tone = colorToneFromCss(getComputedStyle(current).backgroundColor);
    if (tone) return tone;
    current = current.parentElement;
  }

  return null;
}

export function SiteTopbar() {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);
  const [tone, setTone] = useState<NavTone>("light");
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<MenuKey | null>(
    "product",
  );
  const headerRef = useRef<HTMLElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);
  const triggerRefs = useRef<Record<MenuKey, HTMLButtonElement | null>>({
    product: null,
    solutions: null,
    resources: null,
  });

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const closeDesktopMenu = useCallback(
    (restoreFocus = false) => {
      clearCloseTimer();
      setActiveMenu((current) => {
        if (restoreFocus && current) {
          triggerRefs.current[current]?.focus();
        }
        return null;
      });
    },
    [clearCloseTimer],
  );

  const scheduleDesktopMenuClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMenu(null);
      closeTimerRef.current = null;
    }, 120);
  }, [clearCloseTimer]);

  const closeMobileMenu = useCallback((restoreFocus = false) => {
    setIsMobileMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    const updateTopbar = () => {
      setIsCompact(window.scrollY > 24);

      const header = headerRef.current;
      const sampleY = Math.min(
        Math.max(header?.getBoundingClientRect().bottom ?? 48, 24),
        window.innerHeight - 1,
      );
      const samplePoints = [
        window.innerWidth * 0.25,
        window.innerWidth * 0.5,
        window.innerWidth * 0.75,
      ];
      const sampledTones = samplePoints
        .map((sampleX) =>
          document
            .elementsFromPoint(sampleX, sampleY)
            .filter((element) => !header?.contains(element))
            .map((element) => getRenderedTone(element, header))
            .find((sampledTone): sampledTone is NavTone =>
              Boolean(sampledTone),
            ),
        )
        .filter((sampledTone): sampledTone is NavTone =>
          Boolean(sampledTone),
        );
      const darkSamples = sampledTones.filter(
        (sampledTone) => sampledTone === "dark",
      ).length;

      setTone(
        sampledTones.length > 0 && darkSamples >= Math.ceil(sampledTones.length / 2)
          ? "dark"
          : "light",
      );
      frameRef.current = null;
    };

    const requestUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateTopbar);
    };

    updateTopbar();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;

    const frame = window.requestAnimationFrame(() => {
      closeDesktopMenu();
      closeMobileMenu();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [closeDesktopMenu, closeMobileMenu, pathname]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || headerRef.current?.contains(target)) {
        return;
      }
      closeDesktopMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeMenu) {
        event.preventDefault();
        closeDesktopMenu(true);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenu, closeDesktopMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const panel = mobilePanelRef.current;
    mobileCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu(true);
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const currentFocusable = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const first = currentFocusable[0];
      const last = currentFocusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(
    () => () => {
      clearCloseTimer();
    },
    [clearCloseTimer],
  );

  function handleDesktopTriggerKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    key: MenuKey,
  ) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setActiveMenu(key);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`site-menu-${key}`)
        ?.querySelector<HTMLElement>(focusableSelector)
        ?.focus();
    });
  }

  const isDark = tone === "dark";
  const navState = isCompact ? "compact" : "expanded";

  return (
    <>
      <header
        ref={headerRef}
        className={styles.header}
        data-testid="site-topbar"
        data-state={navState}
        data-tone={tone}
      >
        <div
          className={styles.topVeil}
          data-testid="site-topbar-veil"
          aria-hidden="true"
        />
        <div
          className={cn(styles.bar, isCompact && "qv-glass-surface")}
          data-testid="site-topbar-bar"
        >
          <Link
            href="/"
            aria-label="Qoovex home"
            className={styles.brand}
            onClick={() => closeDesktopMenu()}
          >
            <QoovexMark
              tone={isDark ? "white" : "ink"}
              width={26}
              height={26}
              className={styles.brandMark}
            />
            <span className={styles.wordmark}>Qoovex</span>
          </Link>

          <nav
            className={styles.desktopNav}
            aria-label="Navigazione principale"
          >
            {menuDefinitions.map((menu) => {
              const isOpen = activeMenu === menu.key;
              return (
                <div
                  key={menu.key}
                  className={styles.desktopMenuGroup}
                  onMouseEnter={() => {
                    clearCloseTimer();
                    setActiveMenu(menu.key);
                  }}
                  onMouseLeave={scheduleDesktopMenuClose}
                  onFocus={() => {
                    clearCloseTimer();
                    setActiveMenu(menu.key);
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      scheduleDesktopMenuClose();
                    }
                  }}
                >
                  <Button
                    ref={(node) => {
                      triggerRefs.current[menu.key] =
                        node as HTMLButtonElement | null;
                    }}
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-expanded={isOpen}
                    aria-controls={`site-menu-${menu.key}`}
                    onClick={() => setActiveMenu(menu.key)}
                    onKeyDown={(event) =>
                      handleDesktopTriggerKeyDown(event, menu.key)
                    }
                    iconRight={
                      <Icon
                        icon={CaretDown}
                        size="xs"
                        weight="bold"
                        className={styles.caret}
                      />
                    }
                    className={styles.navTrigger}
                  >
                    {menu.label}
                  </Button>

                  <div
                    id={`site-menu-${menu.key}`}
                    data-testid={`site-menu-${menu.key}`}
                    className={cn(styles.megaMenu, "qv-glass-surface")}
                    data-open={isOpen || undefined}
                    aria-hidden={!isOpen}
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={scheduleDesktopMenuClose}
                  >
                    <div className={styles.megaMenuGrid}>
                      {menu.items.map((item) => (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          className={styles.megaMenuItem}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => closeDesktopMenu()}
                        >
                          <span className={styles.megaMenuTitle}>
                            {item.label}
                          </span>
                          <span className={styles.megaMenuDescription}>
                            {item.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={menu.href}
                      className={styles.megaMenuAll}
                      tabIndex={isOpen ? 0 : -1}
                      onClick={() => closeDesktopMenu()}
                    >
                      Esplora {menu.label.toLowerCase()}
                    </Link>
                  </div>
                </div>
              );
            })}

            {directLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
                onClick={() => closeDesktopMenu()}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.desktopActions}>
            <Button
              as="a"
              href={workspaceSignInHref}
              variant="secondary"
              size="sm"
            >
              Accedi
            </Button>
            <Button
              as="a"
              href={workspaceSignUpHref}
              variant={isDark ? "inverse" : "primary"}
              size="sm"
            >
              Inizia gratis
            </Button>
          </div>

          <div className={styles.mobileActions}>
            <Button
              as="a"
              href={workspaceSignUpHref}
              variant={isDark ? "inverse" : "primary"}
              size="sm"
            >
              Inizia gratis
            </Button>
            <Button
              ref={mobileMenuButtonRef}
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Apri menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setIsMobileMenuOpen(true)}
              iconLeft={<Icon icon={List} size="lg" weight="bold" />}
            />
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div
          ref={mobilePanelRef}
          id="site-mobile-menu"
          data-testid="site-mobile-menu"
          className={cn(styles.mobilePanel, "qv-glass-surface")}
          role="dialog"
          aria-modal="true"
          aria-label="Menu di navigazione"
        >
          <div className={styles.mobilePanelHeader}>
            <Link
              href="/"
              aria-label="Qoovex home"
              className={styles.mobilePanelBrand}
              onClick={() => closeMobileMenu()}
            >
              <QoovexMark width={24} height={24} />
              <span>Qoovex</span>
            </Link>
            <Button
              as="a"
              href={workspaceSignUpHref}
              variant="primary"
              size="sm"
            >
              Inizia gratis
            </Button>
            <Button
              ref={mobileCloseButtonRef}
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Chiudi menu"
              onClick={() => closeMobileMenu(true)}
              iconLeft={<Icon icon={X} size="lg" weight="bold" />}
            />
          </div>

          <nav className={styles.mobileNav} aria-label="Menu mobile">
            {menuDefinitions.map((menu) => {
              const isOpen = mobileAccordion === menu.key;
              return (
                <div key={menu.key} className={styles.mobileAccordion}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-expanded={isOpen}
                    aria-controls={`mobile-section-${menu.key}`}
                    onClick={() =>
                      setMobileAccordion((current) =>
                        current === menu.key ? null : menu.key,
                      )
                    }
                    iconRight={
                      <Icon
                        icon={CaretDown}
                        size="sm"
                        weight="bold"
                        className={styles.mobileAccordionCaret}
                      />
                    }
                    className={styles.mobileAccordionTrigger}
                  >
                    {menu.label}
                  </Button>

                  <div
                    id={`mobile-section-${menu.key}`}
                    className={styles.mobileAccordionContent}
                    data-open={isOpen || undefined}
                    hidden={!isOpen}
                  >
                    <Link
                      href={menu.href}
                      className={styles.mobileMenuLead}
                      onClick={() => closeMobileMenu()}
                    >
                      Esplora {menu.label.toLowerCase()}
                    </Link>
                    {menu.items.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className={styles.mobileMenuItem}
                        onClick={() => closeMobileMenu()}
                      >
                        <span>{item.label}</span>
                        <small>{item.description}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className={styles.mobileDirectLinks}>
              {directLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.mobileDirectLink}
                  onClick={() => closeMobileMenu()}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className={styles.mobilePanelFooter}>
            <Button
              as="a"
              href={workspaceSignInHref}
              variant="secondary"
              size="md"
            >
              Accedi
            </Button>
            <Button
              as="a"
              href={workspaceSignUpHref}
              variant="primary"
              size="md"
            >
              Inizia gratis
            </Button>
          </div>
        </div>
      ) : null}

      <div className={styles.topbarSpacer} aria-hidden="true" />
    </>
  );
}
