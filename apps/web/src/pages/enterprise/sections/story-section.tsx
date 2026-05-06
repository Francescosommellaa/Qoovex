import { enterpriseContent } from "@/pages/enterprise/content/index";
import { MarketingQuietSurface } from "@/shared/components/marketing-ds";

export function StorySection() {
  return (
    <MarketingQuietSurface>
      <h1 className="m-0 font-display text-(length:--text-3xl) font-semibold text-text">{enterpriseContent.title}</h1>
      <p className="m-0 max-w-3xl text-(length:--text-sm) leading-relaxed text-text-muted">
        {enterpriseContent.description}
      </p>
    </MarketingQuietSurface>
  );
}
