import { PageHeader } from "@/components/page-header";
import { MotionFoundationLab } from "@/components/motion-foundation-lab";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { Separator } from "@qoovex/ui/components/separator";

/* ── Data ─────────────────────────────────────────────────────── */

const principles = [
  {
    title: "Vivo ma calmo",
    description:
      "Il movimento conferisce presenza all'interfaccia senza mai competere per l'attenzione. Ogni transizione ha una ragione; se non la ha, non esiste.",
  },
  {
    title: "Semantico, non decorativo",
    description:
      "La durata descrive il motivo della transizione, non il componente che la usa. Nessun ruolo autorizza transition-all: le proprietà restano esplicite.",
  },
  {
    title: "Comprensibile senza movimento",
    description:
      "Con prefers-reduced-motion lo stato cambia istantaneamente. L'informazione è identica; solo il percorso visuale è diverso.",
  },
] as const;

const roles = [
  {
    name: "Instant",
    token: "--motion-duration-instant",
    value: "100 ms",
    ms: 100,
    use: "Percezione immediata e opacity breve senza latenza apparente.",
    properties: ["opacity", "color"],
    avoid: "Movimento spaziale e lifecycle di superficie.",
  },
  {
    name: "Feedback",
    token: "--motion-duration-feedback",
    value: "160 ms",
    ms: 160,
    use: "Hover fine-pointer, press e risposta tattile locale.",
    properties: ["color", "border", "opacity", "transform locale"],
    avoid: "Stato persistente e attese asincrone.",
  },
  {
    name: "State",
    token: "--motion-duration-state",
    value: "200 ms",
    ms: 200,
    use: "Continuità tra checked, selected, expanded e stato reale.",
    properties: ["transform", "opacity", "color"],
    avoid: "Entrata o uscita di overlay.",
  },
  {
    name: "Surface",
    token: "--motion-duration-surface",
    value: "300 ms",
    ms: 300,
    use: "Presence, distanza spaziale e orientamento tra superfici.",
    properties: ["transform", "opacity", "clip quando motivato"],
    avoid: "Input frequente e feedback di controllo.",
  },
] as const;

const easings = [
  {
    name: "Standard",
    token: "--ease-standard",
    value: "cubic-bezier(0.2, 0, 0, 1)",
    cp1: [0.2, 0] as const,
    cp2: [0, 1] as const,
    use: "Feedback e cambi di stato ordinari. Risposta controllata e diretta.",
    pairedWith: "instant · feedback · state",
  },
  {
    name: "Emphasized",
    token: "--ease-emphasized",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    cp1: [0.16, 1] as const,
    cp2: [0.3, 1] as const,
    use: "Decelerazione più leggibile per presence e distanza spaziale.",
    pairedWith: "surface",
  },
] as const;

const phases = [
  {
    name: "Rest",
    description: "Lo stato reale e quello visuale coincidono.",
  },
  {
    name: "Interaction",
    description: "L'input viene ricevuto senza attese o blocchi.",
  },
  {
    name: "Transition",
    description: "Il valore visuale retargetta dalla posizione corrente.",
  },
  {
    name: "Settled",
    description: "La transizione termina sullo stato reale più recente.",
  },
] as const;

/* ── Helpers ──────────────────────────────────────────────────── */

