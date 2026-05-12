import { ProductPreviewFrame } from "@qoovex/ui";

export function AppScreenshotSection() {
  return (
    <section className="pb-(--spacing-12) pt-(--spacing-4) md:pb-(--spacing-16) md:pt-(--spacing-6)">
      <div className="max-w-[72rem]">
        <ProductPreviewFrame activeScreen="recipes" className="max-w-full" />
      </div>
    </section>
  );
}
