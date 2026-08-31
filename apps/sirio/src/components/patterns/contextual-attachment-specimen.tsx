"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClockHour4,
  IconFile,
  IconPaperclip,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Field, FieldDescription, FieldError } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { Input } from "@qoovex/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qoovex/ui/components/select";

type Visibility = "Solo Azienda" | "Condiviso con il cliente";

const visibilityOptions = [
  { label: "Solo Azienda", value: "Solo Azienda" },
  { label: "Condiviso con il cliente", value: "Condiviso con il cliente" },
] as const satisfies readonly { label: string; value: Visibility }[];

const contextualExamples = [
  {
    title: "Richiesta",
    context: "Richiesta: Conferma finitura parete",
    action: "Allega un file alla richiesta",
    destination: "Il file compare nella conversazione della richiesta e nella libreria File.",
  },
  {
    title: "Proposta o modifica",
    context: "Proposta: Sostituzione rivestimento",
    action: "Allega un file alla proposta",
    destination: "Il file resta vicino alla proposta valutata e compare anche nella libreria File.",
  },
  {
    title: "Pagamento documentato",
    context: "Pagamento: Acconto lavori",
    action: "Allega una ricevuta",
    destination: "Il file viene collegato alla richiesta di pagamento corrente, senza indicare che Qoovex lo verifichi.",
  },
  {
    title: "Disaccordo",
    context: "Disaccordo: Finitura non corrispondente",
    action: "Allega un file al disaccordo",
    destination: "Il file compare nel disaccordo a cui si riferisce e nella libreria File.",
  },
  {
    title: "File del cantiere",
    context: "Cantiere: Ristrutturazione appartamento",
    action: "Carica un file nel cantiere",
    destination: "Solo l’Azienda usa questo ingresso per file che non appartengono naturalmente a un elemento specifico.",
  },
] as const;

function humanFileType(file: File) {
  const extension = file.name.split(".").pop()?.toLocaleLowerCase("it-IT");
  if (file.type === "application/pdf" || extension === "pdf") return "Documento PDF";
  if (file.type === "image/jpeg" || extension === "jpg" || extension === "jpeg") return "Immagine JPG";
  if (file.type === "image/png" || extension === "png") return "Immagine PNG";
  if (file.type === "image/webp" || extension === "webp") return "Immagine WebP";
  return "Tipo non riconosciuto";
}

function AttachmentSelectionSpecimen() {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("Condiviso con il cliente");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileId = `${generatedId}-file`;
  const descriptionId = `${fileId}-description`;
  const selectionId = `${fileId}-selection`;
  const errorId = `${fileId}-error`;
  const visibilityId = `${generatedId}-visibility`;
  const visibilityDescriptionId = `${visibilityId}-description`;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Scegli il file da allegare a questa richiesta.");
      setSuccess(false);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setSuccess(true);
  };

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="font-medium">Richiesta: Conferma finitura parete</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Il file sarà collegato automaticamente a questa richiesta.
        </p>
      </div>

      <Field data-invalid={error ? "true" : undefined}>
        <Label htmlFor={fileId} required>File</Label>
        <Input
          ref={inputRef}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
          aria-invalid={error ? true : undefined}
          id={fileId}
          name="file"
          onChange={(event) => {
            setSelectedFile(event.currentTarget.files?.[0] ?? null);
            setError(null);
            setSuccess(false);
          }}
          required
          type="file"
        />
        <FieldDescription id={descriptionId}>PDF e immagini JPG, PNG o WebP, fino a 4 MB.</FieldDescription>
        <p aria-live="polite" className="min-w-0 text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]" id={selectionId}>
          {selectedFile ? `File selezionato: ${selectedFile.name}. ${humanFileType(selectedFile)}.` : "Nessun file selezionato."}
        </p>
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </Field>

      <Field>
        <Label htmlFor={visibilityId}>Visibilità</Label>
        <Select
          items={visibilityOptions}
          name="visibility"
          value={visibility}
          onValueChange={(value) => {
            if (value === "Solo Azienda" || value === "Condiviso con il cliente") setVisibility(value);
          }}
        >
          <SelectTrigger aria-describedby={visibilityDescriptionId} className="w-full" id={visibilityId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {visibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription id={visibilityDescriptionId}>
          L’Azienda sceglie se il file resta interno oppure viene condiviso con il cliente.
        </FieldDescription>
      </Field>

      {success ? (
        <Alert role="status" variant="success">
          <IconCircleCheck aria-hidden="true" />
          <div>
            <AlertTitle>File pronto nell’esempio</AlertTitle>
            <AlertDescription>
              {selectedFile?.name} verrebbe allegato alla richiesta con visibilità “{visibility}”.
            </AlertDescription>
          </div>
        </Alert>
      ) : null}

      <Button type="submit">Carica file</Button>
    </form>
  );
}

