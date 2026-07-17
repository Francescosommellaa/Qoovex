import type { Metadata } from "next";
import { IconArrowRight, IconMail } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { contactEmail, contactHref } from "../site-config";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Contattaci | Qoovex",
  description: "Contatta Qoovex per parlare del tuo flusso documentale operativo.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_0.72fr] md:items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contattaci</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
                Partiamo dal modo in cui lavorate oggi.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Raccontaci come gestite documenti, scadenze e prove di cantiere.
                Ti risponderemo sul perimetro che Qoovex può organizzare, senza
                promesse di conformità o validità legale.
              </p>
            </div>
            <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary">
                <IconMail aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-5 text-sm text-muted-foreground">Scrivici a</p>
              <p className="mt-1 font-medium">{contactEmail}</p>
              <a className={buttonVariants({ className: "mt-6" })} href={contactHref}>
                Invia un&apos;email <IconArrowRight data-icon="inline-end" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
