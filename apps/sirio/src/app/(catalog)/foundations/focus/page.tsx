import type { ReactNode } from "react";

import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@qoovex/ui/components/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { Input, InputAddon, InputGroup } from "@qoovex/ui/components/input";
import { Radio, RadioGroup } from "@qoovex/ui/components/radio-group";
import { Switch } from "@qoovex/ui/components/switch";
import { ToggleButton } from "@qoovex/ui/components/toggle-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { Separator } from "@qoovex/ui/components/separator";
import { Specimen } from "@/components/specimen";
import { PageHeader } from "@/components/page-header";

/* ── Focus Data ───────────────────────────────────────────────── */

const lifecycle = [
  {
    step: "01",
    phase: "Unfocused",
    rule: "Lo stato resta completo senza dipendere dall’indicatore visivo.",
  },
  {
    step: "02",
    phase: "Focus-visible",
    rule: "Tab o navigazione da tastiera mostrano subito l’outline canonico a 2px.",
  },
  {
    step: "03",
    phase: "Interaction",
    rule: "Enter, Spazio e frecce agiscono senza rimuovere selection o validation.",
  },
  {
    step: "04",
    phase: "Transfer",
    rule: "Un overlay (dialog o menu) riceve il focus secondo il lifecycle Base UI.",
  },
  {
    step: "05",
    phase: "Restoration",
    rule: "Chiusura ed Escape riportano il focus al trigger stabile di origine.",
  },
] as const;

const combinations = [
  { state: "selected + focus", badge: "Persistent", rule: "La selezione resta leggibile; l’outline si aggiunge senza mascherarla." },
  { state: "checked + focus", badge: "Persistent", rule: "Indicatore checked e focus-visible convivono nello stesso controllo." },
  { state: "invalid + focus", badge: "Validation", rule: "Bordo e messaggio invalid non vengono sostituiti dall'anello di focus." },
  { state: "readonly + focus", badge: "Availability", rule: "Il contenuto resta selezionabile e il focus localizzabile." },
  { state: "destructive + focus", badge: "Feedback", rule: "Il tono semantico distruttivo resta distinto dall’outline neutro." },
  { state: "open + focus", badge: "Persistent", rule: "Lo stato open resta indipendente dal focus della tastiera." },
] as const;

const transferSteps = [
  { step: "1", title: "Trigger Stabile", desc: "L'utente preme Enter o Spazio sul pulsante trigger." },
  { step: "2", title: "Focus Trap & Initial Focus", desc: "Il focus si sposta al primo campo interattivo nel dialog." },
  { step: "3", title: "Ciclo Tab Ristretto", desc: "La navigazione con Tab circola solo all'interno dell'overlay." },
  { step: "4", title: "Restoration Automatica", desc: "Escape o chiusura restituiscono il focus al trigger originario." },
] as const;

/* ── Page Component ───────────────────────────────────────────── */

