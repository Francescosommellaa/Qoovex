"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogIcon,
} from "@qoovex/ui/components/dialog";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldLabel, FieldDescription } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@qoovex/ui/components/select";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconBuildingStore,
  IconAlertTriangle,
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconFileText,
  IconPhoto,
} from "@tabler/icons-react";

export default function DialogPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Dialog & Modali Semantiche"
        description="Varianti funzionali di modale (Form, Destructive, Alert e Media Preview) con comportamento adattivo nativo (Tendina dal basso su Mobile, Modal centrato su Desktop)."
        importPath="import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogIcon } from '@qoovex/ui/components/dialog'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Varianti Semantiche di Modale ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti Semantiche e Funzionali</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Form Modale (Default)">
              <Dialog>
                <DialogTrigger render={<Button className="w-full" />}>
                  <IconPlus />
                  <span>Nuovo Cantiere</span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogIcon variant="info">
                      <IconBuildingStore />
                    </DialogIcon>
                    <DialogTitle>Crea Nuovo Cantiere</DialogTitle>
                    <DialogDescription>
                      Inserisci i dettagli del cantiere. Su mobile si apre come tendina dal basso, su desktop si centra a schermo.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <Field>
                      <FieldLabel htmlFor="site-name">Nome Cantiere / Codice</FieldLabel>
                      <Input id="site-name" placeholder="es. Ristrutturazione Via Roma 42" />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="site-type">Tipologia Lavorazione</FieldLabel>
                      <Select defaultValue="ELECTRIC">
                        <SelectTrigger id="site-type" className="w-full">
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ELECTRIC">Impianto Elettrico</SelectItem>
                          <SelectItem value="PLUMBING">Impianto Idraulico</SelectItem>
                          <SelectItem value="FULL">Ristrutturazione Completa</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="site-amount">Importo Stimato Iniziale (€)</FieldLabel>
                      <Input id="site-amount" placeholder="45000,00" className="font-accent" />
                      <FieldDescription>Valore indicativo inserito dalle parti senza custodia di denaro.</FieldDescription>
                    </Field>
                  </div>

                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Annulla
                    </DialogClose>
                    <Button
                      loading={isSubmitting}
                      onClick={() => {
                        setIsSubmitting(true);
                        setTimeout(() => setIsSubmitting(false), 1500);
                      }}
                    >
                      Crea Cantiere
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Specimen>

            <Specimen title="Modale Conferma Distruttiva (variant=destructive)">
              <Dialog>
                <DialogTrigger render={<Button variant="destructive" className="w-full" />}>
                  <IconTrash />
                  <span>Elimina Cantiere</span>
                </DialogTrigger>
                <DialogContent variant="destructive" size="sm">
                  <DialogHeader>
                    <DialogIcon variant="destructive">
                      <IconAlertTriangle />
                    </DialogIcon>
                    <DialogTitle className="text-destructive">Confermi l'eliminazione?</DialogTitle>
                    <DialogDescription>
                      Questa azione rimuoverà definitivamente il cantiere <strong className="text-foreground font-accent">JOB-SITE #8942-2026</strong>. L'operazione non può essere annullata.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className="mt-2">
                    <DialogClose render={<Button variant="outline" />}>
                      Annulla
                    </DialogClose>
                    <Button variant="destructive">
                      Conferma ed Elimina
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Specimen>

            <Specimen title="Alert Conferma Centrato (variant=alert)">
              <Dialog>
                <DialogTrigger render={<Button variant="secondary" className="w-full" />}>
                  <IconInfoCircle />
                  <span>Conferma Accordo</span>
                </DialogTrigger>
                <DialogContent variant="alert" size="sm">
                  <DialogHeader>
                    <DialogIcon variant="warning">
                      <IconInfoCircle />
                    </DialogIcon>
                    <DialogTitle>Confermi le modifiche apportate?</DialogTitle>
                    <DialogDescription>
                      L'aggiornamento sarà registrato nel registro append-only e notificato al committente.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className="mt-2">
                    <DialogClose render={<Button variant="outline" />}>
                      Torna Indietro
                    </DialogClose>
                    <Button variant="default">
                      Conferma Accordo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Specimen>

            <Specimen title="Media / Document Preview (variant=media)">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" className="w-full" />}>
                  <IconPhoto />
                  <span>Anteprima Documento</span>
                </DialogTrigger>
                <DialogContent variant="media" size="lg">
                  <div className="p-6 bg-card border-b">
                    <DialogHeader>
                      <DialogTitle>Planimetria Impianto Elettrico</DialogTitle>
                      <DialogDescription>Documentazione allegata al cantiere JOB-SITE #8942.</DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="p-8 bg-muted/30 flex items-center justify-center min-h-[240px]">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <IconFileText className="h-12 w-12 stroke-1" />
                      <span className="text-xs font-accent">planimetria_impianto_v2.pdf</span>
                    </div>
                  </div>
                  <div className="p-4 bg-card border-t flex justify-end gap-2">
                    <DialogClose render={<Button variant="outline" />}>
                      Chiudi Anteprima
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
