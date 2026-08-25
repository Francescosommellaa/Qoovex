"use client";

import { PageHeader } from "@/components/page-header";
import { SpacingSpecimen, RadiusSpecimen } from "@/components/token-explorer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { Separator } from "@qoovex/ui/components/separator";

/* ── Geometry Principles ──────────────────────────────────────── */

const layoutPrinciples = [
  {
    title: "Griglia Base a 4px",
    description:
      "Ogni token di spaziatura deriva dal multiplo base --spacing: 0.25rem (4px). Garantisce ritmo verticale prevedibile ed evita disallineamenti di sub-pixel.",
  },
  {
    title: "Raggio Proporzionale",
    description:
      "La scala canonica deriva dal raggio base di 10px. Tra superfici nidificate la curvatura non si sceglie a occhio: R esterno = R interno + padding.",
  },
  {
    title: "Target di Tocco Minimo (44px)",
    description:
      "Tutti i controlli interattivi su dispositivi touch rispettano l'area di tocco minima --touch-target-min: 2.75rem (44px) per la conformità WCAG AA.",
  },
] as const;

const controlDimensions = [
  {
    name: "Icona Standard",
    token: "--icon",
    size: "1rem (16px)",
    useCase: "Dimensioni delle icone inline, leading/trailing nei pulsanti e nei campi.",
  },
  {
    name: "Controllo Compatto",
    token: "--control",
    size: "2rem (32px)",
    useCase: "Altezza standard di bottoni compatti, switch e badge operativi.",
  },
  {
    name: "Controllo Prominente",
    token: "--control-lg",
    size: "2.5rem (40px)",
    useCase: "Campi di input principali, pulsanti primari e trigger di selezione.",
  },
  {
    name: "Target di Tocco Minimo",
    token: "--touch-target-min",
    size: "2.75rem (44px)",
    useCase: "Area minima calcolata per interazioni touch senza collisioni.",
  },
] as const;

const shadowLevels = [
  { name: "2XS", token: "--shadow-2xs", desc: "Bordi minimi e accenti leggeri" },
  { name: "XS", token: "--shadow-xs", desc: "Elementi piatti e controlli inline" },
  { name: "SM", token: "--shadow-sm", desc: "Card standard e bottoni in hover" },
  { name: "MD", token: "--shadow-md", desc: "Dropdown e menu contestuali" },
  { name: "LG", token: "--shadow-lg", desc: "Modali, dialog e fogli laterali" },
  { name: "XL / 2XL", token: "--shadow-xl", desc: "Overlay e layer di massimo rilievo" },
] as const;

/* ── Page Component ───────────────────────────────────────────── */

