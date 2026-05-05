import { MarketingLayout } from "@/pages/layout";
import { AboutStorySection } from "@/pages/about/sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export function AboutPage() {
  return (
    <MarketingLayout>
      <div className="space-y-10">
        <AboutStorySection />
        <SharedCtaSection />
      </div>
    </MarketingLayout>
  );
}
