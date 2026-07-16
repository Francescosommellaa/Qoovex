import type { Metadata } from "next";
import { IconArrowRight, IconCheck, IconFileCheck, IconFolder, IconShieldCheck } from "@tabler/icons-react";
import { DashboardOverview } from "@/components/dashboard-overview";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card } from "@qoovex/ui/components/card";
import { Separator } from "@qoovex/ui/components/separator";

export const metadata: Metadata = { title: "Marketing" };

const marketingSections = [
  { id: "panoramica", label: "Panoramica" },
  { id: "prodotto", label: "Prodotto" },
  { id: "metodo", label: "Metodo" },
  { id: "valuta", label: "Valuta" },
];

export default function MarketingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader brand="marketing" sections={marketingSections} />
      <main>
        <section className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8" id="panoramica">
          <div className="max-w-xl">
            <Badge variant="outline">Sistema documentale operativo</Badge>
            <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Documenti, scadenze e prove di cantiere in un solo spazio.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Qoovex mostra cosa è presente, cosa manca e quali contenuti richiedono una verifica. Le decisioni restano alle persone responsabili.</p>
            <div className="mt-7 flex flex-wrap gap-3"><a className={buttonVariants({ size: "lg" })} data-cursor-label="Esplora" href="/dashboard">Esplora la dashboard <IconArrowRight data-icon="inline-end" /></a><a className={buttonVariants({ size: "lg", variant: "outline" })} data-cursor-label="Scopri" href="#prodotto">Come funziona</a></div>
          </div>
          <Card className="min-w-0 overflow-hidden bg-muted/30 p-1 shadow-xl"><div className="rounded-lg border bg-background"><DashboardOverview preview /></div></Card>
        </section>

        <section id="prodotto" className="scroll-mt-24 border-y bg-muted/35">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div className="max-w-md"><p className="text-sm font-medium text-muted-foreground">Ordine operativo</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Parti dalla situazione, non dalla cartella.</h2><p className="mt-4 leading-7 text-muted-foreground">La dashboard riunisce stato, contesto e prossima azione senza trasformare un dato in una promessa di conformità.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-xl border bg-card p-5 sm:row-span-2"><IconFolder className="size-5" /><h3 className="mt-8 font-medium">Contesti leggibili</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Cantieri, lavoratori e documenti restano collegati alle attività che li riguardano.</p></article>
              <article className="rounded-xl border bg-card p-5"><IconFileCheck className="size-5" /><h3 className="mt-8 font-medium">Contenuti da verificare</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Ciò che esiste ma richiede controllo resta distinto da ciò che manca.</p></article>
              <article className="rounded-xl border bg-card p-5"><IconShieldCheck className="size-5" /><h3 className="mt-8 font-medium">Accessi circoscritti</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Le persone vedono soltanto i contesti e le funzioni autorizzate.</p></article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24 lg:px-8" id="metodo">
          <div className="grid gap-12 lg:grid-cols-2">
            <div><h2 className="max-w-lg text-3xl font-semibold tracking-tight">Prepara contenuti per la revisione, senza automatizzare il giudizio.</h2><p className="mt-4 max-w-xl leading-7 text-muted-foreground">Qoovex organizza il lavoro documentale. Non certifica persone o documenti e non sostituisce consulenti o responsabili.</p></div>
            <div className="grid gap-4">
              {["Raccogli versioni e prove nel relativo contesto.", "Distingui contenuti presenti, mancanti o da verificare.", "Prepara pacchetti consultabili dalle persone autorizzate."].map((item) => <div className="flex gap-3 rounded-lg border p-4" key={item}><IconCheck className="mt-0.5 size-4 shrink-0" /><p className="text-sm leading-6">{item}</p></div>)}
            </div>
          </div>
        </section>

        <section className="scroll-mt-24 border-t" id="valuta"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8"><div><h2 className="text-2xl font-semibold tracking-tight">Valuta il nuovo sistema nella dashboard Sirio.</h2><p className="mt-2 text-sm text-muted-foreground">La superficie usa dati dimostrativi e componenti reali.</p></div><a className={buttonVariants({ size: "lg" })} data-cursor-label="Apri" href="/dashboard">Apri la dashboard <IconArrowRight data-icon="inline-end" /></a></div></section>
      </main>
      <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><span>Qoovex</span><div className="flex items-center gap-4"><a className="hover:text-foreground" data-link="quiet" href="/">Catalogo Sirio</a><Separator orientation="vertical" className="h-4" /><span>Verifica del sistema condiviso</span></div></div></footer>
    </div>
  );
}
