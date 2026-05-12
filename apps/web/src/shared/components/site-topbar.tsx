"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CaretDown,
  List,
  X,
} from "@phosphor-icons/react";
import { Box, Button, Icon, Stack, Text } from "@qoovex/ui";

const workspaceUrl = "https://app.qoovex.com";

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
            ? "absolute left-1/2 top-[calc(100%+var(--spacing-2))] z-(--z-dropdown) w-[20rem] -translate-x-1/2 opacity-100"
            : "pointer-events-none absolute left-1/2 top-[calc(100%+var(--spacing-2))] z-(--z-dropdown) w-[20rem] -translate-x-1/2 opacity-0"
        }
      >
        <Box radius="xl" border="subtle" surface="surface" shadow="md" padding="2">
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

  return (
    <Box
      as="header"
      surface="bg"
      radius="xl"
      border="subtle"
      className="sticky top-(--spacing-4) z-(--z-sticky) mb-(--spacing-8) backdrop-blur-md"
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
          <Text as="span" family="display" size="lg" weight="semibold">
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
            href={`${workspaceUrl}/sign-up`}
            size="sm"
            iconRight={<Icon icon={ArrowRight} size="xs" weight="bold" />}
            className="hidden sm:inline-flex"
          >
            Inizia gratis
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            iconLeft={<Icon icon={isMobileMenuOpen ? X : List} size="sm" weight="bold" />}
            className="md:hidden"
          >
            Menu
          </Button>
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
              href={`${workspaceUrl}/sign-up`}
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
  );
}
