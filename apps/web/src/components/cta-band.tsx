import { IconArrowRight } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { cn } from "@qoovex/ui/lib/utils";
import { primaryCtaHref, primaryCtaLabel, signInLabel, signInUrl } from "@/app/site-config";

type CtaBandProps = {
  title: string;
  description: string;
};

/** Fascia CTA finale coerente su tutte le pagine. Una sola azione primaria. */
export function CtaBand({ title, description }: CtaBandProps) {
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
          <a className={cn(buttonVariants({ size: "lg" }))} href={primaryCtaHref}>
            {primaryCtaLabel}
            <IconArrowRight data-icon="inline-end" />
          </a>
          <a className={cn(buttonVariants({ variant: "ghost", size: "lg" }))} href={signInUrl}>
            {signInLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
