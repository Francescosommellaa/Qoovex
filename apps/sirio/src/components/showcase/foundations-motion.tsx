"use client";

import * as React from "react";
import { IconBolt, IconMouse, IconPointer, IconEye, IconRefresh, IconCheck, IconMoon, IconSun } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Button } from "@qoovex/ui/components/button";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";

export function FoundationsMotion() {
  const [animateBall, setAnimateBall] = React.useState(false);
  const [reducedMotionActive, setReducedMotionActive] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotionActive(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotionActive(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const triggerBallAnimation = () => {
    setAnimateBall(true);
    setTimeout(() => setAnimateBall(false), 1200);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Animazioni, Motion & Sistemi d'Interazione</h2>
            <p className="text-sm text-muted-foreground">
              Transizioni d'interfaccia a curva canonica, View Transitions per cambio tema, indicatori elastici e marketing cursor magnetico.
            </p>
          </div>
          <Badge variant={reducedMotionActive ? "warning" : "success"} className="gap-1 font-mono text-xs">
            <IconBolt className="size-3.5" />
            {reducedMotionActive ? "Reduced Motion Attivo" : "Fluid Motion Attivo"}
          </Badge>
        </div>
      </div>

      {/* Easing & Ball Demo */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border">
          <CardHeader className="pb-3">
            <Badge variant="outline" className="w-fit font-mono text-xs">--ease-standard</Badge>
            <CardTitle className="text-base font-semibold mt-1">Curva di Easing Canonica</CardTitle>
            <CardDescription className="text-xs">
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded">cubic-bezier(0.2, 0, 0, 1)</code> — Accellerazione reattiva con arresto naturale a frizione.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative h-20 rounded-xl border bg-muted/20 p-4 flex items-center overflow-hidden">
              <div
                className={`size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-bold transition-transform duration-700 ${
                  animateBall ? "translate-x-[calc(100vw-300px)] sm:translate-x-64" : "translate-x-0"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
              >
                Q
              </div>
            </div>
            <Button size="sm" onClick={triggerBallAnimation} className="gap-2">
              <IconRefresh className="size-3.5" /> Test Easing Motion
            </Button>
          </CardContent>
        </Card>

        {/* View Transitions Theme */}
        <Card className="border">
          <CardHeader className="pb-3">
            <Badge variant="outline" className="w-fit font-mono text-xs">View Transitions API</Badge>
            <CardTitle className="text-base font-semibold mt-1">Reveal Circolare Cambio Tema</CardTitle>
            <CardDescription className="text-xs">
              Transizione ad espansione circolare originata dal punto esatto di click dell'utente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold block">Prova il Theme Toggle</span>
                <span className="text-[0.7rem] text-muted-foreground">Esegue <code className="font-mono text-xs">startViewTransition</code> con reveal clip-path</span>
              </div>
              <ThemeToggle />
            </div>
            <div className="text-[0.75rem] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
              @keyframes reveal &#123; from &#123; clip-path: circle(0% at var(--x, 50%) var(--y, 50%)); &#125; &#125;
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Cursor Interactive Sandbox */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <div className="flex items-center gap-2">
            <IconMouse className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Marketing Cursor Sandbox (`&lt;MarketingCursor /&gt;`)</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Puntatore centrale di precisione con halo magnetico elastico. Prova a scorrere il mouse sugli elementi sottostanti:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card className="border p-4 space-y-3">
            <Badge variant="default" className="w-fit font-mono text-xs">data-cursor-magnetic</Badge>
            <p className="text-xs text-muted-foreground">Effetto magnetico ad attrazione attorno al bottone CTA.</p>
            <Button
              className="w-full"
              data-cursor-magnetic="true"
              data-cursor-label="Magnetico"
            >
              Hover Magnetico
            </Button>
          </Card>

          <Card className="border p-4 space-y-3">
            <Badge variant="secondary" className="w-fit font-mono text-xs">data-cursor-label="Apri"</Badge>
            <p className="text-xs text-muted-foreground">Mostra un badge monospace integrato nell'halo del cursore.</p>
            <div
              className="p-3 rounded-lg border bg-secondary/50 text-center text-xs font-medium cursor-pointer hover:border-primary transition-colors"
              data-cursor-label="Visualizza"
              data-cursor-magnetic="true"
            >
              Passa per etichetta custom
            </div>
          </Card>

          <Card className="border p-4 space-y-3">
            <Badge variant="destructive" className="w-fit font-mono text-xs">data-mode="disabled"</Badge>
            <p className="text-xs text-muted-foreground">Halo rosso con sbarramento per azioni disabilitate.</p>
            <Button
              variant="outline"
              disabled
              className="w-full"
              data-cursor-magnetic="true"
            >
              Azione Disabilitata
            </Button>
          </Card>

          <Card className="border p-4 space-y-3">
            <Badge variant="outline" className="w-fit font-mono text-xs">Native Text Cursor</Badge>
            <p className="text-xs text-muted-foreground">Ripristina il cursore nativo di sistema sui campi di testo.</p>
            <input
              type="text"
              placeholder="Scrivi qualcosa..."
              className="w-full h-8 px-3 rounded-lg border bg-input text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
