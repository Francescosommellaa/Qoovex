import { legalContent } from "../content/index";
import { MarketingQuietSurface } from "@/shared/components/index";

export function LegalDocumentsSection() {
  return (
    <MarketingQuietSurface>
      <h1 className="m-0 font-display text-(length:--text-3xl) font-semibold text-text">{legalContent.title}</h1>
      <p className="m-0 max-w-3xl text-(length:--text-sm) leading-relaxed text-text-muted">
        {legalContent.description}
      </p>
    </MarketingQuietSurface>
  );
}
