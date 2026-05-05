import { MarketingLayout } from "@/pages/layout";
import { HomeFlowSection, HomeHeroSection } from "@/pages/home/sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export function HomePage() {
  return (
    <MarketingLayout>
      <div className="space-y-10">
        <HomeHeroSection />
        <HomeFlowSection />
        <SharedCtaSection />
      </div>
    </MarketingLayout>
  );
}
