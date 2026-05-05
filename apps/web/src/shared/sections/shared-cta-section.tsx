import {
  MarketingLinkButton,
  MarketingPanelSurface,
} from "@/shared/components/marketing-ds";

export function SharedCtaSection() {
  return (
    <MarketingPanelSurface bodyClassName="items-center text-center">
      <h2 className="m-0 font-display text-(length:--text-2xl) font-semibold text-text">
        Pronto a portare ordine in cucina?
      </h2>
      <p className="m-0 max-w-xl text-(length:--text-sm) leading-relaxed text-text-muted">
        Crea il tuo workspace Qoovex e inizia a organizzare ricette, menu e piani di lavoro.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <MarketingLinkButton href="https://app.qoovex.com/sign-up" variant="primary" size="md">
          Registrati gratis
        </MarketingLinkButton>
        <MarketingLinkButton href="/pricing" variant="secondary" size="md">
          Vedi i piani
        </MarketingLinkButton>
      </div>
    </MarketingPanelSurface>
  );
}
