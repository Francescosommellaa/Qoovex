"use client";

import * as React from "react";
import { IconCopy, IconCheck, IconPalette, IconSun, IconMoon, IconInfoCircle } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";

type ColorToken = {
  name: string;
  varName: string;
  cssValue: string;
  bgClass: string;
  fgClass: string;
  borderClass?: string;
  description: string;
};

const tokenGroups: { title: string; description: string; tokens: ColorToken[] }[] = [
  {
    title: "1. Base Visuale & Superfici",
    description: "Fondi, contenitori, modali e popover primari per la gerarchia di profondità.",
    tokens: [
      {
        name: "Background",
        varName: "--background",
        cssValue: "oklch(0.99 0 0) / oklch(0 0 0)",
        bgClass: "bg-background",
        fgClass: "text-foreground",
        borderClass: "border-border",
        description: "Sfondo principale di pagina e canvas.",
      },
      {
        name: "Foreground",
        varName: "--foreground",
        cssValue: "oklch(0 0 0) / oklch(1 0 0)",
        bgClass: "bg-foreground",
        fgClass: "text-background",
        description: "Testo e iconografia ad alto contrasto.",
      },
      {
        name: "Card Surface",
        varName: "--card",
        cssValue: "oklch(1 0 0) / oklch(0.14 0 0)",
        bgClass: "bg-card",
        fgClass: "text-card-foreground",
        borderClass: "border-border",
        description: "Superficie rialzata per card e pannelli.",
      },
      {
        name: "Popover Surface",
        varName: "--popover",
        cssValue: "oklch(0.99 0 0) / oklch(0.18 0 0)",
        bgClass: "bg-popover",
        fgClass: "text-popover-foreground",
        borderClass: "border-border",
        description: "Pannelli sovrapposti e menu a tendina.",
      },
    ],
  },
  {
    title: "2. Azioni & Interattività",
    description: "Ruoli cromatici per elementi cliccabili, bottoni, hover e stati di selezione.",
    tokens: [
      {
        name: "Primary",
        varName: "--primary",
        cssValue: "oklch(0 0 0) / oklch(1 0 0)",
        bgClass: "bg-primary",
        fgClass: "text-primary-foreground",
        description: "Pulsanti principali, CTA ed elementi focalizzati.",
      },
      {
        name: "Secondary",
        varName: "--secondary",
        cssValue: "oklch(0.94 0 0) / oklch(0.25 0 0)",
        bgClass: "bg-secondary",
        fgClass: "text-secondary-foreground",
        description: "Azioni di secondo livello, tag e controlli neutri.",
      },
      {
        name: "Muted Surface",
        varName: "--muted",
        cssValue: "oklch(0.97 0 0) / oklch(0.23 0 0)",
        bgClass: "bg-muted",
        fgClass: "text-muted-foreground",
        description: "Sfondi secondari e testi di supporto a basso contrasto.",
      },
      {
        name: "Accent Hover",
        varName: "--accent",
        cssValue: "oklch(0.94 0 0) / oklch(0.32 0 0)",
        bgClass: "bg-accent",
        fgClass: "text-accent-foreground",
        description: "Stato hover ed evidenziazione di elementi selezionati.",
      },
    ],
  },
  {
    title: "3. Ruoli Semantici & Surface Mixes",
    description: "Stati di sistema e relative superfici calcolate via color-mix OKLCH.",
    tokens: [
      {
        name: "Destructive",
        varName: "--destructive",
        cssValue: "oklch(0.63 0.19 23.03)",
        bgClass: "bg-destructive",
        fgClass: "text-destructive-foreground",
        description: "Avvisi critici, eliminazioni ed errori di validazione.",
      },
      {
        name: "Info",
        varName: "--info",
        cssValue: "oklch(0.55 0.22 264.53)",
        bgClass: "bg-info",
        fgClass: "text-info-foreground",
        description: "Notifiche di sistema e messaggi guida neutri.",
      },
      {
        name: "Success",
        varName: "--success",
        cssValue: "oklch(0.56 0.15 145)",
        bgClass: "bg-success",
        fgClass: "text-success-foreground",
        description: "Operazioni completate con successo e stati attivi.",
      },
      {
        name: "Warning",
        varName: "--warning",
        cssValue: "oklch(0.81 0.17 75.35)",
        bgClass: "bg-warning",
        fgClass: "text-warning-foreground",
        description: "Attenzione richiesta, azioni irreversibili imminenti.",
      },
    ],
  },
  {
    title: "4. Controlli & Struttura (Bordi e Focus)",
    description: "Bordi perimetrali, sfondi degli input e ring di focus a 2px visibile.",
    tokens: [
      {
        name: "Border",
        varName: "--border",
        cssValue: "oklch(0.92 0 0) / oklch(0.26 0 0)",
        bgClass: "bg-border",
        fgClass: "text-foreground",
        description: "Separatori, bordi di card e contenitori.",
      },
      {
        name: "Input Background",
        varName: "--input",
        cssValue: "oklch(0.94 0 0) / oklch(0.32 0 0)",
        bgClass: "bg-input",
        fgClass: "text-foreground",
        description: "Sfondo di input di testo, checkbox e select.",
      },
      {
        name: "Ring Focus",
        varName: "--ring",
        cssValue: "oklch(0 0 0) / oklch(0.72 0 0)",
        bgClass: "bg-ring",
        fgClass: "text-background",
        description: "Indicatori di focus da tastiera (2px solid outline).",
      },
    ],
  },
  {
    title: "5. Visualizzazione Dati (Chart Tokens)",
    description: "Palette per grafici Recharts (Line, Bar, Donut) coerente tra Light e Dark mode.",
    tokens: [
      { name: "Chart 1 (Warning / Amber)", varName: "--chart-1", cssValue: "oklch(0.81 0.17 75.35)", bgClass: "bg-[var(--chart-1)]", fgClass: "text-foreground", description: "Serie dati primaria / metriche chiave." },
      { name: "Chart 2 (Info / Blue)", varName: "--chart-2", cssValue: "oklch(0.55 0.22 264.53)", bgClass: "bg-[var(--chart-2)]", fgClass: "text-foreground", description: "Serie dati secondaria / traffico." },
      { name: "Chart 3 (Muted Gray)", varName: "--chart-3", cssValue: "oklch(0.72 0 0)", bgClass: "bg-[var(--chart-3)]", fgClass: "text-foreground", description: "Baselines e valori medi." },
      { name: "Chart 4 (Border Neutral)", varName: "--chart-4", cssValue: "oklch(0.92 0 0)", bgClass: "bg-[var(--chart-4)]", fgClass: "text-foreground", description: "Proiezioni e stime future." },
      { name: "Chart 5 (Dark Neutral)", varName: "--chart-5", cssValue: "oklch(0.56 0 0)", bgClass: "bg-[var(--chart-5)]", fgClass: "text-foreground", description: "Confronti storici." },
    ],
  },
];

