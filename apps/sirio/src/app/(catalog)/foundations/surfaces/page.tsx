import {
  IconLayersIntersect,
  IconLayoutCards,
  IconStack2,
  IconWindowMaximize,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { SurfaceElevationProof } from "@/components/surface-elevation-proof";
import { Separator } from "@qoovex/ui/components/separator";

const roles = [
  {
    id: "base",
    name: "Base",
    className: "qv-surface-base",
    tone: "background",
    elevation: "none",
    use: "Canvas e piano di pagina; non è un pannello.",
  },
  {
    id: "contained",
    name: "Contained",
    className: "qv-surface-contained",
    tone: "card + border",
    elevation: "none",
    use: "Panel e Card statiche leggibili senza shadow.",
  },
  {
    id: "raised",
    name: "Raised",
    className: "qv-surface-raised",
    tone: "card + border",
    elevation: "raised / sm",
    use: "Superficie interattiva o temporaneamente sollevata.",
  },
  {
    id: "floating",
    name: "Floating",
    className: "qv-surface-floating",
    tone: "popover + strong border",
    elevation: "floating / md",
    use: "Popup che copre il contenuto sottostante.",
  },
  {
    id: "modal",
    name: "Modal",
    className: "qv-surface-modal",
    tone: "card + strong border + backdrop",
    elevation: "modal / xl",
    use: "Interruzione contestuale protetta da backdrop.",
  },
] as const;

export default function SurfaceFoundationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl" data-surface-foundation>
      <PageHeader
        description="Tono, confine ed elevation compongono pochi piani percettivi; lo stacking resta una responsabilità tecnica separata."
        importPath="@qoovex/ui/styles/base.css"
        title="Surface ed elevation"
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="surface-hierarchy-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="surface-hierarchy-title">
              Gerarchia dei piani
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Il canvas resta piatto. Contained separa con tono e bordo; soltanto interaction,
              floating e modal guadagnano profondità.
            </p>
          </div>

          <div
            className="qv-surface-base relative isolate min-h-[26rem] overflow-hidden rounded-2xl p-5 sm:p-8"
            data-surface-hierarchy
          >
            <div className="qv-surface-contained h-full min-h-[22rem] rounded-xl p-5 sm:p-7" data-surface-role="contained">
              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.75fr)]">
                <div className="qv-surface-raised rounded-xl p-5" data-surface-role="raised">
                  <IconLayoutCards aria-hidden="true" className="qv-icon-emphasized" />
                  <p className="mt-4 font-medium">Superficie operativa</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    La struttura resta leggibile anche togliendo la shadow.
                  </p>
                </div>

                <div className="relative min-h-48 rounded-xl bg-foreground p-4 text-background">
                  <p className="max-w-44 text-sm opacity-70">Contenuto scuro sottostante</p>
                  <div
                    className="qv-surface-floating absolute inset-x-7 bottom-5 rounded-lg p-4"
                    data-surface-role="floating"
                  >
                    <IconStack2 aria-hidden="true" className="qv-icon-default" />
                    <p className="mt-2 text-sm font-medium">Popup flottante</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div
            className="qv-surface-base relative mt-4 min-h-64 overflow-hidden rounded-2xl p-5"
            data-surface-modal-stage
          >
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="qv-surface-contained rounded-lg p-3">Contesto sottostante</div>
              <div className="qv-surface-contained rounded-lg p-3">Informazioni operative</div>
              <div className="qv-surface-contained rounded-lg p-3">Azioni disponibili</div>
            </div>
            <div className="qv-backdrop-modal absolute inset-0 grid place-items-center p-5" data-surface-backdrop>
              <div className="qv-surface-modal w-full max-w-sm rounded-xl p-5" data-surface-role="modal">
                <IconWindowMaximize aria-hidden="true" className="qv-icon-emphasized" />
                <p className="mt-3 font-medium">Piano modale</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Backdrop, tono e bordo cooperano: la shadow non porta da sola la gerarchia.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="surface-roles-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="surface-roles-title">
              Ruoli approvati
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sono combinazioni deliberate, non una matrice libera tra background e shadow.
              Nessuna assegna position o z-index.
            </p>
          </div>
          <div className="grid gap-3" data-surface-role-list>
            {roles.map((role) => (
              <article
                className={`${role.className} grid gap-3 rounded-xl p-4 sm:grid-cols-[8rem_10rem_10rem_1fr] sm:items-center`}
                data-surface-role-card={role.id}
                key={role.id}
              >
                <p className="font-medium">{role.name}</p>
                <code className="text-xs text-muted-foreground">{role.tone}</code>
                <code className="text-xs text-muted-foreground">{role.elevation}</code>
                <p className="text-sm text-muted-foreground">{role.use}</p>
              </article>
            ))}
          </div>
        </section>

        <Separator />

        <section aria-labelledby="surface-stress-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="surface-stress-title">
              Casi difficili
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Bordo e tono mantengono il confine su canvas simili, superfici annidate e quando
              forced colors rimuove le ombre.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3" data-surface-stress-grid>
            <div className="qv-surface-base rounded-xl p-4">
              <div className="qv-surface-contained rounded-lg p-4" data-surface-stress="similar">
                <p className="font-medium">Card su tono quasi identico</p>
                <p className="mt-1 text-sm text-muted-foreground">Il bordo porta il confine.</p>
              </div>
            </div>
            <div className="qv-surface-contained relative min-h-40 rounded-xl p-4" data-surface-stress="floating-over-card">
              <p className="text-sm text-muted-foreground">Contenuto contained</p>
              <div className="qv-surface-floating absolute inset-x-8 bottom-4 rounded-lg p-3">
                <p className="text-sm font-medium">Floating sopra Card</p>
              </div>
            </div>
            <div className="qv-surface-contained rounded-xl p-4" data-surface-stress="nested">
              <div className="qv-surface-contained rounded-lg p-4">
                <IconLayersIntersect aria-hidden="true" className="qv-icon-default" />
                <p className="mt-2 text-sm font-medium">Contained annidato</p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="surface-motion-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="surface-motion-title">
              Cambio di piano con Motion
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Motion governa presenza, transform, opacity e reversal; tono, bordo e shadow
              descrivono lo stato finale. Il box-shadow non viene animato frame per frame.
            </p>
          </div>
          <SurfaceElevationProof />
        </section>
      </div>
    </div>
  );
}
