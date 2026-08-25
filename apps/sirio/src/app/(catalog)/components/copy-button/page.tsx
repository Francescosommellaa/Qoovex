"use client";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen";
import { CopyButton } from "@qoovex/ui/components/copy-button";

const identifier = "QVX-P014-7F3A";
const publicUrl = "https://qoovex.com/documenti/QVX-P014-7F3A";

export default function CopyButtonPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <PageHeader
        description="Command icon-only specializzato: copia una stringa, comunica success o failure senza mutare il nome accessibile e torna a idle con un lifecycle temporaneo controllato."
        importPath="import { CopyButton } from '@qoovex/ui/components/copy-button'"
        title="CopyButton"
      />

      <SpecimenSection
        description="IconCopy a riposo, una sola surface quiet e la geometria IconButton canonica: 28px visuali, raggio 8px, target coarse effettivo da 44px."
        region="overview"
        title="Contratto canonico"
      >
        <Specimen visualId="sirio-copy-button-core">
          <div className="flex items-center gap-3">
            <code className="min-w-0 text-sm [overflow-wrap:anywhere]">{identifier}</code>
            <CopyButton aria-label="Copia identificativo" data-copy-button-proof="core" value={identifier} />
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Hover, press, focus e activation sono prodotti dal browser. Il nome accessibile resta stabile durante copying, success, reset ed error."
        region="interaction-states"
        title="Interaction e accessibilità"
      >
        <SpecimenGrid cols={2}>
          <Specimen stateId="keyboard" title="Tastiera reale">
            <CopyButton aria-label="Copia codice breve" data-copy-button-proof="keyboard" value="A7K9" />
          </Specimen>
          <Specimen stateId="disabled" title="Disabled">
            <CopyButton aria-label="Copia valore non disponibile" disabled data-copy-button-proof="disabled" value="NON-DISPONIBILE" />
          </Specimen>
          <Specimen stateId="labelledby" title="aria-labelledby">
            <span className="text-sm" id="copy-url-label">Copia URL pubblico</span>
            <CopyButton aria-labelledby="copy-url-label" data-copy-button-proof="labelledby" value={publicUrl} />
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Browser QA forza Clipboard API assente, Promise rifiutata e successivo retry riuscito sullo stesso controllo reale. La Check non appare mai prima della risoluzione."
        region="high-risk-combinations"
        title="Failure e retry"
      >
        <Specimen>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Codice di retry: A7K9</span>
            <CopyButton aria-label="Copia codice di retry" data-copy-button-proof="failure" value="A7K9" />
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Prova hold, cancel, click durante success e press ripetuti. Ogni activation riesegue writeText e rinnova un solo feedback timer."
        region="motion-lifecycle"
        title="Interaction lifecycle"
      >
        <Specimen>
          <div className="flex flex-wrap items-center gap-4">
            <CopyButton aria-label="Copia ripetutamente" data-copy-button-proof="rapid" value="RAPID-P014" />
            <p className="max-w-md text-xs text-muted-foreground">Copy e Check condividono lo stesso slot e si scambiano simultaneamente con una spring breve. Il reset è più quieto; reduced motion mantiene uno swap leggibile.</p>
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="La primitive copia testo generico; il consumer espone il valore solo quando appartiene realmente all’interfaccia. Nessun valore viene inserito nei metadata del controllo."
        region="content-stress"
        title="Contesti appropriati"
      >
        <SpecimenGrid cols={2}>
          <Specimen title="Identificativo"><div className="flex min-w-0 items-center gap-2"><code className="min-w-0 text-xs [overflow-wrap:anywhere]">{identifier}</code><CopyButton aria-label="Copia ID pratica" value={identifier} /></div></Specimen>
          <Specimen title="URL lungo"><div className="flex min-w-0 items-center gap-2"><span className="min-w-0 text-xs text-muted-foreground [overflow-wrap:anywhere]">{publicUrl}</span><CopyButton aria-label="Copia URL documento" value={publicUrl} /></div></Specimen>
          <Specimen title="Codice breve"><div className="flex items-center gap-2"><code className="text-sm">A7K9</code><CopyButton aria-label="Copia codice" value="A7K9" /></div></Specimen>
          <Specimen title="Metadata denso"><div className="flex min-w-0 items-center justify-between gap-3"><span className="min-w-0 truncate text-xs text-muted-foreground">Versione documento · QVX-P014-7F3A</span><CopyButton aria-label="Copia versione documento" value="QVX-P014-7F3A" /></div></Specimen>
        </SpecimenGrid>
      </SpecimenSection>

    </div>
  );
}
