"use client";

import { type ReactNode, useState } from "react";
import {
  IconDownload,
  IconArrowRight,
  IconChevronDown,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import {
  Specimen,
  SpecimenGrid,
  SpecimenSection,
} from "@/components/specimen";
import { IconButton } from "@qoovex/ui/components/icon-button";
import { CloseButton } from "@qoovex/ui/components/close-button";
import { CopyButton } from "@qoovex/ui/components/copy-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@qoovex/ui/components/tooltip";

const variants = [
  ["default", "Aggiungi elemento", IconPlus],
  ["secondary", "Apri opzioni", IconSettings],
  ["outline", "Scarica allegato", IconDownload],
  ["ghost", "Apri impostazioni", IconSettings],
  ["destructive", "Elimina elemento", IconTrash],
] as const;

export default function IconButtonPage() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activationCount, setActivationCount] = useState(0);

  function demonstrateLoading() {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1400);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <PageHeader
        description="Azione icon-only con hit target, focus, naming accessibile e superficie Motion indipendenti dalla geometria del glyph."
        importPath="import { IconButton } from '@qoovex/ui/components/icon-button'"
        title="IconButton"
      />

      <SpecimenSection
        description="Cinque materiali opachi condivisi con Button; Ghost resta privo di surface a riposo e la introduce durante l'interazione."
        region="variants"
        title="Varianti"
      >
        <Specimen visualId="sirio-icon-button-variants">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {variants.map(([variant, label, Glyph]) => (
              <div className="flex flex-col items-center gap-2" key={variant}>
                <IconButton
                  aria-label={label}
                  motionIntent={variant === "outline" ? "download" : "neutral"}
                  variant={variant}
                >
                  <Glyph aria-hidden="true" />
                </IconButton>
                <span className="text-xs text-muted-foreground">{variant}</span>
              </div>
            ))}
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection region="sizes" title="Dimensioni visuali">
        <Specimen visualId="sirio-icon-button-sizes">
          <div className="flex items-end gap-5">
            {(["xs", "sm", "default"] as const).map((size) => (
              <div className="flex flex-col items-center gap-2" key={size}>
                <IconButton aria-label={`Aggiungi, dimensione ${size}`} size={size} variant="outline">
                  <IconPlus aria-hidden="true" />
                </IconButton>
                <span className="text-xs text-muted-foreground">{size}</span>
              </div>
            ))}
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection region="interaction-states" title="Stati reali">
        <SpecimenGrid cols={2}>
          <Specimen stateId="disabled" title="Disabled">
            <IconButton aria-label="Impostazioni non disponibili" disabled variant="secondary">
              <IconSettings aria-hidden="true" />
            </IconButton>
          </Specimen>
          <Specimen stateId="loading" title="Loading senza geometry shift" visualId="sirio-icon-button-loading">
            <IconButton aria-label="Scarica allegato" data-icon-button-proof="loading" loading={loading} onClick={demonstrateLoading} variant="outline">
              <IconDownload aria-hidden="true" />
            </IconButton>
            <span className="text-xs text-muted-foreground">Attiva per provare icon → loader → icon.</span>
          </Specimen>
          <Specimen stateId="expanded" title="Trigger expanded">
            <IconButton
              aria-expanded={expanded}
              aria-label="Mostra opzioni"
              motionIntent="disclosure"
              onClick={() => setExpanded((current) => !current)}
              variant="ghost"
            >
              <IconChevronDown aria-hidden="true" />
            </IconButton>
          </Specimen>
          <Specimen stateId="focus-visible" title="Focus reale">
            <p className="text-center text-xs text-muted-foreground">Usa Tab: il ring appartiene al root e compare immediatamente.</p>
            <IconButton aria-label="Aggiungi con tastiera">
              <IconPlus aria-hidden="true" />
            </IconButton>
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Il nome accessibile appartiene al controllo. Tooltip è una composizione opzionale per azioni dense o ambigue."
        region="high-risk-combinations"
        title="Accessibilità e discoverability"
      >
        <SpecimenGrid cols={2}>
          <Specimen title="aria-labelledby">
            <span id="download-icon-button-label" className="text-sm">Scarica il rapporto mensile</span>
            <IconButton aria-labelledby="download-icon-button-label" variant="outline">
              <IconDownload aria-hidden="true" />
            </IconButton>
          </Specimen>
          <Specimen title="Tooltip composto">
            <Tooltip>
              <TooltipTrigger render={<IconButton aria-label="Configura automazione" variant="ghost" />}>
                <IconSettings aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent>Configura automazione</TooltipContent>
            </Tooltip>
          </Specimen>
        </SpecimenGrid>
      </SpecimenSection>

      <SpecimenSection
        description="Directional, disclosure, Close e Copy condividono la stessa Action surface ma mantengono lifecycle semantici distinti. Settings resta intenzionalmente neutrale."
        region="motion-lifecycle"
        title="Icon actions"
      >
        <Specimen visualId="sirio-icon-button-motion">
          <div className="flex flex-wrap items-start justify-center gap-5">
            <IconActionLabel label="Directional">
              <IconButton aria-label="Continua" data-icon-button-proof="rapid" motionIntent="directional-right" onClick={() => setActivationCount((count) => count + 1)}><IconArrowRight aria-hidden="true" /></IconButton>
            </IconActionLabel>
            <IconActionLabel label="Disclosure">
              <IconButton aria-expanded={expanded} aria-label="Mostra dettagli" motionIntent="disclosure" onClick={() => setExpanded((current) => !current)} variant="ghost"><IconChevronDown aria-hidden="true" /></IconButton>
            </IconActionLabel>
            <IconActionLabel label="Neutral">
              <IconButton aria-label="Impostazioni" variant="ghost"><IconSettings aria-hidden="true" /></IconButton>
            </IconActionLabel>
            <IconActionLabel label="Close">
              <CloseButton aria-label="Chiudi pannello di esempio" />
            </IconActionLabel>
            <IconActionLabel label="Copy">
              <CopyButton aria-label="Copia identificativo" value="QVX-ACTIONS" />
            </IconActionLabel>
          </div>
          <span className="sr-only" data-icon-button-activation-count>{activationCount}</span>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Il root cresce a 44 px con pointer coarse; surface e glyph restano compatti. La griglia riserva una cella reale per ogni target, quindi non esistono overlay invisibili."
        region="responsive"
        title="Geometria target"
      >
        <Specimen visualId="sirio-icon-button-targets">
          <div className="grid w-fit grid-cols-4 place-items-center gap-1 rounded-[var(--radius)] border border-border p-2" data-icon-button-target-grid>
            {["Aggiungi", "Opzioni", "Scarica", "Impostazioni"].map((label, index) => {
              const Glyph = [IconPlus, IconChevronDown, IconDownload, IconSettings][index]!;
              return (
                <IconButton aria-label={label} key={label} size="xs" variant="ghost">
                  <Glyph aria-hidden="true" />
                </IconButton>
              );
            })}
          </div>
        </Specimen>
      </SpecimenSection>

    </div>
  );
}

function IconActionLabel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
