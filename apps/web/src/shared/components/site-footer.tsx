import Link from "next/link";
import { Box, Stack, Text } from "@qoovex/ui";

const footerLinks = [
  { href: "/resources", label: "Risorse" },
  { href: "/legal", label: "Note legali" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <Box as="footer" className="mt-(--spacing-10) border-t border-(--color-border) pt-(--spacing-6)">
      <Stack direction="row" gap="3" align="center" justify="between" wrap>
        <Text size="sm" tone="muted">
          Qoovex
        </Text>
        <Stack direction="row" gap="4" align="center" wrap>
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="no-underline">
              <Text as="span" size="sm" tone="muted" className="transition-colors hover:text-(--color-text)">
                {item.label}
              </Text>
            </Link>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
