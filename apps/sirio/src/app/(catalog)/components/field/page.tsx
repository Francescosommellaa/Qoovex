import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Field, FieldLabel, FieldDescription, FieldError, FieldContent } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";

export default function FieldPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Field"
        description="Wrapper accessibile per campi form con label, descrizione ed errori."
        importPath="import { Field, FieldLabel, FieldContent, ... } from '@qoovex/ui/components/field'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempi</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Base">
              <Field className="w-full max-w-sm">
                <FieldLabel>Email</FieldLabel>
                <FieldContent>
                  <Input type="email" placeholder="mario@esempio.it" />
                </FieldContent>
                <FieldDescription>Usa l'indirizzo aziendale.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Con Errore (Simulato via class)">
              <div className="w-full max-w-sm flex flex-col gap-2">
                {/* Simulated Error State since Field usually depends on Form Context or specific props for error state */}
                <label className="text-sm font-medium leading-none text-destructive">Email</label>
                <Input type="email" value="invalid-email" className="border-destructive focus-visible:ring-destructive" readOnly />
                <p className="text-sm font-medium text-destructive">Indirizzo email non valido.</p>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
