import { IconArrowRight } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { cn } from "@qoovex/ui/lib/utils";
import { primaryCtaHref, primaryCtaLabel, signInLabel, signInUrl } from "@/app/site-config";

type CtaBandProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string | null;
  secondaryLabel?: string;
};

/** Fascia CTA finale coerente su tutte le pagine. Una sola azione primaria. */
export function CtaBand({
  title,
  description,
  primaryHref = primaryCtaHref,
  primaryLabel = primaryCtaLabel,
  secondaryHref = signInUrl,
  secondaryLabel = signInLabel,
}: CtaBandProps) {
  return (
    <section className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a className={cn(buttonVariants({ size: "lg" }))} href={primaryHref}>
            {primaryLabel}
            <IconArrowRight
              aria-hidden="true"
              data-icon="inline-end"
              className="transition-transform duration-200 group-hover/button:translate-x-0.5"
            />
          </a>
          {secondaryHref ? (
            <a className={cn(buttonVariants({ variant: "ghost", size: "lg" }))} href={secondaryHref}>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
