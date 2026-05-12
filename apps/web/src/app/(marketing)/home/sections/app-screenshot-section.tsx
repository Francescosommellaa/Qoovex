import { ProductPreviewFrame } from "@qoovex/ui";

export function AppScreenshotSection() {
  return (
    <section className="pb-(--spacing-4) pt-(--spacing-6) md:pb-(--spacing-6) md:pt-(--spacing-8)">
      {/* Frame container: border + rounded corners + bottom fade mask — Linear-style mockup treatment */}
      <div
        className="relative max-w-[72rem] overflow-hidden rounded-(--radius-2xl) border border-(--color-border)"
        style={{
          maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          boxShadow:
            "0 0 0 1px oklch(1 0 0 / 0.04), 0 24px 64px oklch(0 0 0 / 0.5), 0 4px 16px oklch(0 0 0 / 0.3)",
        }}
      >
        {/* Subtle inner glow on top edge */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
          style={{ background: "linear-gradient(to right, transparent, oklch(1 0 0 / 0.12), transparent)" }}
          aria-hidden="true"
        />
        <ProductPreviewFrame activeScreen="recipes" className="max-w-full" />
      </div>
    </section>
  );
}
