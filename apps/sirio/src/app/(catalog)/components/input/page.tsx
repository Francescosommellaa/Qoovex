import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen";
import { Input } from "@qoovex/ui/components/input";

const longReference = "Ristrutturazione completa appartamento scala B, interno 14 — sopralluogo tecnico del 24 agosto 2026";

export default function InputPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12" data-input-foundation>
      <PageHeader
        description="Il vero controllo nativo: possiede testo, caret, selezione, focus e API HTML. Field aggiunge separatamente label, aiuto ed errore; le composizioni specializzate hanno pagine dedicate."
        importPath="import { Input } from '@qoovex/ui/components/input'"
        title="Input"
      />

      <SpecimenSection
        description="Rest comunica già l'area editabile. Empty, placeholder e value usano la stessa geometria, senza label flottanti o API aggiuntive."
        region="overview"
        title="Core"
      >
        <SpecimenGrid cols={3}>
          <Specimen stateId="empty" title="Empty" visualId="sirio-input-core">
            <Input aria-label="Riferimento vuoto" data-input-proof="empty" />
          </Specimen>
          <Specimen stateId="placeholder" title="Placeholder">
            <Input aria-label="Nome referente" data-input-proof="placeholder" placeholder="Es. Giulia Bianchi" />
          </Specimen>
          <Specimen stateId="value" title="With value">
            <Input aria-label="Codice cantiere" data-input-proof="value" defaultValue="QV-2026-014" />
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Usa Tab e Shift+Tab tra i campi consecutivi, poi prova click o tap. Il browser assegna il focus al vero input; nessuna classe simula :focus-visible."
        region="interaction-states"
        title="Focus reale"
      >
        <Specimen visualId="sirio-input-focus-path">
          <div className="grid w-full max-w-xl gap-5 sm:grid-cols-2">
            <Input aria-label="Primo riferimento" data-input-proof="focus-first" id="input-focus-first" placeholder="Premi Tab" />
            <Input aria-label="Secondo riferimento" data-input-proof="focus-second" id="input-focus-second" placeholder="Poi Shift+Tab" />
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Digita rapidamente, seleziona, sostituisci, cancella e incolla. Value, caret e placeholder rispondono subito: il primitive non aggiunge state machine o animazioni al testo."
        region="content-stress"
        title="Typing e contenuto"
      >
        <SpecimenGrid cols={2}>
          <Specimen title="Typing, replace e paste">
            <Input aria-label="Riferimento operativo" autoComplete="off" data-input-proof="typing" id="input-typing" placeholder="Scrivi o incolla un riferimento" />
          </Specimen>
          <Specimen stateId="long-value" title="Long value">
            <Input aria-label="Descrizione estesa" data-input-proof="long-value" defaultValue={longReference} id="input-long-value" />
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Editable, readonly, disabled e invalid restano semanticamente reali. Il campo invalid raggiungibile con Tab conserva insieme bordo destructive e focus outline."
        region="persistent-states"
        title="Availability e validation"
      >
        <SpecimenGrid cols={2}>
          <Specimen stateId="editable" title="Editable" visualId="sirio-input-states">
            <Input aria-label="Campo modificabile" data-input-proof="editable" defaultValue="Valore modificabile" />
          </Specimen>
          <Specimen stateId="readonly" title="Readonly">
            <Input aria-label="Campo in sola lettura" data-input-proof="readonly" defaultValue="Valore selezionabile e copiabile" readOnly />
          </Specimen>
          <Specimen stateId="disabled" title="Disabled">
            <Input aria-label="Campo non disponibile" data-input-proof="disabled" defaultValue="Valore non modificabile" disabled />
          </Specimen>
          <Specimen stateId="invalid" title="Invalid — usa Tab per il focus reale">
            <Input aria-invalid="true" aria-label="Codice commessa non valido" data-input-proof="invalid-focus" defaultValue="QV?14" id="input-invalid-focus" />
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>
    </div>
  );
}
