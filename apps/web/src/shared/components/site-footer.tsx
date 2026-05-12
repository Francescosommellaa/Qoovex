import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Box, Button, Divider, Icon, Stack, Text } from "@qoovex/ui";

const footerGroups = [
  {
    title: "Prodotto",
    links: [
      { href: "/product", label: "Funzionalita" },
      { href: "/pricing", label: "Prezzi" },
      { href: "/resources#guides", label: "Guide" },
    ],
  },
  {
    title: "Risorse",
    links: [
      { href: "/resources#community", label: "Community" },
      { href: "/resources#documents", label: "Documenti" },
      { href: "/resources", label: "Tutte le risorse" },
    ],
  },
  {
    title: "Qoovex",
    links: [
      { href: "/enterprise", label: "Azienda" },
      { href: "/contact", label: "Contatti" },
      { href: "/legal", label: "Note legali" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <Box as="footer" className="mt-(--spacing-16) pb-(--spacing-6) pt-(--spacing-10)">
      <Divider spacing="lg" />
      <div className="grid grid-cols-1 gap-(--spacing-8) md:grid-cols-[1fr_auto_auto_auto]">
        <Stack gap="5" className="max-w-(--measure-copy)">
          <Link href="/" className="inline-flex items-center gap-(--spacing-2) no-underline">
            <Image
              src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
              alt="Qoovex"
              width={26}
              height={26}
            />
            <Text as="span" family="display" size="lg" weight="semibold">
              Qoovex
            </Text>
          </Link>
          <Text size="sm" tone="muted" leading="relaxed">
            Il workspace che aiuta chef e brigate a tenere insieme ricette,
            preparazioni, menu, stock e lavoro del giorno.
          </Text>
          <Stack direction="row" gap="3" wrap>
            <Button
              as="a"
              href="https://app.qoovex.com/sign-up"
              size="sm"
              iconRight={<Icon icon={ArrowRight} size="xs" weight="bold" />}
            >
              Inizia gratis
            </Button>
          </Stack>
        </Stack>

        {footerGroups.map((group) => (
          <Stack key={group.title} gap="3" className="min-w-[9rem]">
            <Text as="h2" size="xs" tone="faint" weight="semibold">
              {group.title}
            </Text>
            <Stack as="ul" gap="2">
              {group.links.map((item) => (
                <li key={item.href} className="list-none">
                  <Link href={item.href} className="no-underline">
                    <Text
                      as="span"
                      size="sm"
                      tone="muted"
                      className="transition-colors hover:text-(--color-text)"
                    >
                      {item.label}
                    </Text>
                  </Link>
                </li>
              ))}
            </Stack>
          </Stack>
        ))}
      </div>

      <Stack direction="row" gap="3" align="center" justify="between" wrap className="mt-(--spacing-10)">
        <Text size="xs" tone="faint">
          (c) 2026 Qoovex. Tutti i diritti riservati.
        </Text>
        <Text size="xs" tone="faint">
          Pensato per cucine professionali in Italia.
        </Text>
      </Stack>
    </Box>
  );
}
