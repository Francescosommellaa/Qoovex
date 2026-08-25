import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@qoovex/ui/components/collapsible";
import { Input } from "@qoovex/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@qoovex/ui/components/tabs";
import { Textarea } from "@qoovex/ui/components/textarea";
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

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";

/* ── State Families Data ──────────────────────────────────────── */

const stateFamilies = [
  {
    name: "Feedback Transiente",
    badge: "Transient",
    states: ["hover", "pressed", "focus-visible"],
    description:
      "Si sovrappone allo stato reale solo quando disponibilità e modalità di input lo consentono. Su touch o screen reader non viene mai simulato come stato persistente.",
  },
  {
    name: "Stato Persistente",
    badge: "Persistent",
    states: ["selected", "checked", "indeterminate", "open"],
    description:
      "Resta leggibile durante hover, press e focus. È gestito direttamente dalla primitive accessibile e non viene ricreato con state manuale in React.",
  },
  {
    name: "Validazione & Sistema",
    badge: "System",
    states: ["invalid", "loading / pending"],
    description:
      "Aggiunge significato semantico senza cancellare la selezione. Lo stato pending mostra il valore reale e blocca solo nuove attivazioni concorrenti.",
  },
  {
    name: "Disponibilità & Accesso",
    badge: "Availability",
    states: ["readonly", "disabled"],
    description:
      "Readonly preserva focus e selezione del testo; disabled sopprime interamente attivazione, hover, press e navigazione da tastiera.",
  },
] as const;

const precedenceSteps = [
  {
    step: "01",
    title: "Base / Rest",
    description: "Geometria iniziale, semantica nativa e conformità WAI-ARIA.",
  },
  {
    step: "02",
    title: "Stato Persistente",
    description: "Valore logico attivo: selected, checked, indeterminate oppure open.",
  },
  {
    step: "03",
    title: "Validazione & Sistema",
    description: "Invalid o loading si sommano allo stato persistente senza mascherarlo.",
  },
  {
    step: "04",
    title: "Disponibilità & Input",
    description: "Readonly, disabled, focus-visible, hover e pressed regolano l'interattività.",
  },
] as const;

const qvAliases = [
  { alias: "qv-hover:", target: ":hover (fine pointer)", purpose: "Hover condizionato a pointer fine (mouse)" },
  { alias: "qv-pressed:", target: ":active, [data-pressed]", purpose: "Feedback di pressione elastica locale" },
  { alias: "qv-selected:", target: "[aria-selected='true'], [data-selected]", purpose: "Selezione persistente in tab e liste" },
  { alias: "qv-checked:", target: "[aria-checked='true'], [data-checked]", purpose: "Stato checked di checkbox e radio" },
  { alias: "qv-indeterminate:", target: "[data-indeterminate]", purpose: "Selezione parziale o mista" },
  { alias: "qv-open:", target: "[data-state='open'], [open]", purpose: "Pannelli e collapsible espansi" },
  { alias: "qv-invalid:", target: "[aria-invalid='true'], :invalid", purpose: "Controllo in errore di validazione" },
  { alias: "qv-readonly:", target: "[readonly], [aria-readonly='true']", purpose: "Dato in sola lettura selezionabile" },
  { alias: "qv-disabled:", target: ":disabled, [aria-disabled='true']", purpose: "Controllo disattivato non interattivo" },
  { alias: "qv-loading:", target: "[data-loading], [aria-busy='true']", purpose: "Attesa asincrona con stato visibile" },
] as const;

/* ── Page Component ───────────────────────────────────────────── */

