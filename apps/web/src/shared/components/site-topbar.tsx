import Link from "next/link";
import { MarketingLinkButton } from "@/shared/components/marketing-ds";

const navLinkClass =
  "text-(length:--text-sm) text-text-muted transition-colors hover:text-text focus-visible:outline-none";

export function SiteTopbar() {
  return (
    <header className="flex items-center justify-between border-b border-border pb-4">
      <Link
        href="/"
        className="font-display text-(length:--text-xl) font-semibold text-text focus-visible:outline-none"
      >
        Qoovex
      </Link>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-(length:--text-sm)">
        <Link href="/pricing" className={navLinkClass}>
          Prezzi
        </Link>
        <Link href="/about" className={navLinkClass}>
          Chi siamo
        </Link>
        <Link href="/contact" className={navLinkClass}>
          Contatti
        </Link>
        <MarketingLinkButton href="https://app.qoovex.com/sign-in" variant="ghost" size="sm">
          Accedi
        </MarketingLinkButton>
      </nav>
    </header>
  );
}