export default function FocusFoundationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl" data-focus-foundation>
      <PageHeader
        title="Focus"
        description="Un indicatore immediato e condiviso, additivo agli stati reali e governato da Base UI quando il focus si trasferisce tra superfici."
        importPath="@qoovex/ui/styles/base.css"
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Lifecycle Canonico ─────────────────────── */}
        <section aria-labelledby="focus-lifecycle-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="focus-lifecycle-title" className="text-2xl font-semibold tracking-tight">
              Lifecycle canonico
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Il focus non è un’animazione. Segui il percorso con Tab, Shift+Tab, Enter, Spazio ed Escape: ogni fase usa focus DOM reale.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {lifecycle.map((item) => (
              <Card key={item.phase} variant="outline" size="sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-accent text-xs tabular-nums text-muted-foreground">
                      {item.step}
                    </span>
                    <CardTitle className="text-sm font-semibold">{item.phase}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {item.rule}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 2. Percorso Tastiera Reale ───────────────── */}
        <section aria-labelledby="focus-keyboard-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="focus-keyboard-title" className="text-2xl font-semibold tracking-tight">
              Percorso tastiera reale
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Outline opaco da 2px con offset 2px. Non cambia la box geometry, non transiziona e resta separato da hover, pressed e stato persistente.
            </p>
          </div>

          <div
            className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3"
            data-visual-specimen="focus-system"
          >
            <ProofCell label="Link (variant=link)">
              <a
                className="text-primary"
                data-link="inline"
                data-focus-proof="link"
                href="#focus-transfer"
              >
                Contratto focus
              </a>
            </ProofCell>

            <ProofCell label="Button">
              <Button data-focus-proof="button">Azione primaria</Button>
            </ProofCell>

            <ProofCell label="Selected + focus">
              <ToggleButton data-focus-proof="selected" defaultPressed>
                Vista selezionata
              </ToggleButton>
            </ProofCell>

            <ProofCell label="Checked + focus">
              <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                <Checkbox data-focus-proof="checkbox" defaultChecked />
                Aggiornamenti
              </label>
            </ProofCell>

            <ProofCell label="Radio + focus">
              <RadioGroup aria-label="Priorità" defaultValue="alta">
                <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                  <Radio data-focus-proof="radio" value="alta" />
                  Priorità alta
                </label>
              </RadioGroup>
            </ProofCell>

            <ProofCell label="Switch + focus">
              <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                <Switch data-focus-proof="switch" defaultChecked />
                Notifiche
              </label>
            </ProofCell>

            <ProofCell label="Input">
              <Input aria-label="Riferimento" data-focus-proof="input" defaultValue="QV-2026" />
            </ProofCell>

            <ProofCell label="Invalid + focus">
              <div className="grid w-full gap-1.5">
                <label className="text-xs font-medium text-foreground" htmlFor="focus-invalid">
                  Codice cantiere
                </label>
                <Input
                  aria-describedby="focus-invalid-message"
                  aria-invalid="true"
                  data-focus-proof="invalid"
                  defaultValue="QV-"
                  id="focus-invalid"
                />
                <p className="text-xs font-medium text-destructive" id="focus-invalid-message">
                  Inserisci il codice completo.
                </p>
              </div>
            </ProofCell>

            <ProofCell label="Readonly + focus">
              <Input
                aria-label="Riferimento in sola lettura"
                data-focus-proof="readonly"
                defaultValue="QV-2026-018"
                readOnly
              />
            </ProofCell>

            <ProofCell label="Composite owner">
              <InputGroup data-focus-proof="composite">
                <InputAddon position="left">QV</InputAddon>
                <Input
                  aria-label="Codice composito"
                  className="rounded-l-none border-0"
                  data-focus-proof="composite-input"
                  defaultValue="2026-018"
                />
              </InputGroup>
            </ProofCell>

            <ProofCell label="Destructive + focus">
              <Button data-focus-proof="destructive" variant="destructive">
                Rimuovi bozza
              </Button>
            </ProofCell>

            <ProofCell label="Open + focus">
              <Collapsible defaultOpen className="w-full">
                <CollapsibleTrigger
                  className="qv-touch-target inline-flex min-h-8 items-center rounded-lg border border-border px-3 text-sm font-medium text-foreground"
                  data-focus-proof="open"
                >
                  Dettagli aperti
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 text-xs text-muted-foreground">
                  <p className="py-1 leading-relaxed">Lo stato open resta indipendente dal focus.</p>
                </CollapsibleContent>
              </Collapsible>
            </ProofCell>
          </div>
        </section>

        <Separator />

        {/* ── 3. Composizione ──────────────────────────── */}
        <section aria-labelledby="focus-composition-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="focus-composition-title" className="text-2xl font-semibold tracking-tight">
              Composizione e precedenza
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Focus-visible è sempre additivo quando l’elemento resta focusabile; availability e semantica sottostante non vengono riscritte.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {combinations.map((c) => (
              <Card key={c.state} size="sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="font-mono text-xs font-semibold">{c.state}</CardTitle>
                    <Badge variant="outline" size="sm">
                      {c.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {c.rule}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 4. Transfer e Restoration ────────────────── */}
        <section aria-labelledby="focus-transfer-title" id="focus-transfer">
          <div className="mb-5 max-w-3xl">
            <h2 id="focus-transfer-title" className="text-2xl font-semibold tracking-tight">
              Transfer e restoration (Overlay)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Quando si apre un dialog, Base UI cattura il focus, lo indirizza al primo controllo interno e impedisce la fuoriuscita da tastiera (Focus Trap). Alla chiusura o premendo <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">Escape</kbd>, il focus viene ripristinato sul trigger.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Steps card */}
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Regole di trasferimento</CardTitle>
                <CardDescription className="text-xs">Ciclo di vita del focus gestito da Base UI</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {transferSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-3 text-xs">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-accent text-xs font-semibold text-foreground">
                      {s.step}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground">{s.title}</span>
                      <span className="text-muted-foreground">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Interactive Specimen */}
            <Specimen title="Specimen Interattivo: Dialog Transfer">
              <div className="flex flex-col items-center gap-3 p-4 text-center">
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button data-focus-proof="dialog-trigger" variant="outline" className="gap-2">
                        <span>Apri prova focus</span>
                        <Badge variant="secondary" size="sm" className="font-mono text-xs">Enter</Badge>
                      </Button>
                    }
                  />
                  <DialogContent closeButtonProps={{ "aria-label": "Chiudi prova di focus" }}>
                    <DialogHeader>
                      <DialogTitle>Trasferimento del focus</DialogTitle>
                      <DialogDescription>
                        Base UI gestisce focus iniziale, trap ciclico, Escape e ripristino al trigger di partenza.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-2">
                      <div className="grid gap-1.5 text-left">
                        <label className="text-xs font-medium text-foreground" htmlFor="dialog-initial-input">
                          Nome della vista operativa
                        </label>
                        <Input
                          aria-label="Nome della vista"
                          data-focus-proof="dialog-initial"
                          id="dialog-initial-input"
                          placeholder="Vista operativa principale"
                          defaultValue="Revisione Cantiere Milano"
                        />
                      </div>
                      <p className="text-left text-xs text-muted-foreground">
                        Premi <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs">Tab</kbd> per spostarti sui pulsanti di azione, oppure <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs">Escape</kbd> per chiudere.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose
                        render={
                          <Button variant="outline">
                            Chiudi e ripristina
                          </Button>
                        }
                      />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <span className="text-xs text-muted-foreground">
                  Clicca o premi Enter sul pulsante sopra per testare il transfer
                </span>
              </div>
            </Specimen>
          </div>
        </section>

        <Separator />

        {/* ── 5. Focus Not Obscured (WCAG 2.2) ─────────── */}
        <section aria-labelledby="focus-obscured-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="focus-obscured-title" className="text-2xl font-semibold tracking-tight">
              Focus not obscured (WCAG 2.2 SC 2.4.11 / 2.4.12)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Gli elementi sticky (come topbar o intestazioni di sezione) non devono coprire o nascondere i controlli quando ricevono il focus da tastiera. La combinazione di <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">scroll-padding-top</code> sul contenitore e <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">scroll-margin-top</code> sul target riserva lo spazio visivo necessario.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Technical Explanation Card */}
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Meccanica Focus Not Obscured</CardTitle>
                <CardDescription className="text-xs">Come Qoovex previene l'occlusione del focus</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">Scrollport Padding:</strong> Il contenitore con scroll definisce <code className="rounded bg-muted px-1 font-mono text-xs">scroll-py-14</code> con spazio sufficiente per la barra sticky di questo specimen.
                </p>
                <p>
                  <strong className="text-foreground">Target Margin:</strong> L'elemento interattivo possiede <code className="rounded bg-muted px-1 font-mono text-xs">scroll-m-14</code>. Quando l'utente naviga con Tab, il browser calcola la posizione arrestando lo scroll prima che il controllo finisca sotto l'header.
                </p>
                <div className="mt-1 rounded-lg border border-border/80 bg-muted/30 p-3 text-xs font-mono">
                  <code>{`<div className="scroll-py-14 overflow-y-auto">\n  <header className="sticky top-0 z-10">...</header>\n  <button className="scroll-m-14">Azione</button>\n</div>`}</code>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Scroll Container */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">Specimen Interattivo: Scrollport con Sticky Header</h3>
              <div
                className="relative h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-2xs scroll-py-14"
                data-focus-scrollport
              >
                {/* Sticky Header */}
                <div
                  className="sticky top-0 z-10 flex items-center justify-between border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur-xs"
                  data-focus-sticky
                >
                  <span className="text-xs font-semibold text-foreground">
                    Filtri & Lavorazioni Cantiere
                  </span>
                  <Badge variant="outline" size="sm" className="font-accent text-xs">
                    STICKY HEADER
                  </Badge>
                </div>

                {/* Scrollable Items */}
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">01. Tracciamento muri divisori</span>
                      <span className="text-xs text-muted-foreground">Fase strutturale attiva</span>
                    </div>
                    <a
                      className="text-sm text-primary"
                      data-link="inline"
                      href="#focus-obscured-title"
                    >
                      Primo target
                    </a>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <span className="text-xs font-medium text-foreground">02. Posa canalizzazioni impianto elettrico</span>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Verifica quote di altezza scatole di derivazione secondo schema esecutivo.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <span className="text-xs font-medium text-foreground">03. Collaudo tubazioni idrauliche sottotraccia</span>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Prova di pressione a 6 bar registrata nel registro di cantiere.
                    </p>
                  </div>

                  {/* Target Button with scroll-m-14 */}
                  <div className="flex flex-col items-start gap-2 pt-2 border-t border-border/40">
                    <span className="text-xs font-accent text-muted-foreground">
                      PUNTO DI ARRESTO SCROLL (NAVIGA CON TAB)
                    </span>
                    <Button
                      className="scroll-m-14"
                      data-focus-proof="not-obscured"
                      variant="outline"
                      size="sm"
                    >
                      Ultimo target visibile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── ProofCell Component ──────────────────────────────────────── */

function ProofCell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <article className="flex min-w-0 flex-col gap-2.5 rounded-lg border border-border/80 bg-background p-3.5">
      <span className="font-accent text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center">{children}</div>
    </article>
  );
}