export default function InteractionStatesFoundationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Interaction states"
        description="La grammatica condivisa che compone stato persistente, validazione, disponibilità e feedback transiente senza perdere semantica."
        importPath="@qoovex/ui/styles/base.css"
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Famiglie di Stato ─────────────────────── */}
        <section aria-labelledby="state-groups-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="state-groups-title" className="text-2xl font-semibold tracking-tight">
              Famiglie di stato
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Gli alias <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">qv-*</code> normalizzano i
              selettori nativi, ARIA e Base UI. Non assegnano globalmente colori o stili arbitrari, ma
              garantiscono coerenza e prevedibilità su tutte le primitive del catalogo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stateFamilies.map((family) => (
              <Card key={family.name} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{family.name}</CardTitle>
                    <Badge variant="outline" size="sm">
                      {family.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {family.states.map((st) => (
                      <Badge key={st} variant="secondary" size="sm" className="font-mono text-xs">
                        {st}
                      </Badge>
                    ))}
                  </div>
                  <CardDescription className="text-xs leading-relaxed">
                    {family.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 2. Composizione e Precedenza ─────────────── */}
        <section aria-labelledby="composition-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="composition-title" className="text-2xl font-semibold tracking-tight">
              Composizione e precedenza
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Gli stati si compongono a livelli: il focus-visible è additivo su ogni controllo focusabile,
              mentre hover e pressed si attivano solo se il controllo è disponibile e la modalità di input lo supporta.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {precedenceSteps.map((step) => (
              <Card key={step.step} variant="outline" size="sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-accent text-xs tabular-nums text-muted-foreground">
                      {step.step}
                    </span>
                    <CardTitle className="text-sm">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 3. Matrice di Prova Interattiva ──────────── */}
        <section aria-labelledby="state-proof-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="state-proof-title" className="text-2xl font-semibold tracking-tight">
              Matrice di prova
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tutte le primitive sotto sono reali e interattive. Usa mouse, tastiera (Tab,
              Spazio, Invio) o touch per verificare come gli stati si compongono senza perdita di semantica.
            </p>
          </div>

          {/* Test container hook required by Playwright suite */}
          <div
            data-interaction-state-foundation
            data-visual-specimen="interaction-state-matrix"
            className="flex flex-col gap-8 bg-card"
          >
            {/* Sottosezione A: Feedback Transiente */}
            <div>
              <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
                Feedback transiente (Hover & Press)
              </h3>
              <SpecimenGrid cols={2}>
                <Specimen title="Pulsante di Azione (rest → hover → pressed)">
                  <div className="flex flex-col items-center gap-2">
                    <Button className="border border-border" variant="ghost">
                      Punta, premi e rilascia
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Feedback locale senza layout shift o selezione persistente
                    </span>
                  </div>
                </Specimen>

                <Specimen title="Toggle Button (selected specifico)">
                  <div className="flex flex-col items-center gap-2">
                    <ToggleButton
                      className="qv-selected:[--qv-state-proof:selected]"
                      data-state-proof="selected-toggle"
                      defaultPressed
                    >
                      Selezionato
                    </ToggleButton>
                    <span className="text-xs text-muted-foreground">
                      Base UI usa data-pressed come selezione su Toggle
                    </span>
                  </div>
                </Specimen>
              </SpecimenGrid>
            </div>

            {/* Sottosezione B: Stati Persistenti */}
            <div>
              <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
                Stati persistenti (Selected, Checked, Open)
              </h3>
              <SpecimenGrid cols={2}>
                <Specimen title="Tabs (selected + hover / focus-visible)">
                  <div className="flex w-full flex-col items-center gap-3">
                    <Tabs defaultValue="riepilogo" className="w-full max-w-xs">
                      <TabsList aria-label="Vista della prova selected" className="w-full">
                        <TabsTrigger
                          className="qv-selected:[--qv-state-proof:selected]"
                          data-state-proof="selected-tab"
                          value="riepilogo"
                        >
                          Riepilogo
                        </TabsTrigger>
                        <TabsTrigger value="attivita">Attività</TabsTrigger>
                      </TabsList>
                      <TabsContent value="riepilogo" className="mt-2 text-center text-xs text-muted-foreground">
                        Vista riepilogo attiva
                      </TabsContent>
                      <TabsContent value="attivita" className="mt-2 text-center text-xs text-muted-foreground">
                        Vista attività alternativa
                      </TabsContent>
                    </Tabs>
                    <span className="text-xs text-muted-foreground">
                      aria-selected resta la fonte persistente dello stato
                    </span>
                  </div>
                </Specimen>

                <Specimen title="Checkbox (checked + focus-visible)">
                  <div className="flex flex-col items-center gap-2">
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox
                        className="qv-checked:[--qv-state-proof:checked]"
                        data-state-proof="checked"
                        defaultChecked
                      />
                      Aggiornamenti condivisi
                    </label>
                    <span className="text-xs text-muted-foreground">
                      Il focus non cancella data-checked né l'indicatore grafico
                    </span>
                  </div>
                </Specimen>

                <Specimen title="Checkbox Indeterminate (Selezione Parziale)">
                  <div className="flex flex-col items-center gap-2">
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox
                        className="qv-indeterminate:[--qv-state-proof:indeterminate]"
                        data-state-proof="indeterminate"
                        indeterminate
                      />
                      Selezione parziale
                    </label>
                    <span className="text-xs text-muted-foreground">
                      Stato misto con indicatore semantico dedicato
                    </span>
                  </div>
                </Specimen>

                <Specimen title="Collapsible (open + rapid interaction)">
                  <div className="flex w-full flex-col items-center gap-2">
                    <Collapsible defaultOpen className="w-full max-w-xs">
                      <CollapsibleTrigger
                        className="qv-touch-target inline-flex min-h-8 w-full items-center justify-between rounded-lg border border-border px-3 text-xs font-medium text-foreground outline-none qv-open:[--qv-state-proof:open] focus-visible:ring-1 focus-visible:ring-ring/30"
                        data-state-proof="open"
                      >
                        <span>Dettagli registrazione</span>
                        <span className="text-xs text-muted-foreground">▼</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
                        <p className="leading-relaxed">Lo stato resta nel DOM durante il lifecycle previsto da Base UI.</p>
                      </CollapsibleContent>
                    </Collapsible>
                    <span className="text-xs text-muted-foreground">
                      Input rapido termina sempre sull'ultima intenzione
                    </span>
                  </div>
                </Specimen>
              </SpecimenGrid>
            </div>

            {/* Sottosezione C: Validazione, Sistema & Disponibilità */}
            <div>
              <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
                Validazione, Sistema & Disponibilità
              </h3>
              <SpecimenGrid cols={2}>
                <Specimen title="Input Invalido (invalid + focus-visible)">
                  <div className="grid w-full max-w-xs gap-1.5">
                    <label className="text-xs font-medium text-foreground" htmlFor="interaction-invalid">
                      Codice cantiere
                    </label>
                    <Input
                      aria-describedby="interaction-invalid-error"
                      aria-invalid="true"
                      className="qv-invalid:[--qv-state-proof:invalid]"
                      data-state-proof="invalid"
                      defaultValue="QV-"
                      id="interaction-invalid"
                    />
                    <p className="text-xs text-destructive font-medium" id="interaction-invalid-error">
                      Inserisci il codice completo.
                    </p>
                  </div>
                </Specimen>

                <Specimen title="Stato Loading (attesa asincrona)">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      className="qv-loading:[--qv-state-proof:loading]"
                      data-state-proof="loading"
                      loading
                    >
                      Salvataggio in corso
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Aria-busy e copy preservano il contesto; disabilita activation
                    </span>
                  </div>
                </Specimen>

                <Specimen title="Sola Lettura (readonly + focus-visible)">
                  <div className="grid w-full max-w-xs gap-2.5">
                    <Input
                      aria-label="Riferimento in sola lettura"
                      className="qv-readonly:[--qv-state-proof:readonly]"
                      data-state-proof="readonly-input"
                      defaultValue="QV-2026-018"
                      readOnly
                    />
                    <Textarea
                      aria-label="Nota in sola lettura"
                      autoResize={false}
                      className="qv-readonly:[--qv-state-proof:readonly]"
                      data-state-proof="readonly-textarea"
                      defaultValue="Registrato nel riepilogo condiviso."
                      readOnly
                      rows={2}
                    />
                  </div>
                </Specimen>

                <Specimen title="Controllo Disattivato (disabled)">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      className="qv-disabled:[--qv-state-proof:disabled]"
                      data-state-proof="disabled"
                      disabled
                    >
                      Azione non disponibile
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Sopprime interamente attivazione, hover e press
                    </span>
                  </div>
                </Specimen>
              </SpecimenGrid>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── 4. Guida agli Alias qv-* ─────────────────── */}
        <section aria-labelledby="qv-aliases-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="qv-aliases-title" className="text-2xl font-semibold tracking-tight">
              Alias di stato Tailwind (<code className="text-xl font-mono">qv-*</code>)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              I variant plugin di Tailwind esportati da <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">@qoovex/ui</code> normalizzano
              gli stati tra Base UI, selector ARIA e pseudo-classi standard.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Alias Tailwind</th>
                    <th className="px-4 py-3 font-medium">Target Selettore</th>
                    <th className="px-4 py-3 font-medium">Scopo e Regola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {qvAliases.map((row) => (
                    <tr key={row.alias} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">
                        {row.alias}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {row.target}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground leading-relaxed">
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
