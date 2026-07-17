import type { Metadata } from "next";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Pricing | Qoovex",
  description: "Informazioni sui piani Qoovex e sul percorso di accesso al prodotto.",
};

const planPrinciples = [
  "Un solo spazio operativo per documenti, scadenze e prove",
  "Accesso calibrato sulle esigenze dell'azienda",
  "Nessun costo pubblicato prima della validazione del perimetro",
];

export default function PricingPage() {
  return (
    <SiteShell>
      <section className="border-b bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pricing</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
              Un piano proporzionato al lavoro reale.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              I piani sono in fase di validazione. Prima di pubblicare prezzi,
              verifichiamo insieme dimensione dell&apos;azienda, cantieri e flusso
              documentale da organizzare.
            </p>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium">Cosa resta invariato</p>
            <ul className="mt-5 grid gap-4 text-sm leading-6 text-muted-foreground">
              {planPrinciples.map((principle) => (
                <li className="flex gap-3" key={principle}>
                  <IconCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-foreground" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
            <a className={buttonVariants({ className: "mt-7" })} href="/contattaci">
              Parliamo del tuo caso <IconArrowRight data-icon="inline-end" />
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
