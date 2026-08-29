import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid } from "@/components/specimen"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@qoovex/ui/components/field"
import { Input } from "@qoovex/ui/components/input"

export default function FieldPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Field"
        description="Composizione semantica attorno a un controllo: collega label, testo di aiuto ed errore. Non possiede valore, caret o focus; questi restano all’Input inserito al suo interno."
        importPath="import { Field, FieldLabel, FieldDescription, FieldError } from '@qoovex/ui/components/field'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Anatomia</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Label e descrizione" visualId="field-default">
              <Field className="w-full">
                <FieldLabel htmlFor="field-name">Nome cantiere</FieldLabel>
                <Input aria-describedby="field-name-help" id="field-name" placeholder="Es. Ristrutturazione impianti" />
                <FieldDescription id="field-name-help">Un nome breve e riconoscibile per il progetto.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Campo opzionale">
              <Field className="w-full">
                <FieldLabel htmlFor="field-reference">Riferimento interno (opzionale)</FieldLabel>
                <Input id="field-reference" placeholder="Es. QVX-204" />
                <FieldDescription>Puoi lasciarlo vuoto e aggiungerlo in seguito.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Validazione</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Obbligatorio">
              <Field className="w-full">
                <FieldLabel htmlFor="field-required">Codice cantiere (obbligatorio)</FieldLabel>
                <Input id="field-required" name="jobSiteCode" required />
                <FieldDescription>Il browser preserva la semantica required del controllo.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Errore collegato" visualId="field-error">
              <Field className="w-full" data-invalid>
                <FieldLabel htmlFor="field-error">Codice cantiere</FieldLabel>
                <Input
                  aria-describedby="field-error-message"
                  aria-invalid="true"
                  defaultValue="QX-13"
                  id="field-error"
                />
                <FieldError id="field-error-message">Il codice deve contenere almeno sei caratteri.</FieldError>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Disponibilità</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Sola lettura">
              <Field className="w-full">
                <FieldLabel htmlFor="field-readonly">Identificativo assegnato</FieldLabel>
                <Input defaultValue="QVX-2026-018" id="field-readonly" readOnly />
                <FieldDescription>Il valore resta focalizzabile, selezionabile e copiabile.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Disabilitato">
              <Field className="w-full" data-disabled>
                <FieldLabel htmlFor="field-disabled">Archivio esterno</FieldLabel>
                <Input defaultValue="Connessione non disponibile" disabled id="field-disabled" />
                <FieldDescription>Il controllo è visivamente inattivo e non interattivo.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  )
}
