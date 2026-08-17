"use client";

import { useRef, useState, type FormEvent } from "react";
import { IconAlertCircle, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import {
  formatEuroFromMinorUnits,
  formatEuroRangeFromMinorUnits,
  formatOptionalEuroFromMinorUnits,
  parseEuroInputToMinorUnits,
} from "@qoovex/ui/lib/money";

const invalidExample = parseEuroInputToMinorUnits("12,345");
const invalidExampleMessage = invalidExample.ok
  ? "Controlla l’importo inserito."
  : invalidExample.error;

export function MoneySpecimen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("1.250,00");
  const [error, setError] = useState<string | null>(null);
  const [formattedValue, setFormattedValue] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseEuroInputToMinorUnits(value);

    if (!result.ok || result.minorUnits === null) {
      setFormattedValue(null);
      setError(result.ok ? "Indica un importo." : result.error);
      window.requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setError(null);
    setFormattedValue(formatEuroFromMinorUnits(result.minorUnits));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <section aria-labelledby="money-reading-title" className="rounded-xl border bg-card p-5 sm:p-6">
        <h3 id="money-reading-title" className="text-lg font-semibold tracking-tight">
          Importi in lettura
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          La label comunica il significato; il valore mantiene sempre la stessa notazione italiana.
        </p>

        <dl className="mt-5 divide-y divide-border">
          <div className="grid gap-1 py-4 first:pt-0 sm:grid-cols-[12rem_1fr] sm:gap-5">
            <dt className="text-sm font-medium">Stima iniziale</dt>
            <dd className="font-accent text-lg tabular-nums">{formatEuroFromMinorUnits("125000")}</dd>
          </div>
          <div className="grid gap-3 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5">
            <dt className="text-sm font-medium">Variazione economica</dt>
            <dd className="space-y-2 text-sm">
              <p><span className="font-medium">Aumento proposto:</span> <span className="font-accent tabular-nums">+{formatEuroFromMinorUnits("25000")}</span></p>
              <p><span className="font-medium">Riduzione proposta:</span> <span className="font-accent tabular-nums">{formatEuroFromMinorUnits("-12500")}</span></p>
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5">
            <dt className="text-sm font-medium">Intervallo proposto</dt>
            <dd className="font-accent tabular-nums">{formatEuroRangeFromMinorUnits("90000", "110000")}</dd>
          </div>
          <div className="grid gap-1 py-4 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-5">
            <dt className="text-sm font-medium">Stima facoltativa</dt>
            <dd className="text-muted-foreground">{formatOptionalEuroFromMinorUnits(null, "Non indicata")}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="money-input-title" className="rounded-xl border bg-card p-5 sm:p-6">
        <h3 id="money-input-title" className="text-lg font-semibold tracking-tight">
          Input in euro
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Lo specimen usa lo stesso parser del Workspace e non invia dati.
        </p>

        <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit}>
          <Field data-invalid={error ? "true" : undefined}>
            <FieldLabel htmlFor="money-input">Importo</FieldLabel>
            <Input
              ref={inputRef}
              id="money-input"
              name="amount"
              autoComplete="off"
              inputMode="decimal"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError(null);
                setFormattedValue(null);
              }}
              placeholder="Es. 1.250,00"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "money-input-description money-input-error" : "money-input-description"}
            />
            <FieldDescription id="money-input-description">
              Scrivi l’importo in euro usando la virgola per i decimali, con al massimo due cifre.
            </FieldDescription>
            {error ? <FieldError id="money-input-error">{error}</FieldError> : null}
          </Field>
          <Button type="submit">Verifica importo</Button>
          {formattedValue ? (
            <Alert variant="success" role="status">
              <IconCircleCheck aria-hidden="true" />
              <div>
                <AlertTitle>Importo valido</AlertTitle>
                <AlertDescription>Il valore sarà mostrato come {formattedValue}.</AlertDescription>
              </div>
            </Alert>
          ) : null}
        </form>

        <div className="mt-6 border-t pt-5">
          <Field data-invalid="true">
            <FieldLabel htmlFor="money-invalid-example">Esempio di importo non valido</FieldLabel>
            <Input
              id="money-invalid-example"
              name="invalidAmountExample"
              value="12,345"
              readOnly
              inputMode="decimal"
              aria-invalid="true"
              aria-describedby="money-invalid-example-description money-invalid-example-error"
            />
            <FieldDescription id="money-invalid-example-description">
              Il separatore decimale ammette al massimo due cifre.
            </FieldDescription>
            <FieldError id="money-invalid-example-error">{invalidExampleMessage}</FieldError>
          </Field>
        </div>
      </section>

      <Alert variant="info" role="note" className="lg:col-span-2">
        <IconInfoCircle aria-hidden="true" />
        <div>
          <AlertTitle>Importi documentati</AlertTitle>
          <AlertDescription>
            Un importo mostrato in Qoovex descrive il lavoro, una proposta o una dichiarazione delle parti.
            Non indica che Qoovex abbia eseguito, verificato, custodito o garantito un pagamento.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
