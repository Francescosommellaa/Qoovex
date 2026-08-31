"use client"

import * as React from "react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid } from "@/components/specimen"
import { Field, FieldDescription, FieldError } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { PasswordInput, type PasswordStrength } from "@qoovex/ui/components/password-input"

const demoPassword = "Qoovex-demo-2026"

function getDemoStrength(password: string): PasswordStrength {
  if (!password) return { label: "Non valutata", value: 0 }
  if (password.length < 12) return { label: "Debole", value: 1 }
  const varied = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length
  if (password.length >= 16 && varied >= 3) return { label: "Forte", value: 3 }
  return { label: "Buona", value: 2 }
}

export default function PasswordInputPage() {
  const [controlledPassword, setControlledPassword] = React.useState(demoPassword)
  const [newPassword, setNewPassword] = React.useState("")

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Password Input"
        description="Input canonico con un comando contestuale per mostrare o nascondere il valore senza interrompere digitazione, selezione o form semantics."
        importPath="import { PasswordInput } from '@qoovex/ui/components/password-input'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Password essenziali</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Nuova password">
              <Field className="w-full">
                <Label htmlFor="password-empty">Nuova password</Label>
                <PasswordInput
                  autoComplete="new-password"
                  data-password-proof="empty"
                  id="password-empty"
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Crea una password"
                  strength={getDemoStrength(newPassword)}
                  value={newPassword}
                />
                <FieldDescription>La linea offre una stima progressiva; i requisiti reali restano nella validazione del form.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Compilata e controllata">
              <Field className="w-full">
                <Label htmlFor="password-populated">Password corrente</Label>
                <PasswordInput
                  autoComplete="current-password"
                  data-password-proof="populated"
                  id="password-populated"
                  onChange={(event) => setControlledPassword(event.target.value)}
                  value={controlledPassword}
                />
                <FieldDescription>Mostra e nascondi il valore demo senza perderne il controllo.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Interazione reale</h2>
          <Specimen title="Typing, tastiera e rapid reversal">
            <div className="grid w-full max-w-xl gap-3">
              <p className="text-sm text-muted-foreground">
                Digita e usa l’occhio per continuare dall’identico caret. Con Tab raggiungi il comando; Enter e Space alternano la visibilità mantenendo il focus sull’azione.
              </p>
              <Field>
                <Label htmlFor="password-interaction">Password demo</Label>
                <PasswordInput
                  autoComplete="new-password"
                  data-password-proof="interaction"
                  defaultValue={demoPassword}
                  id="password-interaction"
                />
              </Field>
            </div>
          </Specimen>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Validazione e disponibilità</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Errore collegato">
              <Field className="w-full" data-invalid>
                <Label htmlFor="password-invalid">Conferma password</Label>
                <PasswordInput
                  aria-describedby="password-invalid-error"
                  aria-invalid="true"
                  data-password-proof="invalid"
                  defaultValue={demoPassword}
                  id="password-invalid"
                />
                <FieldError id="password-invalid-error">Le password demo non coincidono.</FieldError>
              </Field>
            </Specimen>

            <Specimen title="Disabilitata e sempre nascosta">
              <Field className="w-full" data-disabled>
                <Label htmlFor="password-disabled">Password gestita esternamente</Label>
                <PasswordInput
                  data-password-proof="disabled"
                  defaultValue={demoPassword}
                  disabled
                  id="password-disabled"
                />
                <FieldDescription>Input e comando di reveal sono entrambi non interattivi.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Sola lettura, reveal disponibile">
              <Field className="w-full">
                <Label htmlFor="password-readonly">Password demo archiviata</Label>
                <PasswordInput
                  data-password-proof="readonly"
                  defaultValue={demoPassword}
                  id="password-readonly"
                  readOnly
                />
                <FieldDescription>Il valore resta selezionabile e il comando può mostrarlo.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Valore lungo">
              <Field className="w-full">
                <Label htmlFor="password-long">Password demo lunga</Label>
                <PasswordInput
                  data-password-proof="long"
                  defaultValue="Qoovex-demo-2026-stringa-lunga-per-selection"
                  id="password-long"
                />
                <FieldDescription>Il contenuto scorre naturalmente senza passare sotto l’occhio.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  )
}
