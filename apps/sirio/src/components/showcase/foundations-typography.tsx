"use client";

import * as React from "react";
import { IconTypography, IconLink, IconCode, IconCheck } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";

export function FoundationsTypography() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tipografia & Contratto Editoriale</h2>
            <p className="text-sm text-muted-foreground">
              Le famiglie tipografiche canoniche Geist Sans e Geist Mono garantiscono alta densità di informazioni e massima leggibilità.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 font-mono text-xs">
            <IconTypography className="size-3.5" />
            Geist Font Suite
          </Badge>
        </div>
      </div>

      {/* Font Families Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border">
          <CardHeader className="bg-muted/30 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Geist Sans (Sans-Serif)</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">var(--font-sans)</Badge>
            </div>
            <CardDescription className="text-xs">
              Utilizzato per tutte le interfacce utente, titoli, pulsanti, form e contenuti editoriali.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-4xl font-bold tracking-tight font-sans">
                Aa Bb Cc Dd 123
              </p>
              <p className="text-sm text-muted-foreground font-sans">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs border-t pt-3 font-sans">
              <span className="font-normal border px-2 py-1 rounded">Regular 400</span>
              <span className="font-medium border px-2 py-1 rounded">Medium 500</span>
              <span className="font-semibold border px-2 py-1 rounded">Semibold 600</span>
              <span className="font-bold border px-2 py-1 rounded">Bold 700</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border">
          <CardHeader className="bg-muted/30 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Geist Mono (Monospace)</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">var(--font-mono)</Badge>
            </div>
            <CardDescription className="text-xs">
              Riservato a token di sistema, importi contabili, date ISO, codici e data grid.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-4xl font-bold tracking-tight font-mono">
                0123456789 €#
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs border-t pt-3 font-mono">
              <span className="font-normal border px-2 py-1 rounded">Regular 400</span>
              <span className="font-medium border px-2 py-1 rounded">Medium 500</span>
              <span className="font-semibold border px-2 py-1 rounded">Semibold 600</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Font Size Scale Visualizer */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold">Scala Tipografica & Line Heights</h3>
          <p className="text-xs text-muted-foreground">Dimensionamento modulare del testo e rapporto d'interlinea standard.</p>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-muted/20">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">var(--text-xs)</Badge>
              <span className="text-xs text-muted-foreground font-mono">0.75rem (12px) / line-height: 1.25</span>
            </div>
            <span className="text-xs font-semibold text-foreground">Micro-label, timestamp, badge, cursor label</span>
          </div>

          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">var(--text-sm)</Badge>
              <span className="text-xs text-muted-foreground font-mono">0.875rem (14px) / line-height: 1.4</span>
            </div>
            <span className="text-sm text-foreground">Testo primario d'interfaccia, form inputs, tabelle di cantiere</span>
          </div>

          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">base</Badge>
              <span className="text-xs text-muted-foreground font-mono">1.00rem (16px) / line-height: 1.5</span>
            </div>
            <span className="text-base text-foreground">Corpo del testo nei documenti e articoli di approfondimento</span>
          </div>

          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">lg / xl</Badge>
              <span className="text-xs text-muted-foreground font-mono">1.125rem - 1.25rem / line-height: 1.3</span>
            </div>
            <span className="text-lg font-medium text-foreground">Titoli di sezioni, modali e dialoghi di conferma</span>
          </div>

          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">2xl / 3xl</Badge>
              <span className="text-xs text-muted-foreground font-mono">1.50rem - 1.875rem / line-height: 1.2</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">Hero title, headings principali di pagina</span>
          </div>
        </div>
      </div>

      {/* Link Contract Section */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <div className="flex items-center gap-2">
            <IconLink className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Contratto dei Link (`data-link`)</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            La sottolineatura e l'interazione dei collegamenti ipertestuali sono regolate da contratti dichiarativi DOM per evitare incongruenze stilistiche.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border">
            <CardHeader className="pb-2">
              <Badge variant="default" className="w-fit font-mono text-xs">data-link="inline"</Badge>
              <CardTitle className="text-sm font-semibold mt-2">Link Editorial (Sempre Sottolineato)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <p className="text-muted-foreground">
                Per collegamenti inseriti all'interno di paragrafi o blocchi di testo.
              </p>
              <div className="p-3 rounded-lg border bg-muted/20">
                Consulta i <a href="#" data-link="inline" className="text-primary font-medium">Termini e Condizioni</a> aggiornati del servizio.
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit font-mono text-xs">data-link="quiet"</Badge>
              <CardTitle className="text-sm font-semibold mt-2">Link Quiet (Sottolineato su Hover)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <p className="text-muted-foreground">
                Per link secondari o isolati dove l'icona o la posizione chiarisce l'interattività.
              </p>
              <div className="p-3 rounded-lg border bg-muted/20">
                <a href="#" data-link="quiet" className="text-primary font-medium">Vedi tutti i dettagli del cantiere →</a>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit font-mono text-xs">data-link="plain"</Badge>
              <CardTitle className="text-sm font-semibold mt-2">Link Plain (Senza Sottolineatura)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <p className="text-muted-foreground">
                Per componenti custom, schede cliccabili, navbar o pulsanti mascherati da collegamenti.
              </p>
              <div className="p-3 rounded-lg border bg-muted/20">
                <a href="#" data-link="plain" className="text-primary font-medium hover:opacity-80 transition-opacity">Torna alla Dashboard</a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inherited Scope Example */}
        <Card className="border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconCode className="size-4 text-info" />
              Scopo Ereditato (<code className="font-mono text-xs">data-link-scope="inline"</code>)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="text-muted-foreground">
              Applicando <code className="font-mono bg-muted px-1 rounded text-xs">data-link-scope="inline"</code> su un elemento genitore, tutti i collegamenti <code className="font-mono bg-muted px-1 rounded text-xs">&lt;a&gt;</code> contenuti ereditano la sottolineatura automatica:
            </p>
            <div data-link-scope="inline" className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <p>
                Per maggiori dettagli leggi la nostra <a href="#" className="text-primary font-medium">Informativa Privacy</a> e la <a href="#" className="text-primary font-medium">Cookie Policy</a> per la gestione dei dati.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