export default function SpacingAndRadiusPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Spaziatura & Geometria"
        description="Le scale di spaziatura a 4px, raggi di curvatura, altezze dei controlli e aree di tocco minime per garantire consistenza e armonia spaziale."
        importPath="import '@qoovex/ui/styles/tokens.css'"
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Principi di Geometria ─────────────────── */}
        <section aria-labelledby="geometry-principles-title">
          <h2 id="geometry-principles-title" className="mb-5 text-2xl font-semibold tracking-tight">
            Principi di layout e ritmo
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {layoutPrinciples.map((p) => (
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

        {/* ── 2. Scala di Spaziatura Semantica ─────────── */}
        <section aria-labelledby="spacing-scale-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="spacing-scale-title" className="text-2xl font-semibold tracking-tight">
              Scala di spaziatura semantica
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tutti i token di padding, margin e gap derivano dalla scala a 4px. Clicca su uno specimen per copiare la variabile CSS.
            </p>
          </div>

          <div
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-6"
            data-visual-specimen="spacing-scale"
          >
            <SpacingSpecimen
              name="Space 1"
              variable="--space-1"
              size="0.25rem (4px)"
              useCase="Gap minimo tra icone e micro-testi, padding interno badge"
            />
            <SpacingSpecimen
              name="Space 2"
              variable="--space-2"
              size="0.5rem (8px)"
              useCase="Spaziatura tra pulsanti compatti e all'interno di elementi lista"
            />
            <SpacingSpecimen
              name="Space 3"
              variable="--space-3"
              size="0.75rem (12px)"
              useCase="Padding per bottoni, input e intestazioni compatte"
            />
            <SpacingSpecimen
              name="Space 4"
              variable="--space-4"
              size="1rem (16px)"
              useCase="Padding standard per card, modali e distacco tra form field"
            />
            <SpacingSpecimen
              name="Space 5"
              variable="--space-5"
              size="1.25rem (20px)"
              useCase="Padding per sezioni interne di schede complesse"
            />
            <SpacingSpecimen
              name="Space 6"
              variable="--space-6"
              size="1.5rem (24px)"
              useCase="Gap tra sezioni principali di layout e margini di pagina"
            />
          </div>
        </section>

        <Separator />

        {/* ── 3. Raggi di Curvatura (Border Radius) ─────── */}
        <section aria-labelledby="radius-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="radius-title" className="text-2xl font-semibold tracking-tight">
              Raggi di curvatura (Border Radius)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La scala canonica deriva dal solo <code>--radius: 0.625rem</code>. Le superfici nidificate rispettano sempre la geometria concentrica: raggio esterno = raggio interno + padding reale; le pill restano pill.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <RadiusSpecimen
              name="Small"
              variable="--radius-sm"
              size="0.375rem (6px)"
              useCase="Geometrie compatte non-pill"
            />
            <RadiusSpecimen
              name="Medium"
              variable="--radius-md"
              size="0.5rem (8px)"
              useCase="Controlli e superfici compatte"
            />
            <RadiusSpecimen
              name="Large (Base)"
              variable="--radius-lg"
              size="0.625rem (10px)"
              useCase="Default Qoovex per componenti e superfici"
            />
            <RadiusSpecimen
              name="Extra Large"
              variable="--radius-xl"
              size="0.875rem (14px)"
              useCase="Superfici ampie quando la proporzione lo richiede"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)]">
            <div>
              <h3 className="text-base font-semibold">Formula obbligatoria per il nesting</h3>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Questa proof usa un padding reale di 8px: il contenitore esterno misura 18px e il child 10px. I bordi corrispondenti rimangono concentrici perché <code>18 = 10 + 8</code>.
              </p>
              <div
                className="mt-4 border border-border bg-muted"
                data-radius-layer="outer"
                data-visual-specimen="nested-radius-formula"
                style={{
                  borderRadius: "calc(var(--radius) + var(--space-2))",
                  padding: "var(--space-2)",
                }}
              >
                <div
                  className="min-h-32 border border-border bg-card p-5"
                  data-radius-layer="inner"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <code className="text-xs text-muted-foreground">
                    R interno = max(0px, R esterno - padding)
                  </code>
                  <p className="mt-2 text-sm leading-relaxed">
                    La formula usa l&apos;inset effettivo per ciascun angolo, non il nome approssimativo di un token.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius)] border border-border bg-card p-5">
              <h3 className="text-base font-semibold">Eccezione semantica: pill</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Badge, switch, indicatori e controlli dichiaratamente pill conservano <code>rounded-full</code>; non vengono convertiti nella scala sottrattiva.
              </p>
              <div className="mt-5 flex min-h-20 items-center justify-center rounded-[var(--radius-md)] bg-muted p-3">
                <span className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                  Pill invariata
                </span>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── 4. Altezze Controlli & Aree Touch ─────────── */}
        <section aria-labelledby="controls-touch-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="controls-touch-title" className="text-2xl font-semibold tracking-tight">
              Altezze controlli & Target di tocco
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Dimensioni unificate per controlli di input e pulsanti per garantire allineamento orizzontale e accessibilità tattile su schermi touch.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {controlDimensions.map((ctrl) => (
              <Card key={ctrl.token} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <CardTitle className="text-sm font-semibold">{ctrl.name}</CardTitle>
                      <code className="text-xs font-mono text-muted-foreground">{ctrl.token}</code>
                    </div>
                    <Badge variant="outline" size="sm">
                      {ctrl.size}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex h-14 w-full items-center justify-center rounded-lg border border-border/50 bg-muted/40 p-2">
                    <div
                      className="flex items-center justify-center rounded-md border border-foreground/30 bg-background px-3 text-xs font-mono font-medium shadow-2xs"
                      style={{ height: `var(${ctrl.token})` }}
                    >
                      {ctrl.size}
                    </div>
                  </div>
                  <CardDescription className="text-xs leading-relaxed">
                    {ctrl.useCase}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 5. Elevazione & Ombre Semantiche ─────────── */}
        <section aria-labelledby="shadows-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="shadows-title" className="text-2xl font-semibold tracking-tight">
              Elevazione & Ombre semantiche
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Le ombre forniscono profondità e separazione visiva per elementi in sovrapposizione e livelli di interazione.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {shadowLevels.map((sh) => (
              <div
                key={sh.token}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3 text-center transition-transform hover:scale-[1.02]"
              >
                <div
                  className="flex h-16 w-full items-center justify-center rounded-md border border-border/40 bg-background text-xs font-semibold"
                  style={{ boxShadow: `var(${sh.token})` }}
                >
                  {sh.name}
                </div>
                <div className="flex flex-col">
                  <code className="font-mono text-xs text-muted-foreground">{sh.token}</code>
                  <span className="mt-0.5 text-xs text-muted-foreground">{sh.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 6. Guida d'Uso in Tailwind CSS ───────────── */}
        <section aria-labelledby="tailwind-spacing-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="tailwind-spacing-title" className="text-2xl font-semibold tracking-tight">
              Guida pratica Tailwind CSS
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Come combinare le utility di spaziatura, raggio e dimensione nei componenti.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Padding, Margin & Gap</CardTitle>
                <CardDescription className="text-xs">
                  Usa i token --space per mantenere il ritmo a 4px.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3.5 text-xs font-mono leading-relaxed">
                  <code>{`/* Card con padding 16px e gap 8px */
<div className="p-[var(--space-4)] gap-[var(--space-2)] flex flex-col">
  <h2>Titolo</h2>
  <p>Contenuto</p>
</div>`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Altezza Controlli & Raggi</CardTitle>
                <CardDescription className="text-xs">
                  Usa le utility semantiche per bottoni e superfici.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3.5 text-xs font-mono leading-relaxed">
                  <code>{`/* Controllo con altezza e raggio canonici */
<button className="h-[var(--control)] rounded-md px-3 text-sm">
  Azione
</button>

/* Nesting: R esterno = R interno + padding */
<div className="rounded-[calc(var(--radius)+var(--space-2))] p-[var(--space-2)]">
  <div className="rounded-[var(--radius)]">Contenuto</div>
</div>

/* Area touch minima 44px garantita */
<button className="min-h-[var(--touch-target-min)] px-4">
  Touch Action
</button>`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
