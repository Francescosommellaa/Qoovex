import { MarketingLayout } from "@/pages/layout";
import { PricingPlansSection } from "@/pages/pricing/sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export function PricingPage() {
  return (
    <MarketingLayout>
      <div className="space-y-10">
        <PricingPlansSection />
        <SharedCtaSection />
      </div>
    </MarketingLayout>
  );
}
