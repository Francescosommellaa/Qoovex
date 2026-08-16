import type { Metadata } from "next";
import { IconArrowRight, IconUsersGroup } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Community | Qoovex",
  description: "Lo spazio Qoovex dedicato a guide, aggiornamenti e confronto operativo.",
};

export default function CommunityPage() {
  return (
    <SiteShell>
      <section className="border-b bg-muted/25">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <span className="grid size-11 place-items-center rounded-2xl border bg-card shadow-sm">
            <IconUsersGroup aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-6 text-sm font-medium text-muted-foreground">Community</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            Risorse condivise, quando sono davvero pronte.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Lo spazio community è in preparazione. Nel frattempo puoi scoprire
            come Qoovex organizza il lavoro condiviso tra impresa e cliente.
          </p>
          <a
            className={buttonVariants({ className: "mt-8", variant: "outline" })}
            href="/come-funziona"
          >
            Scopri come funziona
            <IconArrowRight
              aria-hidden="true"
              data-icon="inline-end"
              className="transition-transform duration-200 group-hover/button:translate-x-0.5"
            />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
