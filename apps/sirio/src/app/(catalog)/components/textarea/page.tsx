"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen";
import { Button } from "@qoovex/ui/components/button";
import { CharacterCounter } from "@qoovex/ui/components/character-counter";
import { Field, FieldDescription, FieldError } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";

const exampleText = [
  "Sopralluogo completato con il referente.",
  "Demolizione conclusa al piano terra.",
  "Impianto elettrico in verifica.",
  "Materiali in consegna giovedì.",
  "Confermare l’accesso prima della consegna.",
  "Aggiornare il verbale dopo la verifica.",
  "Condividere le fotografie del sopralluogo.",
].join("\n");

export default function TextareaPage() {
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [shortNote, setShortNote] = useState("");
  const [description, setDescription] = useState("");
  const descriptionMissing = description.trim().length === 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      <PageHeader
        title="Textarea"
        description="Scrittura multilinea. Cresce con il contenuto, oppure mantiene un’altezza fissa o regolabile."
        importPath="import { Textarea } from '@qoovex/ui/components/textarea'"
      />

      <Specimen title="Crescita automatica" visualId="sirio-textarea-auto">
        <Field className="w-full">
          <Label htmlFor="textarea-auto">Nota operativa</Label>
          <Textarea
            id="textarea-auto"
            data-textarea-proof="auto"
            maxRows={5}
            onChange={(event) => setValue(event.target.value)}
            placeholder={"Scrivi una nota…\nPuoi continuare su più righe."}
            value={value}
          />
          <FieldDescription>Cresce fino a cinque righe, poi il testo scorre all’interno.</FieldDescription>
          <div className="flex flex-wrap gap-2" data-textarea-proof="actions">
            <Button onClick={() => setValue(exampleText)} size="sm" type="button" variant="secondary">Inserisci esempio</Button>
            <Button onClick={() => setValue("")} size="sm" type="button" variant="ghost">Svuota</Button>
          </div>
        </Field>
      </Specimen>

      <SpecimenGrid cols={2}>
        <Specimen title="Altezza fissa" visualId="sirio-textarea-fixed">
          <Field className="w-full">
            <Label htmlFor="textarea-fixed">Aggiornamento</Label>
            <Textarea
              id="textarea-fixed"
              autoResize={false}
              data-textarea-proof="fixed"
              defaultValue={exampleText}
              rows={3}
            />
            <FieldDescription>Tre righe visibili. Scorri per leggere il resto.</FieldDescription>
          </Field>
        </Specimen>
        <Specimen title="Altezza regolabile" visualId="sirio-textarea-manual">
          <Field className="w-full">
            <Label htmlFor="textarea-manual">Appunti</Label>
            <Textarea
              id="textarea-manual"
              autoResize={false}
              data-textarea-proof="manual"
              maxRows={8}
              placeholder="Spazio per i tuoi appunti…"
              resizable
            />
            <FieldDescription>Trascina la maniglia in basso a destra.</FieldDescription>
          </Field>
        </Specimen>
      </SpecimenGrid>

      <SpecimenSection region="variants" title="Varianti d’uso">
        <div className="space-y-4">
          <Specimen title="Commento con limite caratteri" visualId="sirio-textarea-comment">
            <Field className="w-full">
              <Label htmlFor="textarea-comment">Commento</Label>
              <Textarea
                id="textarea-comment"
                aria-describedby="textarea-comment-help textarea-comment-count"
                data-textarea-proof="comment"
                maxLength={200}
                maxRows={5}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Aggiungi un aggiornamento breve…"
                value={comment}
              />
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <FieldDescription id="textarea-comment-help">Massimo 200 caratteri, anche quando incolli un testo.</FieldDescription>
                <CharacterCounter current={comment.length} id="textarea-comment-count" max={200} className="self-end" />
              </div>
            </Field>
          </Specimen>
          <Specimen title="Input breve con limite">
            <Field className="w-full">
              <Label htmlFor="input-counter">Titolo breve</Label>
              <Input
                aria-describedby="input-counter-help input-counter-count"
                id="input-counter"
                maxLength={40}
                onChange={(event) => setShortNote(event.target.value)}
                placeholder="Titolo dell’aggiornamento…"
                value={shortNote}
              />
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <FieldDescription id="input-counter-help">Sintetico e riconoscibile nell’elenco.</FieldDescription>
                <CharacterCounter current={shortNote.length} id="input-counter-count" max={40} className="self-end" />
              </div>
            </Field>
          </Specimen>
          <Specimen title="Enfasi progressiva">
            <div className="grid w-full gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                ["Normale", 120],
                ["Vicino al limite", 470],
                ["Al limite", 500],
                ["Oltre il limite", 510],
              ].map(([label, current]) => (
                <div className="flex items-center justify-between gap-6 border-b border-border py-2 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0" key={label}>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <CharacterCounter current={current as number} max={500} />
                </div>
              ))}
            </div>
          </Specimen>
            <Specimen title="Nota compatta" visualId="sirio-textarea-note">
              <Field className="w-full">
                <Label htmlFor="textarea-note" optional>Nota interna</Label>
                <Textarea
                  id="textarea-note"
                  data-textarea-proof="note"
                  maxRows={4}
                  minRows={2}
                  placeholder="Un promemoria per il team…"
                />
                <FieldDescription>Parte da due righe e cresce quando serve.</FieldDescription>
              </Field>
            </Specimen>
        </div>
      </SpecimenSection>

      <SpecimenSection region="persistent-states" title="Disponibilità e validazione">
        <Specimen visualId="sirio-textarea-states">
          <div className="grid w-full gap-6 lg:grid-cols-2">
            <Field className="lg:col-span-2">
              <Label htmlFor="textarea-disabled">Disabilitata</Label>
              <Textarea
                id="textarea-disabled"
                aria-describedby="textarea-disabled-help"
                data-textarea-proof="disabled"
                defaultValue={"Nota non disponibile\nin questa fase."}
                disabled
              />
              <FieldDescription id="textarea-disabled-help">Il contenuto resta leggibile, ma non è modificabile.</FieldDescription>
            </Field>
            <Field className="lg:col-span-2" data-invalid={descriptionMissing || undefined}>
              <Label htmlFor="textarea-invalid" required>Descrizione</Label>
              <Textarea
                id="textarea-invalid"
                aria-describedby={descriptionMissing ? "textarea-invalid-help textarea-invalid-error" : "textarea-invalid-help"}
                aria-invalid={descriptionMissing || undefined}
                data-textarea-proof="invalid"
                maxRows={5}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descrivi l’intervento…"
                required
                value={description}
              />
              <FieldDescription id="textarea-invalid-help">Indica il lavoro da svolgere e il risultato atteso.</FieldDescription>
              {descriptionMissing ? <FieldError id="textarea-invalid-error">Aggiungi una descrizione per continuare.</FieldError> : null}
            </Field>
          </div>
        </Specimen>
      </SpecimenSection>
    </div>
  );
}
