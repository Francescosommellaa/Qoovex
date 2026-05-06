import { pricingContent } from "@/pages/pricing/content/index";
import { MarketingQuietSurface } from "@/shared/components/marketing-ds";

export function PricingPlansSection() {
  return (
    <MarketingQuietSurface>
      <h1 className="m-0 font-display text-(length:--text-3xl) font-semibold text-text">{pricingContent.title}</h1>
      <p className="m-0 max-w-3xl text-(length:--text-sm) leading-relaxed text-text-muted">
        {pricingContent.description}
      </p>
      <p className="m-0 mt-2 text-(length:--text-xs) text-text-faint">
        Placeholder tabella piani: Free, Start, Pro, Enterprise.
      </p>
    </MarketingQuietSurface>
  );
}
