"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import { Field, FieldDescription, FieldError } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
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
                <Label htmlFor="number-empty">Vuoto</Label>
                <NumberInput id="number-empty" name="empty" placeholder="Numero" aria-describedby="number-empty-help" />
                <FieldDescription id="number-empty-help">Cancella tutto per tornare al campo vuoto.</FieldDescription>
              </Field>
              <Field>
                <Label htmlFor="number-zero">Zero</Label>
                <NumberInput id="number-zero" name="zero" defaultValue={0} />
              </Field>
              <Field>
                <Label htmlFor="number-positive">Positivo</Label>
                <NumberInput id="number-positive" name="positive" defaultValue={12} step={1} />
              </Field>
              <Field>
                <Label htmlFor="number-negative">Negativo</Label>
                <NumberInput id="number-negative" name="negative" defaultValue={-3} />
              </Field>
            </form>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection title="Passi e limiti" region="interaction-states">
          <SpecimenGrid>
            <Specimen>
              <Field>
                <Label htmlFor="number-decimal">Da 0 a 1, un decimo alla volta</Label>
                <NumberInput id="number-decimal" defaultValue={0} min={0} max={1} step={0.1} locale="it-IT" aria-describedby="number-decimal-help" />
                <FieldDescription id="number-decimal-help">Al limite, soltanto l’azione non disponibile diventa inattiva.</FieldDescription>
              </Field>
            </Specimen>
            <Specimen>
              <Field>
                <Label htmlFor="number-controlled">Valore controllato</Label>
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
                <Label htmlFor="number-readonly">Sola lettura</Label>
                <NumberInput id="number-readonly" defaultValue={24} readOnly />
                <FieldDescription>Selezionabile e copiabile, non modificabile.</FieldDescription>
              </Field>
              <Field data-disabled>
                <Label htmlFor="number-disabled">Disabilitato</Label>
                <NumberInput id="number-disabled" name="disabled" form="number-proof-form" defaultValue={24} disabled />
              </Field>
              <Field data-invalid>
                <Label htmlFor="number-invalid" required>Da verificare</Label>
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
