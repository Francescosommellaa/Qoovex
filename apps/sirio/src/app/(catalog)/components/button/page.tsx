"use client"

import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import { IconAction } from "@qoovex/ui/components/icon-action"

const variants = [
  { action: "Crea cantiere", label: "Default", variant: "default" },
  { action: "Salva bozza", label: "Secondary", variant: "secondary" },
  { action: "Esporta riepilogo", label: "Outline", variant: "outline" },
  { action: "Altre azioni", label: "Ghost", variant: "ghost" },
  { action: "Elimina bozza", label: "Destructive", variant: "destructive" },
] as const

export default function ButtonPage() {
  const [activationCount, setActivationCount] = useState(0)
  const [keyboardCount, setKeyboardCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  function startLoading() {
    if (loading) return
    setSubmitCount((count) => count + 1)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1400)
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        description="Command Button Base UI con surface opache, focus immediato e feedback Motion interrompibile."
        importPath="import { Button } from '@qoovex/ui/components/button'"
        title="Button"
      />

      <div className="mt-12 space-y-12">
        <SpecimenSection
          description="Le cinque variant condividono geometria e materialità, mantenendo gerarchia e semantica proprie."
          region="variants"
          title="Core variants"
        >
          <div className="divide-y divide-border border-y border-border">
            <div className="divide-y divide-border" data-specimen-state="default" data-visual-specimen="button-default">
              {variants.map(({ action, label, variant }) => (
                <div className="grid gap-3 py-5 sm:grid-cols-[10rem_1fr] sm:items-center" data-button-variant-row={variant} key={variant}>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Button
                    className="justify-self-start"
                    data-button-proof={variant === "default" ? "rapid" : undefined}
                    onClick={() => setActivationCount((count) => count + 1)}
                    type="button"
                    variant={variant}
                  >
                    {action}
                    {variant === "default" ? <IconAction data-icon="inline-end" icon={IconPlus} intent="neutral" /> : null}
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[10rem_1fr] sm:items-center" data-specimen-state="disabled" data-visual-specimen="button-disabled">
              <span className="text-sm text-muted-foreground">Disabled</span>
              <Button className="justify-self-start" disabled type="button">Operazione non disponibile</Button>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[10rem_1fr] sm:items-center">
              <span className="text-sm text-muted-foreground">Dimensioni</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" type="button">Compatto XS</Button>
                <Button size="sm" type="button">Compatto SM</Button>
                <Button type="button">Misura standard</Button>
                <Button size="lg" type="button">Azione ampia</Button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            Attivazioni: <output data-button-activation-count>{activationCount}</output>
          </p>
        </SpecimenSection>

        <SpecimenSection
          description="Usa Tab e Shift+Tab: l’outline P003 appartiene al vero root interattivo e non viene trasformato dalla surface Motion."
          region="interaction-states"
          title="Keyboard focus"
        >
          <Specimen stateId="focus-visible" title="Usa Tab per verificarlo" visualId="button-focus">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button data-button-proof="keyboard" onClick={() => setKeyboardCount((count) => count + 1)} type="button">
                Primaria
              </Button>
              <Button type="button" variant="secondary">Secondaria</Button>
              <Button type="button" variant="outline">Outline</Button>
              <Button type="button" variant="ghost">Ghost</Button>
              <Button type="button" variant="destructive">Distruttiva</Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Attivazioni da tastiera: <output data-button-keyboard-count>{keyboardCount}</output>
            </span>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection
          description="Click avvia davvero il pending. Label e loader condividono la stessa cella; il contenuto originale resta geometry owner."
          region="motion-lifecycle"
          title="Interactive loading"
        >
          <Specimen title="Nessun movimento del Button o dei sibling">
            <div className="w-full max-w-xl">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4" data-button-loading-row>
                <span className="justify-self-end text-sm text-muted-foreground" data-button-loading-sibling="before">Prima</span>
                <Button
                  data-button-proof="loading-lifecycle"
                  loading={loading}
                  onClick={startLoading}
                  type="button"
                >
                  Invia richiesta
                </Button>
                <span className="justify-self-start text-sm text-muted-foreground" data-button-loading-sibling="after">Dopo</span>
              </div>
              <p className="mt-3 min-h-5 text-center text-xs text-muted-foreground">
                Stato: <output data-button-loading-state>{loading ? "invio in corso" : "pronto"}</output>
                {" · "}Invii: <output data-button-submit-count>{submitCount}</output>
              </p>
            </div>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection
          description="La freccia spinge delicatamente la superficie. Indietro precede il testo; avanti lo segue."
          region="motion-lifecycle"
          title="Directional icon"
        >
          <Specimen title="Indietro e avanti">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Button type="button" variant="outline">
                <IconAction data-icon="inline-start" intent="back" />
                Indietro
              </Button>
              <Button type="button" variant="outline">
              Continua
              <IconAction data-icon="inline-end" intent="forward" />
              </Button>
            </div>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection
          description="Avvicina il mouse ai lati della CTA: superficie e contenuto seguono leggermente il puntatore. Il target resta fermo; touch e reduced motion non usano magnetismo."
          region="motion-lifecycle"
          title="Magnetic CTA"
        >
          <Specimen title="Normal primary vs magnetic primary">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button type="button">Primary normale</Button>
              <Button data-cursor-magnetic="true" data-magnetic-cta-proof type="button">
                CTA magnetica
                <IconAction data-icon="inline-end" icon={IconPlus} intent="neutral" />
              </Button>
            </div>
          </Specimen>
        </SpecimenSection>
      </div>
    </div>
  )
}
