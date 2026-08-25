"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen";
import { Button } from "@qoovex/ui/components/button";
import { CloseButton } from "@qoovex/ui/components/close-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";

export default function CloseButtonPage() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [closeCount, setCloseCount] = useState(0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <PageHeader
        description="Azione icon-only specializzata per chiudere una surface. Icona, geometria quiet e interaction lifecycle sono invarianti; il consumer possiede contesto, nome e posizione."
        importPath="import { CloseButton } from '@qoovex/ui/components/close-button'"
        title="CloseButton"
      />

      <SpecimenSection
        description="Una sola presentazione quiet e una sola size canonica: 28px visuali, raggio 8px e target coarse effettivo da 44px."
        region="overview"
        title="Contratto canonico"
      >
        <SpecimenGrid cols={2}>
          <Specimen stateId="rest" title="Nome contestuale" visualId="sirio-close-button-core">
            <CloseButton aria-label="Chiudi pannello" data-close-button-proof="core" />
          </Specimen>
          <Specimen stateId="labelledby" title="aria-labelledby">
            <span className="sr-only" id="close-notice-label">Chiudi avviso</span>
            <CloseButton aria-labelledby="close-notice-label" data-close-button-proof="labelledby" />
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Focus, hover, press e cancel sono interazioni browser reali. Disabled resta quieto e non avvia Motion."
        region="interaction-states"
        title="Interaction states"
      >
        <SpecimenGrid cols={2}>
          <Specimen stateId="focus-visible" title="Tastiera reale">
            <CloseButton aria-label="Chiudi con tastiera" data-close-button-proof="keyboard" />
          </Specimen>
          <Specimen stateId="disabled" title="Disabled">
            <CloseButton aria-label="Chiudi controllo non disponibile" disabled />
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Il container possiede position e spazio dal titolo. CloseButton non conosce Dialog, panel, safe area o coordinate."
        region="high-risk-combinations"
        title="Composizione nelle surface"
      >
        <SpecimenGrid cols={2}>
          <Specimen title="Header con titolo lungo" visualId="sirio-close-button-context">
            <div className="relative w-full max-w-md rounded-[calc(var(--radius)+var(--space-4))] border border-border bg-background p-4 pr-16">
              <h3 className="text-base font-semibold leading-snug">Dettaglio della proposta con un titolo volutamente lungo e responsivo</h3>
              <p className="mt-2 text-sm text-muted-foreground">La X non intercetta il testo e non possiede il proprio posizionamento.</p>
              <CloseButton aria-label="Chiudi dettaglio proposta" className="absolute right-4 top-4" />
            </div>
          </Specimen>
          <Specimen title="Panel stretto">
            <div className="relative w-full max-w-64 rounded-[calc(var(--radius)+var(--space-3))] border border-border bg-background p-3 pr-14">
              <h3 className="text-sm font-semibold">Attività recenti</h3>
              <p className="mt-1 text-xs text-muted-foreground">La composizione resta leggibile anche nel container stretto.</p>
              <CloseButton aria-label="Chiudi attività recenti" className="absolute right-3 top-3" />
            </div>
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Apri il Dialog, raggiungi la X con Tab e attivala con Enter o Space. Base UI possiede dismissal e focus restoration."
        region="persistent-states"
        title="Dialog.Close composition"
      >
        <Specimen>
          <Dialog>
            <DialogTrigger render={<Button data-close-button-dialog-trigger type="button">Apri finestra di prova</Button>} />
            <DialogContent closeButtonProps={{ "aria-label": "Chiudi finestra di prova" }} size="sm">
              <DialogHeader>
                <DialogTitle>Conferma composizione CloseButton</DialogTitle>
                <DialogDescription>La chiusura non crea button nidificati e il focus torna al trigger reale.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Mantieni premuto, esci dal target, rientra e rilascia. La surface torna dalla posizione corrente; la hit area e il focus owner non cambiano."
        region="motion-lifecycle"
        title="Motion playground"
      >
        <Specimen visualId="sirio-close-button-motion">
          {panelOpen ? (
            <div className="relative w-full max-w-sm rounded-[calc(var(--radius)+var(--space-4))] border border-border bg-background p-4 pr-16">
              <p className="text-sm font-medium">Surface dismissibile reale</p>
              <p className="mt-1 text-xs text-muted-foreground">Prova hover rapido, hold, cancel e press ripetuti.</p>
              <CloseButton
                aria-label="Chiudi surface di prova"
                className="absolute right-4 top-4"
                data-close-button-proof="motion"
                onClick={() => {
                  setPanelOpen(false);
                  setCloseCount((count) => count + 1);
                }}
              />
            </div>
          ) : (
            <Button onClick={() => setPanelOpen(true)} type="button">Riapri surface</Button>
          )}
          <output aria-live="polite" className="text-xs text-muted-foreground" data-close-button-close-count>
            Chiusure: {closeCount}
          </output>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Il root cresce sui pointer coarse; la surface visiva resta 28px. Le celle adiacenti possiedono spazio reale e non sovrappongono hitbox invisibili."
        region="responsive"
        title="Geometria target"
      >
        <Specimen visualId="sirio-close-button-targets">
          <div className="grid grid-cols-3 gap-2" data-close-button-target-grid>
            <CloseButton aria-label="Chiudi pannello A" />
            <CloseButton aria-label="Chiudi pannello B" />
            <CloseButton aria-label="Chiudi pannello C" />
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Una X non definisce da sola la semantica close. Questi sono anti-pattern testuali, non controlli consigliati."
        region="content-stress"
        title="Confine semantico"
      >
        <Specimen>
          <ul className="grid w-full max-w-lg gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <li><code>X</code> per “Elimina” → IconButton/action distruttiva</li>
            <li><code>X</code> per “Svuota campo” → clear control</li>
            <li><code>X</code> per “Rimuovi elemento” → remove action</li>
          </ul>
        </Specimen>
      </SpecimenSection>
    </div>
  );
}
