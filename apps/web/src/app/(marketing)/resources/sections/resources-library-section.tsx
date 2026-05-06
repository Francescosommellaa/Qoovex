import { resourcesContent } from "@/pages/resources/content/index";
import { MarketingQuietSurface } from "@/shared/components/marketing-ds";

export function ResourcesLibrarySection() {
  return (
    <MarketingQuietSurface>
      <h1 className="m-0 font-display text-(length:--text-3xl) font-semibold text-text">
        {resourcesContent.title}
      </h1>
      <p className="m-0 max-w-3xl text-(length:--text-sm) leading-relaxed text-text-muted">
        {resourcesContent.description}
      </p>
      <p className="m-0 text-(length:--text-xs) text-text-faint">
        Sezione base: presto troverai guide, template e FAQ.
      </p>
    </MarketingQuietSurface>
  );
}
