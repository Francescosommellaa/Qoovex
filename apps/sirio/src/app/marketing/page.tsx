import type { Metadata } from "next";
import { IconSparkles, IconArrowRight, IconShieldCheck, IconBolt, IconChartBar, IconBuildingSkyscraper, IconUsers, IconCheck, IconChevronRight } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";

export const metadata: Metadata = {
  title: "Superficie Marketing - Sirio Qoovex",
  description: "Preview rappresentativa della landing page Qoovex realizzata con @qoovex/ui.",
};

export default function MarketingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader brand="marketing" action={true} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-gradient-to-tr from-primary/10 via-info/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/80 backdrop-blur-sm shadow-xs text-xs font-medium">
            <Badge variant="default" className="px-2 py-0.5 text-[0.65rem]">Qoovex v2.0</Badge>
            <span>La piattaforma integrata per la gestione cantieri</span>
            <IconChevronRight className="size-3 text-muted-foreground" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-balance leading-[1.1]">
            Il controllo totale dei tuoi cantieri.{" "}
            <span className="bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent">
              In tempo reale.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Semplifica la direzione lavori, automatizza le verifiche di sicurezza e monitora i costi operativi con il Design System ad alta precisione Qoovex.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/dashboard"
              className={buttonVariants({ size: "lg" })}
              data-cursor-magnetic="true"
              data-cursor-label="Entra"
            >
              Accedi alla Workspace Shell
              <IconArrowRight className="size-4" />
            </a>
            <a
              href="/"
              className={buttonVariants({ variant: "outline", size: "lg" })}
              data-cursor-magnetic="true"
            >
              Esplora il Design System Sirio
            </a>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium"><IconShieldCheck className="size-4 text-success" /> Conforme Normative ISO 9001</span>
            <span className="flex items-center gap-1.5 font-medium"><IconBolt className="size-4 text-warning-foreground" /> Sincronizzazione Sub-Secondo</span>
            <span className="flex items-center gap-1.5 font-medium"><IconBuildingSkyscraper className="size-4 text-info" /> Oltre 1,400 Cantieri Attivi</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="outline">Architettura Integrata</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Costruito attorno alla massima efficienza</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Ogni modulo è progettato utilizzando le primitive d'interfaccia condivise da <code className="font-mono text-xs">@qoovex/ui</code>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-2">
                <IconChartBar className="size-6" />
              </div>
              <CardTitle className="text-lg">Analytics & Avanzamento</CardTitle>
              <CardDescription>Metriche di cantiere in tempo reale con grafici OKLCH ultra-fluidi.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Monitora le percentuali di completamento, la fornitura di materiali e le scadenze legali con la vista Recharts integrata.
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 rounded-xl bg-info/10 text-info w-fit mb-2">
                <IconShieldCheck className="size-6" />
              </div>
              <CardTitle className="text-lg">Audit & Tracciabilità</CardTitle>
              <CardDescription>Registro cronologico (Timeline) con marcatura degli attori e transizioni.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Tutti gli aggiornamenti sui verbali di cantiere sono firmati digitalmente e tracciati nello storico permanente.
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 rounded-xl bg-success/10 text-success w-fit mb-2">
                <IconUsers className="size-6" />
              </div>
              <CardTitle className="text-lg">Collaborazione Squadre</CardTitle>
              <CardDescription>Code di lavoro prioritarie (WorkQueueItem) per risolvere criticità sul nascere.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Assegna task bloccanti o richiedi sopralluoghi immediati alla direzione lavori direttamente da dispositivi mobile.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© 2026 Qoovex Design System — Superficie Marketing Sirio.</p>
        <div className="flex items-center gap-4">
          <a href="/" className="hover:text-foreground">Catalogo Sirio</a>
          <a href="/dashboard" className="hover:text-foreground">Workspace Shell</a>
        </div>
      </footer>
    </div>
  );
}