export function FoundationsColors() {
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Palette Colori & Sistema Token OKLCH</h2>
            <p className="text-sm text-muted-foreground">
              Tutti i colori del Design System Qoovex sono tokenizzati in Custom Properties CSS nello spazio OKLCH.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 font-mono text-xs">
            <IconPalette className="size-3.5" />
            [data-theme="vercel"]
          </Badge>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg border bg-info/10 text-info text-xs">
          <IconInfoCircle className="size-4 shrink-0" />
          <span>
            Clicca su una qualsiasi scheda colore per copiare il nome della variabile CSS (<code className="font-mono bg-background/50 px-1 py-0.5 rounded">var(--name)</code>) negli appunti.
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {tokenGroups.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-semibold text-foreground">{group.title}</h3>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.tokens.map((token) => (
                <div
                  key={token.varName}
                  onClick={() => copyToClipboard(`var(${token.varName})`)}
                  className="group relative flex flex-col justify-between rounded-xl border bg-card p-3 shadow-xs hover:border-primary/50 transition-all cursor-pointer select-none"
                  data-cursor-magnetic="true"
                >
                  <div className="space-y-2">
                    <div
                      className={`h-16 w-full rounded-lg ${token.bgClass} ${token.borderClass || ""} flex items-center justify-center border shadow-xs transition-transform group-hover:scale-[1.02]`}
                    >
                      <span className={`text-xs font-mono font-medium ${token.fgClass}`}>
                        Aa
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{token.name}</span>
                        {copiedToken === `var(${token.varName})` ? (
                          <span className="text-xs font-medium text-success flex items-center gap-1">
                            <IconCheck className="size-3.5" /> Copiato
                          </span>
                        ) : (
                          <IconCopy className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <code className="text-[0.7rem] font-mono text-muted-foreground block mt-0.5">
                        {token.varName}
                      </code>
                    </div>
                  </div>

                  <p className="mt-3 text-[0.75rem] text-muted-foreground line-clamp-2 border-t pt-2">
                    {token.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
