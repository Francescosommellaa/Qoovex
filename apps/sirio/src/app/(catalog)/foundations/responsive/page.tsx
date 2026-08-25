import { IconArrowsMinimize, IconDeviceDesktop, IconViewportNarrow } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import {
  ResponsiveContractProof,
  ResponsiveSafeAreaProof,
} from "@/components/responsive-contract-proof";
import { Separator } from "@qoovex/ui/components/separator";

const viewportMatrix = [320, 390, 768, 1024, 1440] as const;

const policies = [
  {
    title: "Intrinsic first",
    body: "Min-width: 0, wrap e grid/flex intrinseci risolvono il contenuto prima di introdurre query.",
  },
  {
    title: "Container owns composition",
    body: "Una query locale reagisce allo spazio assegnato al componente, anche dentro una viewport ampia.",
  },
  {
    title: "Viewport owns the shell",
    body: "Media query e unità viewport restano per shell, fixed layer e comportamento realmente viewport-bound.",
  },
  {
    title: "Behavior may use JS",
    body: "matchMedia è ammesso quando cambia una state machine, non per sostituire una regola CSS.",
  },
] as const;

export default function ResponsiveFoundationPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl" data-responsive-foundation>
      <PageHeader
        description="Un solo componente conserva DOM, semantica e feature mentre la composizione reagisce allo spazio realmente disponibile."
        importPath="@qoovex/ui"
        title="Responsive component contract"
      />

      <div className="flex min-w-0 flex-col gap-12">
        <section aria-labelledby="responsive-matrix-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="responsive-matrix-title">
              Matrice, non breakpoint
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Le cinque larghezze sono checkpoint QA. Il componente live usa contenuto intrinseco e
              una sola query locale motivata dalla propria composizione.
            </p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2" data-responsive-viewport-matrix>
            {viewportMatrix.map((width) => (
              <code className="rounded-md bg-muted px-2 py-1 text-xs tabular-nums" key={width}>
                {width}px
              </code>
            ))}
          </div>
          <ResponsiveContractProof label="Componente responsive nella larghezza disponibile" />
        </section>

        <Separator />

        <section aria-labelledby="responsive-container-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="responsive-container-title">
              La viewport non descrive il componente
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Nella stessa viewport larga, il primo host resta stretto e impila le azioni; il
              secondo riceve spazio dentro una composizione più complessa e le allinea lateralmente.
            </p>
          </div>
          <div className="grid min-w-0 gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]" data-responsive-container-comparison>
            <div className="min-w-0" data-responsive-host="narrow">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <IconViewportNarrow aria-hidden="true" className="qv-icon-default" />
                Host stretto
              </div>
              <ResponsiveContractProof label="Stesso componente in un container stretto" />
            </div>
            <div className="qv-surface-base grid min-w-0 gap-3 rounded-[calc(var(--radius)+var(--space-3))] p-3 xl:grid-cols-[8rem_minmax(0,1fr)]" data-responsive-host="complex">
              <aside className="qv-surface-contained rounded-lg p-3 text-sm text-muted-foreground">
                <IconDeviceDesktop aria-hidden="true" className="qv-icon-default" />
                <p className="mt-2">Contesto laterale della composizione.</p>
              </aside>
              <div className="min-w-0">
                <ResponsiveContractProof label="Stesso componente con spazio largo dentro una composizione complessa" />
              </div>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="responsive-reflow-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="responsive-reflow-title">
              Reflow e viewport mobili
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Il valore lungo resta leggibile, le azioni non spariscono e gli inset condivisi
              proteggono la composizione. Lo scroll verticale resta disponibile con tastiera software.
            </p>
          </div>
          <ResponsiveSafeAreaProof />
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div className="qv-surface-contained rounded-lg p-4">
              <IconArrowsMinimize aria-hidden="true" className="qv-icon-default" />
              <p className="mt-2 font-medium">Reflow</p>
              <p className="mt-1 text-muted-foreground">320px equivale al reflow di 640px al 200%.</p>
            </div>
            <div className="qv-surface-contained rounded-lg p-4">
              <p className="font-medium">Viewport height</p>
              <p className="mt-1 text-muted-foreground">Intrinsic di default; dvh per dinamica, svh per stabilità.</p>
            </div>
            <div className="qv-surface-contained rounded-lg p-4">
              <p className="font-medium">Motion</p>
              <p className="mt-1 text-muted-foreground">Il resize normale non anima né nasconde feature.</p>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="responsive-policy-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="responsive-policy-title">
              Ordine decisionale
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" data-responsive-policy>
            {policies.map((policy) => (
              <article className="qv-surface-contained rounded-xl p-4" key={policy.title}>
                <h3 className="font-medium">{policy.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{policy.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
