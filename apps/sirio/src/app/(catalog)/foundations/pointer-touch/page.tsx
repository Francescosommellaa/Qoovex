"use client";

import {
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { IconClick } from "@tabler/icons-react";

import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Input } from "@qoovex/ui/components/input";
import { Separator } from "@qoovex/ui/components/separator";
import { Switch } from "@qoovex/ui/components/switch";

import { PageHeader } from "@/components/page-header";

const lifecycle = [
  ["01", "Rest", "Target disponibile; nessuno stato transient."],
  ["02", "Pointer down", "Il feedback pressed inizia prima del click."],
  ["03", "Release inside", "L'activation resta native o Base UI."],
  ["04", "Release outside / cancel", "Nessuna activation e nessuno stato sticky."],
  ["05", "Settled", "Il visuale torna coerente con lo stato reale."],
] as const;

export default function PointerTouchFoundationPage() {
  const [phase, setPhase] = useState("rest");
  const [pointerType, setPointerType] = useState("none");
  const [activations, setActivations] = useState(0);

  function beginPress(event: ReactPointerEvent<HTMLElement>) {
    setPointerType(event.pointerType || "unknown");
    setPhase("pressed");
  }

  function cancelPress(event: ReactPointerEvent<HTMLElement>) {
    if (event.buttons !== 0) setPhase("cancelled");
  }

  return (
    <div
      className="mx-auto w-full max-w-6xl"
      data-activations={activations}
      data-last-pointer={pointerType}
      data-pointer-phase={phase}
      data-pointer-touch-foundation
    >
      <PageHeader
        title="Pointer + Touch"
        description="Capability reali, target effettivi da 44px e un lifecycle press/cancel che mantiene semantica, focus e geometria stabili."
        importPath="@qoovex/ui/styles/base.css"
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="pointer-contract-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="pointer-contract-title" className="text-2xl font-semibold tracking-tight">
              Tre misure, un solo target
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La forma visiva può restare compatta. Hit area e spacing devono però essere verificati separatamente, senza zone sovrapposte o activation ambigue.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ContractCard
              label="Visual size"
              value="16px"
              description="La forma percepita del checkbox resta compatta."
            />
            <ContractCard
              label="Interactive hit area"
              value="44px"
              description="La pseudo-area centrata riceve l'input coarse."
            />
            <ContractCard
              label="Adjacent spacing"
              value="44px cell"
              description="Ogni target possiede una cella non condivisa."
            />
          </div>
        </section>

        <Separator />

        <section aria-labelledby="pointer-proof-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="pointer-proof-title" className="text-2xl font-semibold tracking-tight">
              Target reali
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ridimensiona o usa emulazione touch: i box reali crescono su coarse/ibrido, i controlli compatti mantengono il visuale e il link inline conserva l'eccezione editoriale.
            </p>
          </div>

          <div
            className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3"
            data-visual-specimen="pointer-touch-targets"
          >
            <ProofCell label="Icon control · visual 24px">
              <Button
                aria-label="Apri strumento puntatore"
                data-pointer-proof="icon-control"
                size="icon-xs"
                variant="ghost"
              >
                <IconClick />
              </Button>
            </ProofCell>

            <ProofCell label="Compact checkbox · visual 16px">
              <div className="flex size-11 items-center justify-center rounded-lg border border-dashed border-border" data-hit-cell="checkbox">
                <Checkbox className="qv-touch-target-compact active:scale-100" aria-label="Checkbox compatto" data-pointer-proof="compact-checkbox" />
              </div>
            </ProofCell>

            <ProofCell label="Motion Switch · visual 32×18px">
              <div className="flex size-11 items-center justify-center rounded-lg border border-dashed border-border" data-hit-cell="switch">
                <Switch className="qv-touch-target-compact" aria-label="Switch Motion" data-pointer-proof="motion-switch" />
              </div>
            </ProofCell>

            <ProofCell label="Field · box reale 44px su coarse">
              <Input aria-label="Campo touch" data-pointer-proof="field" placeholder="Riferimento" />
            </ProofCell>

            <ProofCell label="Inline link exception">
              <p className="text-sm leading-6 text-muted-foreground">
                Leggi il{" "}
                <a data-link="inline" data-pointer-proof="inline-link" href="#pointer-lifecycle-title">
                  lifecycle press
                </a>{" "}
                senza alterare il ritmo del testo.
              </p>
            </ProofCell>

            <ProofCell label="Due target adiacenti · zero overlap">
              <div className="grid grid-flow-col auto-cols-[2.75rem] place-items-center" data-adjacent-targets>
                <div className="flex size-11 items-center justify-center" data-hit-cell="adjacent-a">
                  <Checkbox className="qv-touch-target-compact active:scale-100" aria-label="Target adiacente A" data-pointer-proof="adjacent-a" />
                </div>
                <div className="flex size-11 items-center justify-center" data-hit-cell="adjacent-b">
                  <Checkbox className="qv-touch-target-compact active:scale-100" aria-label="Target adiacente B" data-pointer-proof="adjacent-b" />
                </div>
              </div>
            </ProofCell>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="pointer-lifecycle-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="pointer-lifecycle-title" className="text-2xl font-semibold tracking-tight">Lifecycle press reale</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Premi, trascina fuori e rilascia per cancellare; oppure attiva rapidamente più volte. Lo stato è osservato da Pointer Events, mentre il click e la tastiera restano nativi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {lifecycle.map(([step, title, description]) => (
              <Card key={title} size="sm" variant="outline">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-accent text-xs text-muted-foreground">{step}</span>
                    <CardTitle>{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-5 grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-[auto_1fr] md:items-center sm:p-6">
            <Button
              aria-label="Prova press e cancel"
              className="group/pointer-proof"
              data-pointer-proof="press-lab"
              onClick={() => {
                setActivations((current) => current + 1);
                setPhase("settled");
              }}
              onPointerCancel={() => setPhase("cancelled")}
              onPointerDown={beginPress}
              onPointerLeave={cancelPress}
              onPointerUp={() => setPhase("settled")}
              size="icon-xs"
              variant="ghost"
            >
              <span
                className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-[color,background-color,transform] [transition-duration:var(--motion-duration-feedback)] group-hover/pointer-proof:bg-primary/85 group-active/pointer-proof:scale-90 motion-reduce:transform-none"
                data-pointer-visual
              >
                <IconClick className="size-3.5" />
              </span>
            </Button>

            <div className="flex min-w-0 flex-wrap items-center gap-2" aria-live="polite">
              <Badge variant="outline">Fase: {phase}</Badge>
              <Badge variant="outline">Pointer: {pointerType}</Badge>
              <Badge variant="outline">Activation: {activations}</Badge>
              <span className="text-xs leading-relaxed text-muted-foreground">
                Il child visuale può reagire; il root che possiede hit area, focus e activation non cambia geometria.
              </span>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="pointer-capability-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="pointer-capability-title" className="text-2xl font-semibold tracking-tight">
              Capability, non device class
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ContractCard label="Primary fine + hover" value="hover / pointer" description="Abilita enhancement hover, mai azioni essenziali." />
            <ContractCard label="Primary coarse / no hover" value="pointer / hover" description="Target da 44px e feedback press immediato." />
            <ContractCard label="Hybrid + pen" value="any-pointer" description="Mantiene touch target e hover fine; pointerType resta event-specific." />
          </div>
        </section>
      </div>
    </div>
  );
}

function ContractCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card size="sm" variant="outline">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-accent text-base">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function ProofCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-28 flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}
