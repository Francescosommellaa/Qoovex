"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qoovex/ui/components/select";
import { Textarea } from "@qoovex/ui/components/textarea";

type FieldName = "title" | "details" | "type";
type FieldErrors = Partial<Record<FieldName, string>>;

const requestTypes = [
  { label: "Chiarimento", value: "clarification" },
  { label: "Aggiornamento del lavoro", value: "work-update" },
] as const;

const describedBy = (...ids: Array<string | undefined>) =>
  ids.filter(Boolean).join(" ") || undefined;

export function FormValidationSpecimen() {
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const pendingRef = useRef(false);
  const restoreSubmitFocusRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [blocksClosure, setBlocksClosure] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const clearFieldError = (name: FieldName) => {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const focusField = (name: FieldName) => {
    window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field-name="${name}"]`)
        ?.focus();
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingRef.current) return;

    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = "Inserisci un titolo breve.";
    if (!details.trim()) errors.details = "Descrivi che cosa deve essere chiarito.";
    if (!type) errors.type = "Scegli il tipo di richiesta.";

    setGeneralError(null);
    setSuccess(null);
    setFieldErrors(errors);

    const firstInvalid = (["title", "details", "type"] as const).find((name) => errors[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    pendingRef.current = true;
    restoreSubmitFocusRef.current = document.activeElement === submitRef.current;
    setPending(true);
    timerRef.current = window.setTimeout(() => {
      pendingRef.current = false;
      setPending(false);
      setSuccess("Richiesta salvata nell’esempio.");
      window.requestAnimationFrame(() => {
        if (restoreSubmitFocusRef.current && document.activeElement === document.body) {
          submitRef.current?.focus();
        }
        restoreSubmitFocusRef.current = false;
      });
    }, 900);
  };

  const showGeneralError = () => {
    if (pendingRef.current) return;
    setFieldErrors({});
    setSuccess(null);
    setGeneralError("Non è stato possibile salvare la richiesta. Riprova.");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section aria-labelledby="field-states-title" className="rounded-xl border bg-card p-5 sm:p-6">
        <h3 id="field-states-title" className="text-lg font-semibold tracking-tight">
          Stati del singolo campo
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Label, descrizione ed errore hanno responsabilità distinte e ID stabili.
        </p>

        <FieldGroup className="mt-6">
          <Field>
            <FieldLabel htmlFor="specimen-contact">Referente</FieldLabel>
            <Input id="specimen-contact" name="contact" placeholder="Es. Giulia Bianchi" autoComplete="name" />
          </Field>

          <Field>
            <FieldLabel htmlFor="specimen-note">Nota condivisa</FieldLabel>
            <Textarea
              id="specimen-note"
              name="note"
              aria-describedby="specimen-note-description"
              placeholder="Es. Indica il punto da verificare insieme"
            />
            <FieldDescription id="specimen-note-description">
              La nota sarà visibile alle persone coinvolte nel lavoro.
            </FieldDescription>
          </Field>

          <Field data-invalid="true">
            <FieldLabel htmlFor="specimen-email">Email del cliente</FieldLabel>
            <Input
              id="specimen-email"
              name="email"
              type="email"
              defaultValue="cliente@"
              aria-invalid="true"
              aria-describedby="specimen-email-error"
            />
            <FieldError id="specimen-email-error">Inserisci un indirizzo email valido.</FieldError>
          </Field>
        </FieldGroup>
      </section>

      <section aria-labelledby="complete-form-title" className="rounded-xl border bg-card p-5 sm:p-6">
        <h3 id="complete-form-title" className="text-lg font-semibold tracking-tight">
          Form completo
        </h3>
        <p id="complete-form-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          Invia il form vuoto per verificare gli errori locali e il focus sul primo campo invalido.
        </p>

        <form
          ref={formRef}
          className="mt-6 space-y-5"
          aria-busy={pending || undefined}
          aria-describedby="complete-form-description"
          noValidate
          onSubmit={handleSubmit}
        >
          <FieldGroup>
            <Field data-invalid={fieldErrors.title ? "true" : undefined}>
              <FieldLabel htmlFor="request-title">Titolo della richiesta</FieldLabel>
              <Input
                id="request-title"
                name="title"
                data-field-name="title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearFieldError("title");
                }}
                placeholder="Es. Conferma finitura parete"
                aria-invalid={fieldErrors.title ? true : undefined}
                aria-describedby={fieldErrors.title ? "request-title-error" : undefined}
                disabled={pending}
              />
              {fieldErrors.title ? <FieldError id="request-title-error">{fieldErrors.title}</FieldError> : null}
            </Field>

            <Field data-invalid={fieldErrors.details ? "true" : undefined}>
              <FieldLabel htmlFor="request-details">Dettagli</FieldLabel>
              <Textarea
                id="request-details"
                name="details"
                data-field-name="details"
                value={details}
                onChange={(event) => {
                  setDetails(event.target.value);
                  clearFieldError("details");
                }}
                placeholder="Es. Descrivi il chiarimento richiesto"
                aria-invalid={fieldErrors.details ? true : undefined}
                aria-describedby={describedBy("request-details-description", fieldErrors.details ? "request-details-error" : undefined)}
                disabled={pending}
              />
              <FieldDescription id="request-details-description">
                Inserisci solo le informazioni necessarie per comprendere la richiesta.
              </FieldDescription>
              {fieldErrors.details ? <FieldError id="request-details-error">{fieldErrors.details}</FieldError> : null}
            </Field>

            <Field data-invalid={fieldErrors.type ? "true" : undefined}>
              <FieldLabel htmlFor="request-type">Tipo di richiesta</FieldLabel>
              <Select
                items={requestTypes}
                name="type"
                value={type}
                onValueChange={(value) => {
                  setType(value);
                  clearFieldError("type");
                }}
                disabled={pending}
              >
                <SelectTrigger
                  id="request-type"
                  className="w-full"
                  data-field-name="type"
                  aria-invalid={fieldErrors.type ? true : undefined}
                  aria-describedby={fieldErrors.type ? "request-type-error" : undefined}
                  aria-required="true"
                >
                  <SelectValue placeholder="Scegli il tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {requestTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldErrors.type ? <FieldError id="request-type-error">{fieldErrors.type}</FieldError> : null}
            </Field>

            <Field orientation="horizontal" data-disabled={pending || undefined}>
              <Checkbox
                id="request-blocks-closure"
                name="blocksClosure"
                checked={blocksClosure}
                onCheckedChange={setBlocksClosure}
                aria-labelledby="request-blocks-closure-label"
                aria-describedby="request-blocks-closure-description"
                disabled={pending}
              />
              <div className="min-w-0">
                <FieldLabel id="request-blocks-closure-label" htmlFor="request-blocks-closure">
                  Impedisce la chiusura del lavoro
                </FieldLabel>
                <FieldDescription id="request-blocks-closure-description" className="mt-1">
                  Se selezionata, la chiusura resta sospesa finché la richiesta è aperta.
                </FieldDescription>
              </div>
            </Field>
          </FieldGroup>

          {generalError ? (
            <Alert variant="destructive">
              <IconAlertCircle aria-hidden="true" />
              <div>
                <AlertTitle>Salvataggio non riuscito</AlertTitle>
                <AlertDescription>{generalError}</AlertDescription>
              </div>
            </Alert>
          ) : null}

          {success ? (
            <Alert variant="success" role="status">
              <IconCircleCheck aria-hidden="true" />
              <div>
                <AlertTitle>Operazione completata</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </div>
            </Alert>
          ) : null}

          {pending ? (
            <p role="status" className="text-sm text-muted-foreground">Salvataggio in corso…</p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="button" variant="outline" onClick={showGeneralError} disabled={pending}>
              Mostra errore generale
            </Button>
            <Button ref={submitRef} type="submit" loading={pending} disabled={pending}>
              {pending ? "Salvataggio in corso" : "Salva richiesta"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
