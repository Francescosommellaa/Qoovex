"use client";

import { IconBrandTabler, IconSparkles, IconStack2, IconCpu, IconPalette, IconTypography, IconAdjustments, IconBolt, IconComponents, IconCheck, IconExternalLink } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Button } from "@qoovex/ui/components/button";

export function FoundationsOverview() {
  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card/80 to-muted/40 p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 size-96 rounded-full bg-gradient-to-br from-primary/10 via-info/10 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="gap-1.5 px-3 py-1">
              <IconSparkles className="size-3.5" />
              Sorgente Canonica v2.0
            </Badge>
            <Badge variant="outline">OKLCH Color Space</Badge>
            <Badge variant="secondary">Vercel Design Language</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
            Qoovex Design System — Sirio
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Sirio costituisce la fonte di verità canonica del Design System Qoovex. Raccoglie i token cromatici OKLCH, le regole editoriale-tipografiche, le griglie di spaziatura, il sistema di elevazioni e animazioni, e il catalogo completo delle primitive d'interfaccia condivise da <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border">@qoovex/ui</code>.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#components"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
              data-cursor-magnetic="true"
              data-cursor-label="Esplora"
            >
              <IconComponents className="size-4" />
              Esplora Componenti (37+)
            </a>
            <a
              href="/marketing"
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              data-cursor-magnetic="true"
            >
              <IconExternalLink className="size-4" />
              Preview Marketing
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              data-cursor-magnetic="true"
            >
              <IconExternalLink className="size-4" />
              Preview Workspace Shell
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-mono">Componenti Shared</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight">37 Primitive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Form, modali, navigazione floating, grafici e layout 100% disaccoppiati dal dominio backend.
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-mono">Token Cromatici</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight">100% OKLCH</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Spazio colore a brillanza percepita uniforme per Light, Dark e High-Contrast Forced Colors.
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-mono">Tipografia Editoriale</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Geist & Geist Mono</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Caricate via <code className="font-mono text-xs">next/font</code> per massima precisione nei dati e testi.
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-mono">Accessibilità & Motion</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight">WCAG AAA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Focus 2px visibile, supporto a <code className="font-mono text-xs">prefers-reduced-motion</code> e tastiera.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Principles Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Principi Guida di Qoovex Design</h2>
          <p className="text-sm text-muted-foreground">Linee guida fondamentali che guidano ogni decisione d'interfaccia e di codice nel monorepo.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <IconCpu className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">1. Precision Engineering & Clean Density</CardTitle>
                <CardDescription className="text-xs leading-normal">
                  Spaziature su griglia rigorosa a 4px, gerarchie tipografiche bilanciate ed eliminazione di orpelli decorativi per concentrare l'attenzione su dati operativi e comunicazioni strategiche.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-2.5 rounded-xl bg-info/10 text-info">
                <IconPalette className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">2. Spazio Colore Perch-Uniform OKLCH</CardTitle>
                <CardDescription className="text-xs leading-normal">
                  Colori definiti nello spazio OKLCH per garantire coerenza visuale senza distorsioni di luminosità durante il passaggio da tema Chiaro a Scuro.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-2.5 rounded-xl bg-warning/15 text-warning-foreground">
                <IconAdjustments className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">3. Ruoli Semantici Rigidi & Surfaces</CardTitle>
                <CardDescription className="text-xs leading-normal">
                  Uso dei colori semantici (<code className="font-mono text-xs">info</code>, <code className="font-mono text-xs">success</code>, <code className="font-mono text-xs">warning</code>, <code className="font-mono text-xs">destructive</code>) rigorosamente vincolato agli stati per evitare ambiguità e sovrapposizioni.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-2.5 rounded-xl bg-success/10 text-success">
                <IconBolt className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">4. Motion Reattivo e Accessibile</CardTitle>
                <CardDescription className="text-xs leading-normal">
                  Transizioni basate su <code className="font-mono text-xs">--ease-standard</code> (<code className="font-mono text-xs">cubic-bezier(0.2, 0, 0, 1)</code>), elastic focus indicators e reveal circolare con immediato fallback per riduzione del movimento.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