function EasingCurve({
  cp1,
  cp2,
}: {
  cp1: readonly [number, number];
  cp2: readonly [number, number];
}) {
  const d = `M 0 100 C ${cp1[0] * 100} ${100 - cp1[1] * 100} ${cp2[0] * 100} ${100 - cp2[1] * 100} 100 0`;

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-full" aria-hidden="true">
      {/* Axes */}
      <line x1="0" y1="100" x2="100" y2="100" stroke="var(--border)" strokeWidth="1" />
      <line x1="0" y1="100" x2="0" y2="0" stroke="var(--border)" strokeWidth="1" />
      <line
        x1="0"
        y1="0"
        x2="100"
        y2="0"
        stroke="var(--border)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="0"
        stroke="var(--border)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
      {/* Linear reference */}
      <line
        x1="0"
        y1="100"
        x2="100"
        y2="0"
        stroke="var(--muted-foreground)"
        strokeWidth="0.5"
        strokeDasharray="2 2"
        opacity="0.4"
      />
      {/* Curve */}
      <path d={d} fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function MotionFoundationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Motion"
        description="La grammatica del movimento Qoovex: vivo ma calmo, semantico, interrompibile e comprensibile anche con movimento ridotto."
        importPath="@qoovex/ui/styles/base.css · @qoovex/ui/lib/motion"
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Principi ──────────────────────────────── */}
        <section aria-labelledby="motion-principles-title">
          <h2
            id="motion-principles-title"
            className="mb-5 text-2xl font-semibold tracking-tight"
          >
            Principi
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {principles.map((p) => (
              <Card key={p.title} variant="ghost" size="sm">
                <CardHeader>
                  <CardTitle>{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{p.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 2. Token di durata ──────────────────────── */}
        <section aria-labelledby="motion-duration-title">
          <div className="mb-5 max-w-3xl">
            <h2
              id="motion-duration-title"
              className="text-2xl font-semibold tracking-tight"
            >
              Token di durata
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Quattro ruoli semantici: la durata descrive il motivo della transizione, non il
              componente. Le proprietà restano esplicite — nessun ruolo autorizza{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">transition-all</code>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.token} size="sm" data-visual-specimen="motion-roles">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{role.name}</CardTitle>
                      <code className="text-xs text-muted-foreground">{role.token}</code>
                    </div>
                    <Badge variant="outline" size="sm">
                      {role.value}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {/* Duration bar */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${(role.ms / 300) * 100}%` }}
                      />
                    </div>
                    <span className="font-accent text-xs tabular-nums text-muted-foreground">
                      {role.value}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{role.use}</p>

                  <div className="flex flex-wrap gap-1">
                    {role.properties.map((prop) => (
                      <Badge key={prop} variant="secondary" size="sm">
                        {prop}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Da evitare: </span>
                    {role.avoid}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 3. Curve di easing ──────────────────────── */}
        <section aria-labelledby="motion-easing-title">
          <div className="mb-5 max-w-3xl">
            <h2
              id="motion-easing-title"
              className="text-2xl font-semibold tracking-tight"
            >
              Curve di easing
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Due curve che coprono l'intera gamma: standard per feedback diretto, emphasized per
              presenza spaziale. Entrambe favoriscono decelerazione naturale.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {easings.map((easing) => (
              <Card key={easing.token} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{easing.name}</CardTitle>
                      <code className="text-xs text-muted-foreground">{easing.token}</code>
                    </div>
                    <Badge variant="outline" size="sm">
                      {easing.pairedWith}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <EasingCurve cp1={easing.cp1} cp2={easing.cp2} />
                  </div>
                  <code className="text-xs text-muted-foreground">{easing.value}</code>
                  <p className="text-sm text-muted-foreground">{easing.use}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 4. Laboratorio di interazione ───────────── */}
        <section aria-labelledby="motion-lab-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="motion-lab-title" className="text-2xl font-semibold tracking-tight">
              Laboratorio di interazione
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Controlla la preferenza di preview, esegui, inverti o ripeti rapidamente l'input. I
              quattro specimen semantici condividono lo stesso stato reale ma applicano ruoli
              differenti; gli altri esempi isolano easing e consumer runtime.
            </p>
          </div>
          <MotionFoundationLab />
        </section>

        <Separator />

        {/* ── 5. Fasi del ciclo ──────────────────────── */}
        <section aria-labelledby="motion-phases-title">
          <div className="mb-5 max-w-3xl">
            <h2
              id="motion-phases-title"
              className="text-2xl font-semibold tracking-tight"
            >
              Fasi del ciclo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ogni interazione attraversa quattro fasi. La fase osservata non sostituisce lo stato
              del prodotto: serve a verificare causalità, retargeting e corrispondenza finale.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((phase, index) => (
              <Card key={phase.name} variant="outline" size="sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <CardTitle>{phase.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{phase.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 6. Guida pratica ────────────────────────── */}
        <section aria-labelledby="motion-guide-title">
          <div className="mb-5 max-w-3xl">
            <h2
              id="motion-guide-title"
              className="text-2xl font-semibold tracking-tight"
            >
              Guida pratica
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Come usare i token nei componenti. CSS è la scelta predefinita;{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                resolveMotionTransition
              </code>{" "}
              serve solo quando il consumer ha bisogno di valori numerici a runtime.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* CSS snippet */}
            <Card size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>CSS</CardTitle>
                  <Badge variant="secondary" size="sm">
                    Predefinito
                  </Badge>
                </div>
                <CardDescription>
                  Usa direttamente i custom property. Dichiara sempre le proprietà esplicite.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                  <code>{`.my-element {
  transition-property: opacity, transform;
  transition-duration:
    var(--motion-duration-instant),
    var(--motion-duration-state);
  transition-timing-function:
    var(--ease-standard),
    var(--ease-standard);
}

@media (prefers-reduced-motion: reduce) {
  .my-element {
    transition-property: opacity;
    transition-duration:
      var(--motion-duration-feedback);
  }
}`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Runtime snippet */}
            <Card size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Runtime</CardTitle>
                  <Badge variant="outline" size="sm">
                    Solo se necessario
                  </Badge>
                </div>
                <CardDescription>
                  Proietta i token CSS in secondi e tuple Bézier per Motion o animazioni JS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                  <code>{`import {
  resolveMotionTransition
} from "@qoovex/ui/lib/motion";

const styles = getComputedStyle(el);
const t = resolveMotionTransition(
  styles,
  "state",      // ruolo durata
  "standard",   // curva easing
  prefersReduced
);
// → { duration: 0.2, ease: [0.2, 0, 0, 1] }`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Reduced motion guide */}
            <Card size="sm" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Movimento ridotto</CardTitle>
                  <Badge variant="info" size="sm">
                    Obbligatorio
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-success">✓</span>
                    <span>
                      Rimuovi{" "}
                      <code className="rounded bg-muted px-1 text-xs">transform</code>{" "}
                      spaziale — cambia solo colore, opacity o proprietà non spaziali.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-success">✓</span>
                    <span>
                      Usa{" "}
                      <code className="rounded bg-muted px-1 text-xs">
                        --motion-duration-feedback
                      </code>{" "}
                      per le transizioni residue.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-success">✓</span>
                    <span>
                      Il runtime restituisce{" "}
                      <code className="rounded bg-muted px-1 text-xs">
                        {"{ duration: 0 }"}
                      </code>{" "}
                      quando reduced è attivo.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-destructive">✗</span>
                    <span>
                      Non disabilitare tutte le transizioni — il feedback non spaziale rimane
                      attivo.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
