"use client"

import { IconDownload, IconPin, IconPinFilled, IconPlus, IconReload, IconSettings, IconTrash } from "@tabler/icons-react"
import { type ReactNode, useEffect, useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import { CopyButton } from "@qoovex/ui/components/copy-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@qoovex/ui/components/dialog"
import { IconAction } from "@qoovex/ui/components/icon-action"
import { IconButton } from "@qoovex/ui/components/icon-button"
import { ToggleButton } from "@qoovex/ui/components/toggle-button"

const variants = [
  ["default", "Aggiungi elemento", IconPlus],
  ["secondary", "Apri opzioni", IconSettings],
  ["outline", "Scarica allegato", IconDownload],
  ["ghost", "Apri impostazioni", IconSettings],
  ["destructive", "Elimina elemento", IconTrash],
] as const

const identifier = "QVX-P014-7F3A"

export default function IconButtonPage() {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activationCount, setActivationCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [clearValue, setClearValue] = useState("QVX-204")
  const [count, setCount] = useState(4)

  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => setLoading(false), 1400)
    return () => window.clearTimeout(timer)
  }, [loading])

  return (
    <div className="mx-auto w-full max-w-5xl space-y-14">
      <PageHeader
        description="Un solo linguaggio icon-only: il controllo possiede interazione e accessibilità; il glyph comunica direzione, stato o lifecycle. Punta, premi e attiva ogni esempio."
        importPath="import { IconButton } from '@qoovex/ui/components/icon-button'"
        title="IconButton"
      />

      <SpecimenSection
        description="Le varianti condividono hitbox, focus e geometria. Le tre misure cambiano soltanto il volume visuale."
        region="variants"
        title="Materiale e misura"
      >
        <Specimen visualId="sirio-icon-button-variants">
          <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-6">
            {variants.map(([variant, label, Glyph]) => (
              <ActionLabel key={variant} label={variant}>
                <IconButton aria-label={label} data-icon-action-proof={variant === "ghost" ? "neutral" : undefined} variant={variant}>
                  {variant === "outline" ? <IconAction intent="download" /> : <IconAction icon={Glyph} intent="neutral" />}
                </IconButton>
              </ActionLabel>
            ))}
            <span aria-hidden="true" className="mx-1 h-8 w-px bg-border" />
            {(["xs", "sm", "default"] as const).map((size) => (
              <ActionLabel key={size} label={size}>
                <IconButton aria-label={`Aggiungi, dimensione ${size}`} size={size} variant="outline">
                  <IconAction intent="increment" />
                </IconButton>
              </ActionLabel>
            ))}
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Le quattro frecce comunicano una direzione: la surface si lascia spingere dal glyph senza muovere hitbox o sibling."
        region="motion-lifecycle"
        title="Direzione"
      >
        <Specimen visualId="sirio-icon-action-directional">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <IconButton aria-label="Torna indietro" data-icon-action-proof="back" variant="outline"><IconAction intent="back" /></IconButton>
            <IconButton aria-label="Vai avanti" data-icon-action-proof="forward" data-icon-button-proof="rapid" onClick={() => setActivationCount((value) => value + 1)} variant="outline"><IconAction intent="forward" /></IconButton>
            <IconButton aria-label="Sposta sopra" data-icon-action-proof="up" variant="outline"><IconAction intent="up" /></IconButton>
            <IconButton aria-label="Sposta sotto" data-icon-action-proof="down" variant="outline"><IconAction intent="down" /></IconButton>
          </div>
          <span className="sr-only" data-icon-button-activation-count>{activationCount}</span>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Lo stato cambia nello stesso slot. Il salvataggio simula una breve operazione: lo spinner prende il posto dell’icona e il comando torna disponibile al termine."
        region="persistent-states"
        title="Stato e comando"
      >
        <Specimen visualId="sirio-toggle-button-icon-only">
          <div className="flex w-full max-w-2xl flex-col items-center gap-6">
            <div className="grid w-full grid-cols-2 items-start gap-x-5 gap-y-6 sm:grid-cols-5" data-toggle-button-geometry-row>
              <ActionLabel label={menuOpen ? "Menu aperto" : "Menu chiuso"} outputId="menu">
                <IconButton aria-expanded={menuOpen} aria-label={menuOpen ? "Chiudi menu" : "Apri menu"} data-icon-action-proof="menu" onClick={() => setMenuOpen((current) => !current)} variant="outline">
                  <IconAction intent="menu" state={menuOpen ? "open" : "closed"} />
                </IconButton>
              </ActionLabel>
              <ActionLabel label={expanded ? "Aperto" : "Chiuso"} outputId="disclosure">
                <IconButton aria-expanded={expanded} aria-label={expanded ? "Nascondi dettagli" : "Mostra dettagli"} data-icon-action-proof="disclosure" onClick={() => setExpanded((current) => !current)} variant="outline">
                  <IconAction intent="disclosure" state={expanded ? "open" : "closed"} />
                </IconButton>
              </ActionLabel>
              <ActionLabel label={visible ? "Visibile" : "Nascosto"} outputId="visibility">
                <IconButton aria-label={visible ? "Nascondi valore" : "Mostra valore"} data-icon-action-proof="visibility" onClick={() => setVisible((current) => !current)} variant="outline">
                  <IconAction intent="visibility" state={visible ? "visible" : "hidden"} />
                </IconButton>
              </ActionLabel>
              <ActionLabel label={pinned ? "Fissato" : "Non fissato"}>
                <ToggleButton aria-label={pinned ? "Rimuovi fissaggio" : "Fissa elemento"} data-toggle-button-proof="icon-only" onPressedChange={setPinned} pressed={pinned} pressedContent={<IconAction icon={IconPinFilled} intent="neutral" />} size="icon">
                  <IconAction icon={IconPin} intent="neutral" />
                </ToggleButton>
              </ActionLabel>
              <ActionLabel label={loading ? "Salvataggio in corso" : "Salvataggio"} outputId="save">
                <IconButton aria-label={loading ? "Salvataggio in corso" : "Salva"} data-icon-action-proof="download" data-icon-button-proof="loading" loading={loading} onClick={() => setLoading(true)} variant="outline">
                  <IconAction intent="download" />
                </IconButton>
              </ActionLabel>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-3 border-t border-border pt-5">
              <div className="flex min-h-10 items-center gap-2 rounded-[var(--radius)] border border-border bg-background px-3">
                <span className="min-w-20 text-sm" data-icon-action-output="clear">{clearValue || "Cancellato"}</span>
                <IconButton
                  aria-label={clearValue ? "Cancella valore" : "Ripristina valore"}
                  data-icon-action-proof="clear"
                  onClick={() => setClearValue((current) => current ? "" : "QVX-204")}
                  size="xs"
                  variant="ghost"
                >
                  {clearValue ? <IconAction intent="clear" /> : <IconAction icon={IconReload} intent="neutral" />}
                </IconButton>
              </div>
              <div className="flex items-center gap-2">
                <IconButton aria-label="Riduci valore" data-icon-action-proof="decrement" onClick={() => setCount((current) => current - 1)} size="sm" variant="outline"><IconAction intent="decrement" /></IconButton>
                <output className="min-w-8 text-center font-medium tabular-nums" data-icon-action-output="count">{count}</output>
                <IconButton aria-label="Aumenta valore" data-icon-action-proof="increment" onClick={() => setCount((current) => current + 1)} size="sm" variant="outline"><IconAction intent="increment" /></IconButton>
              </div>
            </div>
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Active, caricamento permanente, Fissa e disabled. La selezione di Fissa persiste; il focus reale segue Tab e resta distinto dalla selezione."
        region="interaction-states"
        title="Lifecycle e accessibilità"
      >
        <Specimen visualId="sirio-icon-button-targets">
          <div className="flex flex-wrap items-center justify-center gap-4" data-icon-button-target-grid>
            <ActionLabel label="active"><CopyButton aria-label="Copia identificativo" data-copy-button-proof="core" value={identifier} /></ActionLabel>
            <ActionLabel label="loading"><IconButton aria-label="Caricamento in corso" data-icon-button-proof="permanent-loading" loading size="sm" variant="ghost" /></ActionLabel>
            <ActionLabel label="focus">
              <ToggleButton aria-label="Fissa esempio" data-icon-button-proof="focus" defaultPressed pressedContent={<IconAction icon={IconPinFilled} intent="neutral" />} size="icon-sm">
                <IconAction icon={IconPin} intent="neutral" />
              </ToggleButton>
            </ActionLabel>
            <ActionLabel label="disabled"><CopyButton aria-label="Copia valore non disponibile" data-copy-button-proof="disabled" disabled value="NON-DISPONIBILE" /></ActionLabel>
          </div>
        </Specimen>

        <Specimen title="Dismiss e focus restoration" visualId="sirio-close-button-core">
          <Dialog>
            <DialogTrigger render={<Button data-close-button-dialog-trigger type="button">Apri finestra</Button>} />
            <DialogContent closeButtonProps={{ "aria-label": "Chiudi finestra di prova" }} size="sm">
              <DialogHeader>
                <DialogTitle>Focus restoration</DialogTitle>
                <DialogDescription>Chiudi con la X o Escape: il focus torna al trigger reale.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Specimen>
      </SpecimenSection>
    </div>
  )
}

function ActionLabel({ children, label, outputId }: { children: ReactNode; label: ReactNode; outputId?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      {outputId ? <output className="min-h-8 text-center text-xs leading-4 text-muted-foreground" data-icon-action-output={outputId}>{label}</output> : <span className="min-h-8 text-center text-xs leading-4 text-muted-foreground">{label}</span>}
    </div>
  )
}
