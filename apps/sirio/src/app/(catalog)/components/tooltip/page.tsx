"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Tooltip, TooltipTrigger, TooltipContent } from "@qoovex/ui/components/tooltip";
import { Button } from "@qoovex/ui/components/button";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconInfoCircle,
  IconDownload,
  IconLock,
  IconShare,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";

export default function TooltipCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Tooltip"
        description="Micro-etichetta informativa visualizzata all'hover o al focus di un elemento, stilizzata con effetto glassmorphism e animazioni fluide."
        importPath="import { Tooltip, TooltipTrigger, TooltipContent } from '@qoovex/ui/components/tooltip'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Posizionamenti ─────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Posizionamenti (Placements)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Superiore & Inferiore (Top / Bottom)" visualId="tooltip-open">
              <div className="flex flex-wrap items-center gap-4">
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                    Superiore (Top)
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Etichetta in alto con freccia di posizionamento
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                    Inferiore (Bottom)
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Etichetta in basso con freccia di posizionamento
                  </TooltipContent>
                </Tooltip>
              </div>
            </Specimen>

            <Specimen title="Laterale (Left / Right)">
              <div className="flex flex-wrap items-center gap-4">
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                    Sinistra (Left)
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Informazioni a sinistra
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                    Destra (Right)
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Informazioni a destra
                  </TooltipContent>
                </Tooltip>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Varianti Trigger e Pulsanti Icona ─────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Pulsanti Icona e Trigger Interattivi</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Pulsanti Icona Inattivi / Azioni">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" aria-label="Informazioni" />}>
                    <IconInfoCircle aria-hidden="true" className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Dettagli del cantiere selezionato
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" aria-label="Download" />}>
                    <IconDownload aria-hidden="true" className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Scarica allegato in formato PDF
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" aria-label="Condividi" />}>
                    <IconShare aria-hidden="true" className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Genera link esplicito di condivisione
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={<Button variant="destructive" size="icon-sm" aria-label="Elimina" />}>
                    <IconTrash aria-hidden="true" className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Elimina definitvamente il cantiere
                  </TooltipContent>
                </Tooltip>
              </div>
            </Specimen>

            <Specimen title="Trigger su Badge e Elementi Inline">
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Badge variant="info" className="cursor-pointer gap-1" data-interactive>
                        <IconLock className="size-3" />
                        Riservato
                      </Badge>
                    }
                  />
                  <TooltipContent>
                    Visibile solo al titolare dell'azienda
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Badge variant="outline" className="cursor-pointer gap-1" data-interactive>
                        <IconPlus className="size-3" />
                        In Attesa
                      </Badge>
                    }
                  />
                  <TooltipContent>
                    Richiede la conferma del cliente
                  </TooltipContent>
                </Tooltip>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Contenuto Ricco e Icone Integrati ───────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Contenuti Integrati e Info Dettagliate</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Tooltip con Icona e Testo">
              <Tooltip>
                <TooltipTrigger render={<Button variant="secondary" size="sm" />}>
                  Informazioni sullo spazio
                </TooltipTrigger>
                <TooltipContent className="gap-2">
                  <IconLock className="size-3.5 text-primary" />
                  <span>Dettagli disponibili nel contesto</span>
                </TooltipContent>
              </Tooltip>
            </Specimen>

            <Specimen title="Tooltip Dettagliato con Descrizione">
              <Tooltip>
                <TooltipTrigger render={<Button variant="default" size="sm" />}>
                  Archiviazione ZIP
                </TooltipTrigger>
                <TooltipContent side="top">
                  Genera pacchetto scaricabile con firma digitale
                </TooltipContent>
              </Tooltip>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
