import { MarketingLayout } from "@/pages/layout";
import { ResourcesLibrarySection } from "@/pages/resources/sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export function ResourcesPage() {
  return (
    <MarketingLayout>
      <div className="space-y-10">
        <ResourcesLibrarySection />
        <SharedCtaSection />
      </div>
    </MarketingLayout>
  );
}
