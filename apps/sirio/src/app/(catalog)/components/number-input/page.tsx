"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@qoovex/ui/components/field"
import { NumberInput } from "@qoovex/ui/components/number-input"

export default function NumberInputPage() {
  const [value, setValue] = React.useState<number | null>(4)

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Number Input"
        description="Inserisci un numero o modificalo un passo alla volta. Un campo vuoto resta vuoto, distinto da zero."
        importPath="import { NumberInput } from '@qoovex/ui/components/number-input'"
      />
      <div className="flex flex-col gap-10">
        <SpecimenSection title="Numeri essenziali" region="overview" description="Digita, incolla o sostituisci il valore. Usa + e − oppure le frecce della tastiera: ogni azione conserva la geometria del campo.">
          <Specimen>
            <form id="number-proof-form" className="grid w-full gap-6 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
              <Field>
                <FieldLabel htmlFor="number-empty">Vuoto</FieldLabel>
                <NumberInput id="number-empty" name="empty" placeholder="Numero" aria-describedby="number-empty-help" />
                <FieldDescription id="number-empty-help">Cancella tutto per tornare al campo vuoto.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="number-zero">Zero</FieldLabel>
                <NumberInput id="number-zero" name="zero" defaultValue={0} />
              </Field>
              <Field>
                <FieldLabel htmlFor="number-positive">Positivo</FieldLabel>
                <NumberInput id="number-positive" name="positive" defaultValue={12} step={1} />
              </Field>
              <Field>
                <FieldLabel htmlFor="number-negative">Negativo</FieldLabel>
                <NumberInput id="number-negative" name="negative" defaultValue={-3} />
              </Field>
            </form>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection title="Passi e limiti" region="interaction-states">
          <SpecimenGrid>
            <Specimen>
              <Field>
                <FieldLabel htmlFor="number-decimal">Da 0 a 1, un decimo alla volta</FieldLabel>
                <NumberInput id="number-decimal" defaultValue={0} min={0} max={1} step={0.1} locale="it-IT" aria-describedby="number-decimal-help" />
                <FieldDescription id="number-decimal-help">Al limite, soltanto l’azione non disponibile diventa inattiva.</FieldDescription>
              </Field>
            </Specimen>
            <Specimen>
              <Field>
                <FieldLabel htmlFor="number-controlled">Valore controllato</FieldLabel>
                <NumberInput id="number-controlled" name="controlled" form="number-proof-form" min={0} max={20} value={value} onValueChange={setValue} />
              </Field>
              <Button variant="secondary" onClick={() => setValue(10)}>Imposta 10</Button>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection title="Disponibilità e validazione" region="persistent-states">
          <Specimen>
            <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="number-readonly">Sola lettura</FieldLabel>
                <NumberInput id="number-readonly" defaultValue={24} readOnly />
                <FieldDescription>Selezionabile e copiabile, non modificabile.</FieldDescription>
              </Field>
              <Field data-disabled>
                <FieldLabel htmlFor="number-disabled">Disabilitato</FieldLabel>
                <NumberInput id="number-disabled" name="disabled" form="number-proof-form" defaultValue={24} disabled />
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="number-invalid">Da verificare</FieldLabel>
                <NumberInput id="number-invalid" defaultValue={24} aria-invalid="true" aria-describedby="number-error" required />
                <FieldError id="number-error">Verifica il valore prima di continuare.</FieldError>
              </Field>
            </div>
          </Specimen>
        </SpecimenSection>
      </div>
    </div>
  )
}
