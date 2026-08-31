"use client"

import * as React from "react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
} from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { OtpInput } from "@qoovex/ui/components/otp-input"

export default function OtpInputPage() {
  const [code, setCode] = React.useState("")
  const [completedLength, setCompletedLength] = React.useState<number | null>(null)

  function updateCode(nextCode: string) {
    setCode(nextCode)
    if (nextCode.length !== 6) setCompletedLength(null)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <PageHeader
        description="Un unico codice segmentato. Base UI possiede digitazione, avanzamento, incolla, tastiera e valore; verifica e messaggi restano al consumer."
        importPath="import { OtpInput } from '@qoovex/ui/components/otp-input'"
        title="OTP Input"
      />

      <SpecimenSection
        description="Digita in sequenza, incolla un codice completo, usa Backspace oppure seleziona una cifra centrale. Il completamento indica soltanto che tutti gli slot sono pieni."
        region="interaction-states"
        title="Digitazione, incolla e modifica"
      >
        <Specimen title="Codice a sei cifre" visualId="sirio-otp-input-core">
          <div className="mx-auto flex w-full max-w-md min-w-0 flex-col items-start gap-4 py-2">
            <Field className="w-full">
              <Label htmlFor="otp-core">Codice di verifica</Label>
              <OtpInput
                aria-describedby="otp-core-help otp-core-status"
                data-otp-proof="core"
                id="otp-core"
                length={6}
                onValueChange={updateCode}
                onValueComplete={(nextCode) => setCompletedLength(nextCode.length)}
                value={code}
              />
              <FieldDescription id="otp-core-help">
                Su mobile usa tastiera numerica e autofill one-time-code; non invia automaticamente il form.
              </FieldDescription>
              <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground" id="otp-core-status">
                {completedLength ? `Codice completo: ${completedLength} caratteri.` : ""}
              </p>
            </Field>
            <Button
              disabled={code.length === 0}
              onClick={() => {
                setCode("")
                setCompletedLength(null)
              }}
              size="sm"
              variant="outline"
            >
              Svuota codice
            </Button>
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="La lunghezza è esplicita; nessun separatore 3+3 viene aggiunto implicitamente."
        region="variants"
        title="Lunghezza"
      >
        <SpecimenGrid cols={2}>
          <Specimen title="Quattro cifre">
            <Field className="w-fit max-w-full">
              <Label htmlFor="otp-four">Codice breve</Label>
              <OtpInput id="otp-four" length={4} />
            </Field>
          </Specimen>
          <Specimen title="Sei cifre">
            <Field className="w-fit max-w-full">
              <Label htmlFor="otp-six">Codice standard</Label>
              <OtpInput id="otp-six" length={6} />
            </Field>
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Errore e disponibilità appartengono alla stessa grammatica dei Field; nessuno stato sposta o scuote il codice."
        region="persistent-states"
        title="Stati"
      >
        <SpecimenGrid cols={2}>
          <Specimen title="Codice non valido" visualId="sirio-otp-input-invalid">
            <Field className="w-fit max-w-full" data-invalid>
              <Label htmlFor="otp-invalid">Codice email</Label>
              <OtpInput
                aria-describedby="otp-invalid-error"
                aria-invalid="true"
                defaultValue="1932"
                id="otp-invalid"
                length={6}
              />
              <FieldError id="otp-invalid-error">Inserisci tutte le sei cifre ricevute.</FieldError>
            </Field>
          </Specimen>
          <Specimen title="Disabilitato" visualId="sirio-otp-input-disabled">
            <Field className="w-fit max-w-full" data-disabled>
              <Label htmlFor="otp-disabled">Codice temporaneamente bloccato</Label>
              <OtpInput defaultValue="4281" disabled id="otp-disabled" length={6} />
              <FieldDescription>Il valore resta leggibile, ma il gruppo non accetta interazioni.</FieldDescription>
            </Field>
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>
    </div>
  )
}