function UploadStatesSpecimen() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section aria-labelledby="attachment-pending-title" aria-busy="true" className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <IconClockHour4 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <h3 className="font-semibold" id="attachment-pending-title">Caricamento in corso</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Il controllo e il submit restano disabilitati finché l’invio non termina.</p>
          </div>
        </div>
        <Button className="mt-4" disabled loading>Caricamento in corso</Button>
        <p className="sr-only" role="status">Caricamento del file in corso.</p>
      </section>

      <section aria-labelledby="attachment-error-title" className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <IconAlertCircle aria-hidden="true" className="mt-0.5 size-5 text-destructive" />
          <div>
            <h3 className="font-semibold" id="attachment-error-title">Caricamento non riuscito</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Il messaggio indica il problema e lascia il contesto disponibile per riprovare.</p>
          </div>
        </div>
        <Alert className="mt-4" variant="destructive">
          <IconAlertCircle aria-hidden="true" />
          <div>
            <AlertTitle>File non caricato</AlertTitle>
            <AlertDescription>Scegli un file supportato, fino a 4 MB, e riprova.</AlertDescription>
          </div>
        </Alert>
      </section>

      <section aria-labelledby="attachment-success-title" className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <IconCircleCheck aria-hidden="true" className="mt-0.5 size-5 text-success" />
          <div>
            <h3 className="font-semibold" id="attachment-success-title">File caricato</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">L’esito nomina il file e conferma dove è stato allegato.</p>
          </div>
        </div>
        <Alert className="mt-4" role="status" variant="success">
          <IconCircleCheck aria-hidden="true" />
          <div>
            <AlertTitle>File allegato alla richiesta</AlertTitle>
            <AlertDescription>capitolato-rivestimenti.pdf è ora disponibile in questa richiesta.</AlertDescription>
          </div>
        </Alert>
      </section>
    </div>
  );
}

export function ContextualAttachmentSpecimens() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="attachment-contexts-title">
        <h3 className="text-lg font-semibold tracking-tight" id="attachment-contexts-title">Contesti supportati</h3>
        <dl className="mt-4 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
          {contextualExamples.map((example) => (
            <div className="grid gap-3 py-5 lg:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-6" key={example.title}>
              <dt className="font-semibold">{example.title}</dt>
              <dd className="min-w-0">
                <p className="font-medium">{example.action}</p>
                <p className="mt-1 break-words text-sm text-muted-foreground">{example.context}</p>
              </dd>
              <dd className="leading-6 text-muted-foreground">{example.destination}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <Card aria-labelledby="contextual-upload-title" role="article">
          <CardHeader>
            <CardTitle><h3 id="contextual-upload-title">Upload contestuale dell’Azienda</h3></CardTitle>
            <CardDescription>
              Specimen interattivo: riflette il file selezionato e gli stati accessibili, ma non invia dati.
            </CardDescription>
          </CardHeader>
          <CardContent><AttachmentSelectionSpecimen /></CardContent>
        </Card>

        <Card aria-labelledby="client-context-title" role="article" variant="outline">
          <CardHeader>
            <CardTitle><h3 id="client-context-title">Upload contestuale del Cliente</h3></CardTitle>
            <CardDescription>Il contesto resta identico; la scelta di visibilità non compare.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="font-medium">Pagamento: Acconto lavori</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">La ricevuta sarà collegata automaticamente a questa richiesta di pagamento.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info"><IconPaperclip aria-hidden="true" />Condiviso con l’Azienda</Badge>
              <span className="text-sm text-muted-foreground">La condivisione deriva dal flusso Cliente.</span>
            </div>
            <Field>
              <Label htmlFor="client-attachment-file">File</Label>
              <Input aria-describedby="client-attachment-file-description" disabled id="client-attachment-file" type="file" />
              <FieldDescription id="client-attachment-file-description">PDF e immagini JPG, PNG o WebP, fino a 4 MB.</FieldDescription>
            </Field>
            <Button disabled>Carica ricevuta</Button>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="attachment-result-title" className="rounded-xl border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight" id="attachment-result-title">Dopo il caricamento</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Il file resta vicino all’elemento di origine e compare nella libreria con contesto e visibilità leggibili.
        </p>
        <ul className="mt-5 divide-y divide-border" aria-label="Esempio di file caricato">
          <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <IconFile aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <strong className="break-words">capitolato-rivestimenti.pdf</strong>
                <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <div><dt className="sr-only">Contesto</dt><dd>Richiesta: Conferma finitura parete</dd></div>
                  <div><dt className="sr-only">Tipo di file</dt><dd>Documento PDF</dd></div>
                  <div><dt className="sr-only">Visibilità</dt><dd>Visibilità: Condiviso con il cliente</dd></div>
                  <div><dt className="sr-only">Data</dt><dd>Caricato il 17 ago 2026, 10:30</dd></div>
                  <div><dt className="sr-only">Dimensione</dt><dd>1,2 MB</dd></div>
                </dl>
              </div>
            </div>
            <Button disabled size="sm" variant="outline">Scarica file</Button>
          </li>
        </ul>
      </section>

      <section aria-labelledby="attachment-states-title">
        <h3 className="text-lg font-semibold tracking-tight" id="attachment-states-title">Pending, errore e successo</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Gli stati preservano il contesto e usano testo esplicito; colore e icona restano supporti secondari.
        </p>
        <div className="mt-5"><UploadStatesSpecimen /></div>
      </section>
    </div>
  );
}
