import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Button } from "@qoovex/ui/components/button";

export default function ButtonPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Button"
        description="Il pulsante principale utilizzato per le azioni. Usa il tag <a> per i link di navigazione."
        importPath="import { Button } from '@qoovex/ui/components/button'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default">
              <Button>Pulsante primario</Button>
            </Specimen>
            <Specimen title="Secondary">
              <Button variant="secondary">Pulsante secondario</Button>
            </Specimen>
            <Specimen title="Outline">
              <Button variant="outline">Pulsante outline</Button>
            </Specimen>
            <Specimen title="Ghost">
              <Button variant="ghost">Pulsante ghost</Button>
            </Specimen>
            <Specimen title="Link">
              <Button variant="link">Pulsante link</Button>
            </Specimen>
            <Specimen title="Destructive">
              <Button variant="destructive">Pulsante distruttivo</Button>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dimensioni</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default">
              <Button size="default">Dimensione base</Button>
            </Specimen>
            <Specimen title="Small (sm)">
              <Button size="sm">Piccolo</Button>
            </Specimen>
            <Specimen title="Large (lg)">
              <Button size="lg">Grande</Button>
            </Specimen>
            <Specimen title="Icon">
              <Button size="icon" aria-label="Aggiungi">
                +
              </Button>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Stati</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Disabled">
              <Button disabled>Azione disabilitata</Button>
            </Specimen>
            <Specimen title="Loading (Simulato con asChild o icona, qui generico)">
               <Button disabled className="opacity-50 cursor-not-allowed">
                 Caricamento...
               </Button>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
