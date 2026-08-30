"use client"

import { useRef, useState, type FormEvent } from "react"
import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import { CharacterCounter } from "@qoovex/ui/components/character-counter"
import { Checkbox } from "@qoovex/ui/components/checkbox"
import { Field, FieldDescription, FieldError } from "@qoovex/ui/components/field"
import { Input } from "@qoovex/ui/components/input"
import { Label } from "@qoovex/ui/components/label"
import { Link } from "@qoovex/ui/components/link"
import { NumberInput } from "@qoovex/ui/components/number-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qoovex/ui/components/select"
import { Textarea } from "@qoovex/ui/components/textarea"

export default function FieldPage() {
  const [codeRequired, setCodeRequired] = useState(true)
  const [note, setNote] = useState("")
  const [interactiveCode, setInteractiveCode] = useState("QVX-204")
  const [interactiveError, setInteractiveError] = useState<string | null>(null)
  const interactiveInputRef = useRef<HTMLInputElement>(null)

  function validateInteractiveCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedCode = interactiveCode.trim().toLocaleUpperCase("it-IT")
    const nextError = normalizedCode.length < 6
      ? "Inserisci almeno sei caratteri."
      : normalizedCode === "QVX-204"
        ? "Questo codice è già in uso. Scegline uno diverso."
        : null

    setInteractiveError(nextError)
    if (nextError) interactiveInputRef.current?.focus()
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Field"
        description="Container di composizione per Label, controllo e testo di supporto. Field possiede ritmo e orientamento, senza diventare un gruppo ARIA o assorbire la logica del controllo."
        importPath="import { Field, FieldDescription, FieldError } from '@qoovex/ui/components/field'"
      />

      <div className="flex flex-col gap-12">
        <SpecimenSection
          region="overview"
          title="Convenzione"
          description="Label e control ricevono lo stesso required esplicito. L’asterisco non è un errore; Facoltativo chiarisce soltanto un’eccezione."
        >
          <SpecimenGrid cols={3}>
            <Specimen title="Basic" visualId="field-default">
              <Field className="w-full" data-field-proof="basic" data-label-proof="basic">
                <Label htmlFor="label-basic">Nome cantiere</Label>
                <Input id="label-basic" placeholder="Es. Ristrutturazione impianti" />
              </Field>
            </Specimen>

            <Specimen title="Obbligatorietà">
              <Field className="w-full" data-label-proof="required">
                <Label htmlFor="label-required" required={codeRequired} optional={!codeRequired}>Codice cantiere</Label>
                <Input id="label-required" required={codeRequired} name="jobSiteCode" placeholder="Es. QVX-204" />
              </Field>
              <Field data-field-proof="horizontal" orientation="horizontal">
                <Checkbox id="require-code" checked={codeRequired} onCheckedChange={setCodeRequired} />
                <Label htmlFor="require-code">Campo obbligatorio</Label>
              </Field>
            </Specimen>

            <Specimen title="Optional">
              <Field className="w-full" data-label-proof="optional">
                <Label htmlFor="label-optional" optional>Riferimento interno</Label>
                <Input id="label-optional" placeholder="Es. Commessa 18" />
              </Field>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection
          region="interaction-states"
          title="Struttura e stati"
          description="Testo di aiuto, errore e disponibilità del campo."
        >
          <SpecimenGrid cols={3}>
            <Specimen title="Con descrizione">
              <Field className="w-full" data-description-proof="basic" data-field-proof="complete" data-label-proof="description">
                <Label htmlFor="label-description">Responsabile</Label>
                <Input aria-describedby="label-description-help" id="label-description" />
                <FieldDescription id="label-description-help">
                  La persona che coordina il lavoro operativo.
                </FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Con errore" visualId="field-error">
              <Field className="w-full" data-description-proof="with-error" data-error-proof="basic" data-field-proof="invalid" data-invalid data-label-proof="invalid">
                <Label htmlFor="label-invalid" required>Codice cantiere</Label>
                <Input
                  aria-describedby="label-invalid-help label-invalid-error"
                  aria-invalid="true"
                  defaultValue="QX-13"
                  id="label-invalid"
                  required
                />
                <FieldDescription id="label-invalid-help">
                  Usa il codice riportato nel piano operativo.
                </FieldDescription>
                <FieldError id="label-invalid-error">
                  Inserisci almeno sei caratteri.
                </FieldError>
              </Field>
            </Specimen>

            <Specimen title="Disabilitato">
              <Field className="w-full" data-description-proof="disabled" data-field-proof="disabled" data-label-proof="disabled">
                <Label htmlFor="label-disabled" required>Archivio esterno</Label>
                <Input aria-describedby="label-disabled-help" defaultValue="Connessione non disponibile" disabled id="label-disabled" required />
                <FieldDescription id="label-disabled-help">
                  Disponibile quando la connessione aziendale è attiva.
                </FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection
          region="persistent-states"
          title="Error behavior"
          description="Il controllo possiede invalid; FieldError aggiunge un messaggio specifico senza annunci automatici o altezza riservata."
        >
          <SpecimenGrid cols={3}>
            <Specimen title="Long error">
              <Field className="w-full" data-error-proof="long" data-invalid>
                <Label htmlFor="field-long-error">Codice documento</Label>
                <Input
                  aria-describedby="field-long-error-message"
                  aria-invalid="true"
                  defaultValue="DOC?"
                  id="field-long-error"
                />
                <FieldError id="field-long-error-message">
                  Usa almeno sei caratteri e rimuovi i simboli non ammessi prima di continuare.
                </FieldError>
              </Field>
            </Specimen>

            <Specimen title="Multiple errors">
              <Field className="w-full" data-error-proof="multiple" data-invalid>
                <Label htmlFor="field-multiple-error">Riferimento cliente</Label>
                <Input
                  aria-describedby="field-multiple-error-message"
                  aria-invalid="true"
                  defaultValue="?"
                  id="field-multiple-error"
                />
                <FieldError
                  errors={[
                    { message: "Inserisci almeno tre caratteri." },
                    { message: "Usa soltanto lettere e numeri." },
                    { message: "Inserisci almeno tre caratteri." },
                  ]}
                  id="field-multiple-error-message"
                />
              </Field>
            </Specimen>

            <Specimen title="Appearance and correction">
              <form className="flex w-full flex-col gap-3" data-error-proof="interactive" onSubmit={validateInteractiveCode}>
                <Field data-invalid={interactiveError ? true : undefined}>
                  <Label htmlFor="field-interactive-error">Codice cantiere</Label>
                  <Input
                    aria-describedby={interactiveError ? "field-interactive-help field-interactive-error-message" : "field-interactive-help"}
                    aria-invalid={interactiveError ? true : undefined}
                    id="field-interactive-error"
                    onChange={(event) => {
                      const nextValue = event.currentTarget.value
                      setInteractiveCode(nextValue)
                      if (
                        interactiveError &&
                        nextValue.trim().length >= 6 &&
                        nextValue.trim().toLocaleUpperCase("it-IT") !== "QVX-204"
                      ) {
                        setInteractiveError(null)
                      }
                    }}
                    ref={interactiveInputRef}
                    value={interactiveCode}
                  />
                  <FieldDescription id="field-interactive-help">
                    Il codice deve essere univoco nel workspace.
                  </FieldDescription>
                  {interactiveError ? (
                    <FieldError id="field-interactive-error-message">
                      {interactiveError}
                    </FieldError>
                  ) : null}
                </Field>
                <Button type="submit">Verifica codice</Button>
              </form>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection
          region="content-stress"
          title="Contenuto lungo"
          description="Il testo va a capo per default e mantiene marker e metadata sulla baseline disponibile, senza ellissi."
        >
          <SpecimenGrid cols={2}>
            <Specimen title="Long content">
              <Field className="w-full" data-description-proof="long" data-field-proof="long" data-label-proof="long">
                <Label htmlFor="label-long" optional>
                  Riferimento operativo condiviso con il responsabile del cantiere e con il cliente invitato
                </Label>
                <Input aria-describedby="label-long-help" id="label-long" placeholder="Inserisci il riferimento" />
                <FieldDescription id="label-long-help">
                  Usa un testo riconoscibile anche quando il riferimento attraversa più reparti e richiede due righe. <Link data-description-proof="with-link" href="/patterns/form-validation">Consulta le regole di compilazione</Link>.
                </FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Long required / readonly">
              <Field data-label-proof="long-required">
                <Label htmlFor="label-long-required" required>
                  Riferimento operativo condiviso con il responsabile del cantiere e con il cliente invitato
                </Label>
                <Input id="label-long-required" required readOnly value="QVX-204" />
              </Field>
            </Specimen>

          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection
          region="variants"
          title="Control variety"
          description="La stessa Label nomina controlli diversi. OTP e prefix/suffix restano provati nelle rispettive pagine, senza creare label specializzate."
        >
          <SpecimenGrid cols={3}>
            <Specimen title="Textarea">
              <Field className="w-full" data-description-proof="with-counter">
                <Label htmlFor="label-textarea">Nota operativa</Label>
                <Textarea
                  aria-describedby="label-textarea-help label-textarea-count"
                  id="label-textarea"
                  maxLength={500}
                  onChange={(event) => setNote(event.currentTarget.value)}
                  rows={2}
                  value={note}
                />
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <FieldDescription id="label-textarea-help">
                    Massimo 500 caratteri.
                  </FieldDescription>
                  <CharacterCounter current={note.length} id="label-textarea-count" max={500} className="self-end" />
                </div>
              </Field>
            </Specimen>

            <Specimen title="Select">
              <Field className="w-full">
                <Label htmlFor="label-select">Priorità</Label>
                <Select defaultValue="NORMAL">
                  <SelectTrigger className="w-full" id="label-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="NORMAL">Normale</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Specimen>

            <Specimen title="NumberInput">
              <Field className="w-full">
                <Label htmlFor="label-number">Giorni stimati</Label>
                <NumberInput defaultValue={12} id="label-number" min={0} />
              </Field>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>
      </div>
    </div>
  )
}
