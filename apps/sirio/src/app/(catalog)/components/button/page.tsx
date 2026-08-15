"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Button } from "@qoovex/ui/components/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@qoovex/ui/components/tooltip";
import {
  IconArrowRight,
  IconPlus,
  IconDownload,
  IconCheck,
  IconCopy,
  IconStar,
  IconStarFilled,
  IconChevronDown,
  IconBell,
  IconTrash,
  IconBookmark,
  IconShare,
} from "@tabler/icons-react";

export default function ButtonPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Button"
        description="Pulsanti d'azione con feedback tattile elastico (active:scale-97), pulsanti icona dinamici interattivi e supporto al caricamento nativo."
        importPath="import { Button } from '@qoovex/ui/components/button'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Pulsanti Icona Dinamici ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Pulsanti Icona Dinamici & Interattivi</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Copy to Clipboard (Feedback di Conferma)">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon"
                        variant={copied ? "outline" : "secondary"}
                        onClick={handleCopy}
                        aria-label={copied ? "Codice copiato" : "Copia codice"}
                        className={copied ? "border-success text-success" : ""}
                      />
                    }
                  >
                    {copied ? <IconCheck aria-hidden="true" className="size-4 animate-in zoom-in-50" /> : <IconCopy aria-hidden="true" className="size-4" />}
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? "Copiato negli appunti!" : "Copia codice cantiere"}
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground font-accent">JOB-SITE #8942-2026</span>
              </div>
            </Specimen>

            <Specimen title="Preferiti / Star (Stato Toggle)">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setStarred(!starred)}
                  aria-label={starred ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                  aria-pressed={starred}
                  className={starred ? "text-warning-emphasis border-warning/40 bg-warning/10" : ""}
                >
                  {starred ? (
                    <IconStarFilled aria-hidden="true" className="size-4 animate-in zoom-in-75 text-warning-emphasis" />
                  ) : (
                    <IconStar aria-hidden="true" className="size-4" />
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {starred ? "Cantiere nei preferiti" : "Aggiungi a preferiti"}
                </span>
              </div>
            </Specimen>

            <Specimen title="Expand / Collapse (Rotazione Chevron)">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setExpanded(!expanded)}
                  aria-expanded={expanded}
                  aria-label={expanded ? "Riduci dettagli" : "Espandi dettagli"}
                >
                  <IconChevronDown
                    aria-hidden="true"
                    className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180 text-primary" : ""}`}
                  />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {expanded ? "Pannello dettagli espanso" : "Espandi pannello"}
                </span>
              </div>
            </Specimen>

            <Specimen title="Notifiche con Badge Sovrapposto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button size="icon" variant="outline" aria-label="Apri notifiche cantiere, 3 non lette">
                    <IconBell aria-hidden="true" className="size-4" />
                  </Button>
                  <span aria-hidden="true" className="absolute top-1 right-1 size-2 rounded-full bg-destructive ring-2 ring-background" />
                </div>
                <span className="text-xs text-muted-foreground">3 nuove notifiche</span>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Scala Dimensioni Icon-Buttons ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Taglie Pulsanti Icona (XS, SM, Default, LG)</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Pulsanti Icona nelle Taglie XS, SM, Default e LG">
              <div className="flex flex-wrap items-center gap-4 py-2">
                <Button size="icon-xs" variant="outline" aria-label="Condividi XS">
                  <IconShare />
                </Button>
                <Button size="icon-sm" variant="outline" aria-label="Condividi SM">
                  <IconShare />
                </Button>
                <Button size="icon" variant="outline" aria-label="Condividi Default">
                  <IconShare />
                </Button>
                <Button size="icon-lg" variant="outline" aria-label="Condividi LG">
                  <IconShare />
                </Button>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 3: Varianti Semantiche & Distinzione Link vs Ghost ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti & Distinzione Ghost vs Link</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default (Primario)" visualId="button-default">
              <Button>Pulsante primario</Button>
            </Specimen>

            <Specimen title="Secondary" visualId="button-focus">
              <Button variant="secondary">Pulsante secondario</Button>
            </Specimen>

            <Specimen title="Outline">
              <Button variant="outline">Pulsante outline</Button>
            </Specimen>

            <Specimen title="Ghost (Sfondo al passaggio)">
              <Button variant="ghost">Pulsante ghost</Button>
            </Specimen>

            <Specimen title="Link (Testo inline con sottolineatura)">
              <Button variant="link">Pulsante link inline</Button>
            </Specimen>

            <Specimen title="Destructive">
              <Button variant="destructive">Pulsante distruttivo</Button>
            </Specimen>

            <Specimen title="Disabled" visualId="button-disabled">
              <Button disabled>Operazione non disponibile</Button>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 4: Micro-Interazioni e Loading ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Micro-Interazioni Icone & Loading Nativo</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Icona di Coda (Shift destrorso in hover)">
              <Button>
                <span>Avanti al Cantiere</span>
                <IconArrowRight />
              </Button>
            </Specimen>

            <Specimen title="Stato Loading Nativo Interattivo">
              <Button
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
              >
                {isLoading ? "Invio in corso..." : "Clicca per inviare (2s)"}
              </Button>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
