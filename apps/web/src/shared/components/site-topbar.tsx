import Link from "next/link";
import Image from "next/image";
import { MarketingLinkButton } from "@/shared/components/marketing-ds";

const navLinkClass =
  "text-(length:--text-sm) text-text-muted transition-colors hover:text-text focus-visible:outline-none";

export function SiteTopbar() {
  return (
    <header className="sticky top-4 z-30 mb-8 rounded-(--radius-lg) border border-border bg-bg/85 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-(length:--text-lg) font-semibold text-text focus-visible:outline-none"
        >
          <Image
            src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
            alt="Qoovex"
            width={24}
            height={24}
            priority
          />
          <span>Qoovex</span>
        </Link>

        <nav className="flex min-w-full flex-wrap items-center gap-x-5 gap-y-2 text-(length:--text-sm) md:min-w-0 md:flex-1">
          <Link href="/product" className={navLinkClass}>
            Prodotto
          </Link>
          <Link href="/enterprise" className={navLinkClass}>
            Azienda
          </Link>
          <Link href="/pricing" className={navLinkClass}>
            Prezzi
          </Link>
          <Link href="/resources" className={navLinkClass}>
            Risorse
          </Link>
        </nav>

        <div className="ml-auto inline-flex items-center gap-2">
          <MarketingLinkButton href="https://app.qoovex.com/sign-in" variant="ghost" size="sm">
            Sign in
          </MarketingLinkButton>
          <MarketingLinkButton href="/contact" variant="secondary" size="sm">
            Contact
          </MarketingLinkButton>
        </div>
      </div>
    </header>
  );
}
