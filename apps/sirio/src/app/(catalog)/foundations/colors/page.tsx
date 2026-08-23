"use client";

import { PageHeader } from "@/components/page-header";
import { ColorGrid, ColorSwatch } from "@/components/token-explorer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@qoovex/ui/components/card";
import { Separator } from "@qoovex/ui/components/separator";

const colorPrinciples = [
  {
    title: "Spazio Colore OKLCH",
    description:
      "Tutti i token sono definiti in OKLCH per garantire una transizione percettivamente uniforme della luminosità tra tema chiaro e tema scuro.",
  },
  {
    title: "Coppie Semantiche Obbligatorie",
    description:
      "Ogni superficie possiede il rispettivo token foreground (es. --primary + --primary-foreground) garantendo contrasto accessibile WCAG AA in entrambi i temi.",
  },
  {
    title: "Superfici di Feedback Derivate",
    description:
      "I token -surface generano tinte traslucide con color-mix per badge, alert e stati asincroni senza alterare la leggibilità del testo.",
  },
] as const;

export default function ColorsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Colori"
        description="Il sistema cromatico semantico di Qoovex in OKLCH. Progettato per uniformità percettiva, contrasto accessibile e coerenza tra tema chiaro e scuro."
        importPath="import '@qoovex/ui/styles/tokens.css'"
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Principi Cromatici ────────────────────── */}
        <section aria-labelledby="color-principles-title">
          <h2 id="color-principles-title" className="mb-5 text-2xl font-semibold tracking-tight">
            Principi del sistema cromatico
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {colorPrinciples.map((p) => (
              <Card key={p.title} variant="ghost" size="sm">
                <CardHeader>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {p.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 2. Superfici Principali & Layout ─────────── */}
        <section aria-labelledby="core-surfaces-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="core-surfaces-title" className="text-2xl font-semibold tracking-tight">
              Superfici principali & Layout
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              I token fondamentali per lo sfondo dell'applicazione, le card e i contenitori popover/dialog.
            </p>
          </div>
          <ColorGrid>
            <ColorSwatch
              name="Background"
              variable="--background"
              foregroundVariable="--foreground"
              description="Sfondo globale dell'applicazione"
            />
            <ColorSwatch
              name="Foreground"
              variable="--foreground"
              description="Testo principale e icone base"
            />
            <ColorSwatch
              name="Card"
              variable="--card"
              foregroundVariable="--card-foreground"
              description="Superficie di schede e pannelli"
            />
            <ColorSwatch
              name="Card Foreground"
              variable="--card-foreground"
              description="Testo e contenuti all'interno delle card"
            />
            <ColorSwatch
              name="Popover"
              variable="--popover"
              foregroundVariable="--popover-foreground"
              description="Menu a discesa, dialog e tooltip"
            />
            <ColorSwatch
              name="Popover Foreground"
              variable="--popover-foreground"
              description="Testo nei popover e dialog"
            />
          </ColorGrid>
        </section>

        <Separator />

        {/* ── 3. Brand & Semantica UI ──────────────────── */}
        <section aria-labelledby="brand-semantics-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="brand-semantics-title" className="text-2xl font-semibold tracking-tight">
              Brand & Semantica UI
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Colori per le azioni principali, elementi secondari, stati disattivati e accenti di selezione.
            </p>
          </div>
          <ColorGrid>
            <ColorSwatch
              name="Primary"
              variable="--primary"
              foregroundVariable="--primary-foreground"
              description="Azioni primarie e pulsanti principali"
            />
            <ColorSwatch
              name="Primary Foreground"
              variable="--primary-foreground"
              description="Testo su sfondo primario"
            />
            <ColorSwatch
              name="Secondary"
              variable="--secondary"
              foregroundVariable="--secondary-foreground"
              description="Azioni secondarie e pillole"
            />
            <ColorSwatch
              name="Secondary Foreground"
              variable="--secondary-foreground"
              description="Testo su sfondo secondario"
            />
            <ColorSwatch
              name="Muted"
              variable="--muted"
              foregroundVariable="--muted-foreground"
              description="Sfondi neutri, disabled e sezioni secondarie"
            />
            <ColorSwatch
              name="Muted Foreground"
              variable="--muted-foreground"
              description="Didascalie, metadati e placeholder"
            />
            <ColorSwatch
              name="Accent"
              variable="--accent"
              foregroundVariable="--accent-foreground"
              description="Elementi attivi in navigazione e hover"
            />
            <ColorSwatch
              name="Accent Foreground"
              variable="--accent-foreground"
              description="Testo su elementi accent"
            />
          </ColorGrid>
        </section>

        <Separator />

        {/* ── 4. Feedback & Superfici Derivate ─────────── */}
        <section aria-labelledby="feedback-colors-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="feedback-colors-title" className="text-2xl font-semibold tracking-tight">
              Feedback & Superfici Derivate
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Segnali di stato funzionali (successo, avviso, distruzione, informazione) affiancati dalle
              rispettive superfici traslucide <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">-surface</code>.
            </p>
          </div>
          <ColorGrid>
            {/* Success */}
            <ColorSwatch
              name="Success"
              variable="--success"
              foregroundVariable="--success-foreground"
              badge="Solido"
              description="Stati completati, approvati e online"
            />
            <ColorSwatch
              name="Success Surface"
              variable="--success-surface"
              foregroundVariable="--success"
              badge="Tint"
              description="Sfondo per badge e alert di successo"
            />
            <ColorSwatch
              name="Success Foreground"
              variable="--success-foreground"
              description="Testo su sfondo success pieno"
            />

            {/* Warning */}
            <ColorSwatch
              name="Warning"
              variable="--warning"
              foregroundVariable="--warning-foreground"
              badge="Solido"
              description="Avvisi, attenzione e modifiche pendenti"
            />
            <ColorSwatch
              name="Warning Surface"
              variable="--warning-surface"
              foregroundVariable="--warning-emphasis"
              badge="Tint"
              description="Sfondo per badge e alert di avviso"
            />
            <ColorSwatch
              name="Warning Emphasis"
              variable="--warning-emphasis"
              description="Testo ad alto contrasto su warning-surface"
            />

            {/* Destructive */}
            <ColorSwatch
              name="Destructive"
              variable="--destructive"
              foregroundVariable="--destructive-foreground"
              badge="Solido"
              description="Errori critici, eliminazioni e blocchi"
            />
            <ColorSwatch
              name="Destructive Surface"
              variable="--destructive-surface"
              foregroundVariable="--destructive"
              badge="Tint"
              description="Sfondo per messaggi di errore e badge invalid"
            />
            <ColorSwatch
              name="Destructive Foreground"
              variable="--destructive-foreground"
              description="Testo su sfondo distruttivo pieno"
            />

            {/* Info */}
            <ColorSwatch
              name="Info"
              variable="--info"
              foregroundVariable="--info-foreground"
              badge="Solido"
              description="Notifiche informative e aggiornamenti di cantiere"
            />
            <ColorSwatch
              name="Info Surface"
              variable="--info-surface"
              foregroundVariable="--info"
              badge="Tint"
              description="Sfondo per alert e badge informativi"
            />
            <ColorSwatch
              name="Info Foreground"
              variable="--info-foreground"
              description="Testo su sfondo info pieno"
            />
          </ColorGrid>
        </section>

        <Separator />

        {/* ── 5. Form, Bordi & Focus ───────────────────── */}
        <section aria-labelledby="form-borders-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="form-borders-title" className="text-2xl font-semibold tracking-tight">
              Form, Bordi & Focus
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Token per la definizione dei confini visuali, dei controlli di input e degli anelli di focus accessibile.
            </p>
          </div>
          <ColorGrid>
            <ColorSwatch
              name="Border"
              variable="--border"
              description="Bordi di card, separatori e tabelle"
            />
            <ColorSwatch
              name="Input"
              variable="--input"
              description="Bordi e sfondi dei campi di input"
            />
            <ColorSwatch
              name="Ring"
              variable="--ring"
              description="Anello di focus-visible da tastiera"
            />
          </ColorGrid>
        </section>

        <Separator />

        {/* ── 6. Sidebar & Navigazione ─────────────────── */}
        <section aria-labelledby="sidebar-colors-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="sidebar-colors-title" className="text-2xl font-semibold tracking-tight">
              Sidebar & Navigazione
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Token isolati dedicati alla barra laterale di navigazione per consentire temi scuri/chiari indipendenti.
            </p>
          </div>
          <ColorGrid>
            <ColorSwatch
              name="Sidebar"
              variable="--sidebar"
              foregroundVariable="--sidebar-foreground"
              description="Sfondo della sidebar"
            />
            <ColorSwatch
              name="Sidebar Foreground"
              variable="--sidebar-foreground"
              description="Testo e icone della sidebar"
            />
            <ColorSwatch
              name="Sidebar Primary"
              variable="--sidebar-primary"
              foregroundVariable="--sidebar-primary-foreground"
              description="Elemento attivo in sidebar"
            />
            <ColorSwatch
              name="Sidebar Accent"
              variable="--sidebar-accent"
              foregroundVariable="--sidebar-accent-foreground"
              description="Hover su voci di menu"
            />
            <ColorSwatch
              name="Sidebar Border"
              variable="--sidebar-border"
              description="Bordo divisore della sidebar"
            />
            <ColorSwatch
              name="Sidebar Ring"
              variable="--sidebar-ring"
              description="Anello di focus nella sidebar"
            />
          </ColorGrid>
        </section>

        <Separator />

        {/* ── 7. Visualizzazione Dati & Grafici ─────────── */}
        <section aria-labelledby="charts-colors-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="charts-colors-title" className="text-2xl font-semibold tracking-tight">
              Visualizzazione dati & Grafici
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Palette di 5 tonalità graduate per serie temporali, stati di avanzamento e grafici di cantiere.
            </p>
          </div>
          <ColorGrid>
            <ColorSwatch
              name="Chart 1"
              variable="--chart-1"
              description="Serie primaria / Avanzamento principale"
            />
            <ColorSwatch
              name="Chart 2"
              variable="--chart-2"
              description="Serie secondaria / Lavorazioni strutturali"
            />
            <ColorSwatch
              name="Chart 3"
              variable="--chart-3"
              description="Serie terziaria / Impianti e finiture"
            />
            <ColorSwatch
              name="Chart 4"
              variable="--chart-4"
              description="Serie quaternaria / Documentazione"
            />
            <ColorSwatch
              name="Chart 5"
              variable="--chart-5"
              description="Serie quinta / Oneri e sicurezza"
            />
          </ColorGrid>
        </section>

        <Separator />

        {/* ── 8. Guida pratica Tailwind CSS ────────────── */}
        <section aria-labelledby="tailwind-guide-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="tailwind-guide-title" className="text-2xl font-semibold tracking-tight">
              Guida d'uso in Tailwind CSS
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Come utilizzare i token cromatici nei componenti tramite le utility semantiche di Tailwind CSS v4.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Superfici e Testo</CardTitle>
                <CardDescription className="text-xs">
                  Combina sempre lo sfondo con il suo testo associato per contrasto garantito.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3.5 text-xs font-mono leading-relaxed">
                  <code>{`/* Superficie primaria */
<button className="bg-primary text-primary-foreground">
  Azione principale
</button>

/* Card con testo contrastato */
<div className="bg-card text-card-foreground border-border">
  Contenuto scheda
</div>`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Badge & Alert di Feedback</CardTitle>
                <CardDescription className="text-xs">
                  Usa le superfici tinte per avvisi e pillole di stato eleganti e leggibili.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3.5 text-xs font-mono leading-relaxed">
                  <code>{`/* Badge di errore/distruttivo */
<span className="bg-destructive-surface text-destructive">
  Errore rilevato
</span>

/* Alert di avviso con contrasto */
<div className="bg-warning-surface text-warning-emphasis">
  Verifica in corso
</div>`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
