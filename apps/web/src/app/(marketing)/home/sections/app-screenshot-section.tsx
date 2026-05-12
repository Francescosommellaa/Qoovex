import { ProductPreviewFrame } from "@qoovex/ui";
import { OperatingRail } from "../_components/operating-rail";

export function AppScreenshotSection() {
  return (
    <section className="pb-(--spacing-4) pt-(--spacing-6) md:pb-(--spacing-6) md:pt-(--spacing-8)">
      <div className="grid gap-(--spacing-8) lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div
          className="relative w-full max-w-(--qv-marketing-screenshot-max) overflow-hidden rounded-(--radius-2xl) border border-(--color-border) lg:max-w-none"
          style={{
            maskImage: "var(--qv-marketing-screenshot-mask)",
            WebkitMaskImage: "var(--qv-marketing-screenshot-mask)",
            boxShadow: "var(--qv-marketing-screenshot-shadow)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
            style={{ background: "var(--qv-marketing-screenshot-inner-shine)" }}
            aria-hidden="true"
          />
          <ProductPreviewFrame activeScreen="recipes" className="max-w-full" />
        </div>
        <OperatingRail />
      </div>
    </section>
  );
}
