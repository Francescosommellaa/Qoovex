import Link from "next/link";
import { QoovexMark } from "@qoovex/brand/qoovex-mark";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button, Card, CardBody, Divider, Icon, Stack, Text } from "@qoovex/ui";
import { workspaceSignUpHref } from "@/shared/workspace-url";

const footerGroups = [
  {
    title: "Prodotto",
    links: [
      { href: "/product", label: "Funzionalità" },
      { href: "/pricing", label: "Prezzi" },
      { href: "/enterprise", label: "Enterprise" },
    ],
  },
  {
    title: "Funzionalità",
    links: [
      { href: "/product#ricette", label: "Ricette" },
      { href: "/product#menu", label: "Menu digitali" },
      { href: "/product#allergeni", label: "Allergeni" },
      { href: "/product#piano", label: "Piano di lavoro" },
    ],
  },
  {
    title: "Risorse",
    links: [
      { href: "/resources", label: "Tutte le risorse" },
      { href: "/resources#community", label: "Community" },
      { href: "/resources#guides", label: "Guide" },
      { href: "/resources#documents", label: "Documenti" },
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
    <footer className="mx-auto mt-(--spacing-16) w-full max-w-(--container-wide) px-(--page-gutter) pb-(--spacing-6)">
      <Card variant="cream" tone="neutral" padding="none" className="w-full">
        <CardBody padding="lg">
          <Stack gap="10">
            <div className="grid grid-cols-2 gap-(--spacing-8) sm:grid-cols-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
              <div className="col-span-2 sm:col-span-3 md:col-span-1">
                <Stack gap="5" className="max-w-(--qv-footer-brand-max)">
                  <Link href="/" className="inline-flex items-center gap-(--spacing-2) no-underline">
                    <QoovexMark width={26} height={26} />
                    <Text as="span" family="display" size="lg" weight="semibold">
                      Qoovex
                    </Text>
                  </Link>
                  <Text size="sm" tone="muted" leading="relaxed">
                    Il workspace operativo per cuochi e chef professionisti.
                    Ricette, menu, allergeni e lavoro della brigata in un solo posto.
                  </Text>
                  <Button
                    as="a"
                    href={workspaceSignUpHref}
                    size="sm"
                    iconRight={<Icon icon={ArrowRight} size="xs" weight="bold" />}
                  >
                    Inizia gratis
                  </Button>
                </Stack>
              </div>

              {footerGroups.map((group) => (
                <Stack key={group.title} gap="4">
                  <Text
                    as="h3"
                    size="xs"
                    tone="faint"
                    weight="semibold"
                    className="uppercase tracking-wide"
                  >
                    {group.title}
                  </Text>
                  <Stack as="ul" gap="3">
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

            <Divider spacing="md" />

            <Stack direction="row" gap="3" align="center" justify="between" wrap>
              <Text size="xs" tone="faint">
                © 2026 Qoovex. Tutti i diritti riservati.
              </Text>
              <Text size="xs" tone="faint">
                Pensato per cuochi e chef professionisti in Italia.
              </Text>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </footer>
  );
}
