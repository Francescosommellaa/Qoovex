import Link from "next/link";
import { MarketingLinkButton } from "@/shared/components/marketing-ds";

export function SiteFooter() {
  return (
    <footer className="border-t border-border pt-6 text-(length:--text-sm) text-text-muted">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 max-w-xl leading-relaxed">
          Qoovex — Il workspace operativo per cuochi e chef professionisti.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/legal"
            className="text-text-muted transition-colors hover:text-text focus-visible:outline-none"
          >
            Note legali
          </Link>
          <MarketingLinkButton href="https://app.qoovex.com/sign-up" variant="primary" size="sm">
            Inizia gratis
          </MarketingLinkButton>
        </div>
      </div>
    </footer>
  );
}
