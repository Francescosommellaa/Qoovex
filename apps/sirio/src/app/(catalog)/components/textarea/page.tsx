"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Field, FieldLabel, FieldDescription } from "@qoovex/ui/components/field";
import {
  Textarea,
  TextareaGroup,
  TextareaCounter,
  TextareaToolbar,
} from "@qoovex/ui/components/textarea";
import { Button } from "@qoovex/ui/components/button";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconPaperclip,
  IconMoodSmile,
  IconSend,
  IconBold,
  IconItalic,
  IconList,
  IconStarFilled,
  IconAlertTriangle,
  IconLock,
  IconMapPin,
} from "@tabler/icons-react";

export default function TextareaPage() {
  const [basicText, setBasicText] = useState("Descrizione iniziale del cantiere...");
  const [charText, setCharText] = useState("Lavorazione eseguita secondo la normativa di sicurezza V3.");
  const [wordText, setWordText] = useState("Il committente ha approvato lo stato d'avanzamento dei lavori per il primo lotto.");
  const [commentText, setCommentText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);
  const [issueText, setIssueText] = useState("");
  const [addressText, setAddressText] = useState("Via Roma 42, Piano 3\n00100 Roma (RM)\nPresso Cantiere Edile Alfa");

  const wordCount = wordText.trim() ? wordText.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Textarea"
        description="Campo di testo multilinea avanzato con auto-ridimensionamento pulito (senza maniglie superflue), supporto al ridimensionamento manuale con grip custom Qoovex, limiti di caratteri/parole e composer di messaggi."
        importPath="import { Textarea, TextareaGroup, TextareaCounter, TextareaToolbar } from '@qoovex/ui/components/textarea'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Ridimensionamento Pulito ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">1. Ridimensionamento & Limiti</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="1. Auto-resize (Senza Maniglia Superflua)">
              <Field className="w-full">
                <FieldLabel htmlFor="basic-ta">Auto-resize Pulito (Default)</FieldLabel>
                <Textarea
                  id="basic-ta"
                  value={basicText}
                  onChange={(e) => setBasicText(e.target.value)}
                  placeholder="Scrivi qui..."
                />
                <FieldDescription>Espansione automatica senza maniglie di trascinamento superflue.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="2. Manual Resizable (Grip Custom Qoovex)">
              <Field className="w-full">
                <FieldLabel htmlFor="resizable-ta">Resizable Manuale con Grip Custom</FieldLabel>
                <Textarea
                  id="resizable-ta"
                  autoResize={false}
                  resizable
                  placeholder="Trascina dall'angolo in basso a destra..."
                />
                <FieldDescription>Sostituita la maniglia nativa del browser con una maniglia visiva minimale.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="3. Min/Max Rows (Intervallo Limitato)">
              <Field className="w-full">
                <FieldLabel htmlFor="rows-ta">Min/Max Rows (Righe 2-5)</FieldLabel>
                <Textarea
                  id="rows-ta"
                  minRows={2}
                  maxRows={5}
                  placeholder="Inizia a digitare per espandere fino a 5 righe..."
                />
                <FieldDescription>Cresce da 2 a 5 righe prima dello scroll interno.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="4. Character-limited (Limite Caratteri)">
              <Field className="w-full">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="char-ta">Descrizione Breve</FieldLabel>
                  <TextareaCounter current={charText.length} max={500} mode="character" />
                </div>
                <Textarea
                  id="char-ta"
                  value={charText}
                  maxLength={500}
                  onChange={(e) => setCharText(e.target.value)}
                />
                <FieldDescription>Massimo 500 caratteri consentiti.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Descrizioni Avanzate & Note ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">2. Conteggio Parole, Formattazione & Note</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="5. Word-limited (Limite Parole)">
              <Field className="w-full">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="word-ta">Sintesi Esecutiva</FieldLabel>
                  <TextareaCounter current={wordCount} max={50} mode="word" />
                </div>
                <Textarea
                  id="word-ta"
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  placeholder="Inserisci massimo 50 parole..."
                />
                <FieldDescription>Conteggio dinamico del numero di parole inserite.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="6. Rich Description (Barra Strumenti Formattazione)">
              <Field className="w-full">
                <FieldLabel>Rich Description (Descrizione Estesa)</FieldLabel>
                <TextareaGroup>
                  <Textarea
                    placeholder="Aggiungi una descrizione dettagliata del cantiere..."
                    className="border-0 focus-visible:ring-0 rounded-b-none min-h-24"
                  />
                  <TextareaToolbar>
                    <div className="flex items-center gap-1">
                      <Button aria-label="Grassetto" variant="ghost" size="icon-xs"><IconBold aria-hidden="true" /></Button>
                      <Button aria-label="Corsivo" variant="ghost" size="icon-xs"><IconItalic aria-hidden="true" /></Button>
                      <Button aria-label="Elenco" variant="ghost" size="icon-xs"><IconList aria-hidden="true" /></Button>
                    </div>
                    <span className="text-[0.6875rem] text-muted-foreground font-accent">Rich Text Enabled</span>
                  </TextareaToolbar>
                </TextareaGroup>
              </Field>
            </Specimen>

            <Specimen title="7. Notes (Note Operative Riservate)">
              <Field className="w-full">
                <div className="flex items-center gap-2 mb-1">
                  <FieldLabel htmlFor="notes-ta">Note Interne Riservate</FieldLabel>
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <IconLock className="size-3" />
                    <span>Riservato Team</span>
                  </Badge>
                </div>
                <Textarea
                  id="notes-ta"
                  className="bg-muted/30 border-muted-foreground/20 font-accent text-xs"
                  defaultValue="Nota tecnica: Verificare la pressione della tubatura principale prima dell'attivazione del secondo lotto."
                />
              </Field>
            </Specimen>

            <Specimen title="8. Address Multiline (Indirizzo Cantiere)">
              <Field className="w-full">
                <FieldLabel htmlFor="address-ta">Indirizzo di Spedizione / Cantiere</FieldLabel>
                <div className="relative w-full">
                  <Textarea
                    id="address-ta"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="pl-9 font-accent"
                  />
                  <IconMapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 3: Messaggistica, Commenti & Feedback ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">3. Messaggistica, Commenti & Feedback</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="9. Comment (Commenti Brevi)">
              <div className="flex gap-3 w-full">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary">MR</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Aggiungi un commento al cantiere..."
                    className="min-h-16 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost">Annulla</Button>
                    <Button size="sm">Pubblica</Button>
                  </div>
                </div>
              </div>
            </Specimen>

            <Specimen title="10. Message Composer (Chat & Allegati)">
              <Field className="w-full">
                <FieldLabel>Composer Messaggi</FieldLabel>
                <TextareaGroup>
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Scrivi un messaggio al referente..."
                    className="border-0 focus-visible:ring-0 rounded-b-none min-h-20"
                  />
                  <TextareaToolbar>
                    <div className="flex items-center gap-1">
                      <Button aria-label="Aggiungi allegato" variant="ghost" size="icon-xs"><IconPaperclip aria-hidden="true" /></Button>
                      <Button aria-label="Aggiungi emoji" variant="ghost" size="icon-xs"><IconMoodSmile aria-hidden="true" /></Button>
                    </div>
                    <Button size="sm" className="gap-1.5 h-7 text-xs">
                      <span>Invia</span>
                      <IconSend className="size-3.5" />
                    </Button>
                  </TextareaToolbar>
                </TextareaGroup>
              </Field>
            </Specimen>

            <Specimen title="11. Feedback Textarea (Valutazione Servizio)">
              <Field className="w-full">
                <div className="flex items-center justify-between">
                  <FieldLabel>Feedback Intervento</FieldLabel>
                  <div aria-label="Valutazione del servizio" className="flex gap-1 text-warning-emphasis" role="group">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} ${star === 1 ? "stella" : "stelle"}${star === rating ? ", selezionata" : ""}`}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <IconStarFilled aria-hidden="true" className={`size-4 ${star <= rating ? "text-warning-emphasis" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Lascia un commento sulla qualità del lavoro eseguito..."
                  className="min-h-20"
                />
              </Field>
            </Specimen>

            <Specimen title="12. Issue Description (Anomalie Cantiere)">
              <Field className="w-full">
                <div className="flex items-center gap-2 mb-1">
                  <FieldLabel htmlFor="issue-ta" className="text-destructive">Descrizione Anomalia Cantiere</FieldLabel>
                  <Badge variant="destructive" className="gap-1">
                    <IconAlertTriangle className="size-3" />
                    <span>Segnalazione Critica</span>
                  </Badge>
                </div>
                <Textarea
                  id="issue-ta"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Descrivi l'anomalia riscontrata sul luogo di lavoro..."
                  className="border-destructive/40 focus-visible:ring-destructive/30 min-h-20"
                />
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
