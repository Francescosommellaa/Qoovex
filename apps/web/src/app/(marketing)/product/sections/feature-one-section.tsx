import { productContent } from "../content/index";
import { MarketingQuietSurface } from "@/shared/components/index";

export function FeatureOneSection() {
  return (
    <MarketingQuietSurface>
      <h1 className="m-0 font-display text-(length:--text-3xl) font-semibold text-text">{productContent.title}</h1>
      <p className="m-0 max-w-3xl text-(length:--text-sm) leading-relaxed text-text-muted">
        {productContent.description}
      </p>
    </MarketingQuietSurface>
  );
}
