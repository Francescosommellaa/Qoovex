import Link from "next/link";
import { MarketingLinkButton } from "@/shared/components/marketing-ds";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border pt-6 text-(length:--text-sm) text-text-muted">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0">Qoovex</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/resources"
            className="text-text-muted transition-colors hover:text-text focus-visible:outline-none"
          >
            Risorse
          </Link>
          <Link
            href="/legal"
            className="text-text-muted transition-colors hover:text-text focus-visible:outline-none"
          >
            Note legali
          </Link>
          <MarketingLinkButton href="/contact" variant="ghost" size="sm">
            Contact
          </MarketingLinkButton>
        </div>
      </div>
    </footer>
  );
}
