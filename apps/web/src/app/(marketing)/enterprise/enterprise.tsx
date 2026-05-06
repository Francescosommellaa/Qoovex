import { MarketingLayout } from "@/pages/layout";
import { StorySection } from "@/pages/enterprise/sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export function EnterprisePage() {
  return (
    <MarketingLayout>
      <div className="space-y-10">
        <StorySection />
        <SharedCtaSection />
      </div>
    </MarketingLayout>
  );
}
