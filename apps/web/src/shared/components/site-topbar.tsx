import Image from "next/image";
import Link from "next/link";
import { ActionLink, Box, Stack, Text, ThemeToggle } from "@qoovex/ui";

const navItems = [
  { href: "/product", label: "Prodotto" },
  { href: "/enterprise", label: "Azienda" },
  { href: "/pricing", label: "Prezzi" },
  { href: "/resources", label: "Risorse" },
];

export function SiteTopbar() {
  return (
    <Box
      as="header"
      surface="bg"
      radius="lg"
      border="subtle"
      className="sticky top-(--spacing-4) z-(--z-sticky) mb-(--spacing-8) backdrop-blur-md"
    >
      <Stack
        direction="row"
        gap="4"
        align="center"
        wrap
        className="px-(--spacing-4) py-(--spacing-3) md:px-(--spacing-6)"
      >
        <Link href="/" className="inline-flex items-center gap-(--spacing-2) no-underline">
          <Image
            src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
            alt="Qoovex"
            width={24}
            height={24}
            priority
          />
          <Text as="span" family="display" size="lg" weight="semibold">
            Qoovex
          </Text>
        </Link>

        <nav className="flex min-w-full flex-wrap items-center gap-x-(--spacing-5) gap-y-(--spacing-2) md:min-w-0 md:flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="no-underline">
              <Text as="span" size="sm" tone="muted" className="transition-colors hover:text-(--color-text)">
                {item.label}
              </Text>
            </Link>
          ))}
        </nav>

        <Stack direction="row" gap="2" align="center" className="ml-auto">
          <ThemeToggle label="Tema" />
          <ActionLink href="https://app.qoovex.com/sign-in" variant="ghost" size="sm">
            Sign in
          </ActionLink>
          <ActionLink href="/contact" variant="secondary" size="sm">
            Contact
          </ActionLink>
        </Stack>
      </Stack>
    </Box>
  );
}
