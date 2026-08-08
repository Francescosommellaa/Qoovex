import { PageHeader } from "@/components/page-header";
import { TypographySpecimen } from "@/components/token-explorer";

export default function TypographyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Tipografia"
        description="Le font family utilizzate dal sistema Qoovex. Usiamo Geist Sans per i testi e Geist Mono per il codice."
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Font Families</h2>
          <div className="grid gap-6">
            <TypographySpecimen label="Sans Serif (Principale)" fontFamily="--font-sans" />
            <TypographySpecimen label="Monospace (Codice)" fontFamily="--font-mono" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempi di utilizzo</h2>
          <div className="flex flex-col gap-8 rounded-lg border p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Heading 1 (text-4xl font-semibold tracking-tight)</span>
              <h1 className="text-4xl font-semibold tracking-tight">L'architettura del cantiere digitale.</h1>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Heading 2 (text-3xl font-semibold tracking-tight)</span>
              <h2 className="text-3xl font-semibold tracking-tight">L'architettura del cantiere digitale.</h2>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Heading 3 (text-2xl font-semibold tracking-tight)</span>
              <h3 className="text-2xl font-semibold tracking-tight">L'architettura del cantiere digitale.</h3>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Heading 4 (text-xl font-semibold tracking-tight)</span>
              <h4 className="text-xl font-semibold tracking-tight">L'architettura del cantiere digitale.</h4>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Large (text-lg font-semibold)</span>
              <div className="text-lg font-semibold">L'architettura del cantiere digitale.</div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Body (text-base)</span>
              <p className="leading-7 [&:not(:first-child)]:mt-6">
                Qoovex è lo spazio condiviso in cui un’impresa gestisce un lavoro edile con il cliente dalla creazione del cantiere alla chiusura.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Muted (text-sm text-muted-foreground)</span>
              <p className="text-sm text-muted-foreground">
                Qoovex non incassa, custodisce, trasferisce o garantisce denaro.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
