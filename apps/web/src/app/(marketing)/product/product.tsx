import { MarketingLayout } from "@/pages/layout";
import { SharedCtaSection } from "@/shared/sections/index";
import { FeatureOneSection } from "@/pages/product/sections/index";

export function ProductPage() {
  return (
    <MarketingLayout>
      <div className="space-y-10">
        <FeatureOneSection />
        <SharedCtaSection />
      </div>
    </MarketingLayout>
  );
}
