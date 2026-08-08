import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Badge } from "@qoovex/ui/components/badge";

export default function BadgePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Badge"
        description="Piccolo indicatore visivo, solitamente per status o etichette."
        importPath="import { Badge } from '@qoovex/ui/components/badge'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default">
              <Badge>Default</Badge>
            </Specimen>
            <Specimen title="Secondary">
              <Badge variant="secondary">Secondary</Badge>
            </Specimen>
            <Specimen title="Outline">
              <Badge variant="outline">Outline</Badge>
            </Specimen>
            <Specimen title="Destructive">
              <Badge variant="destructive">Destructive</Badge>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
