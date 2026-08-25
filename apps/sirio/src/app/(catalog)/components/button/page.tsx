"use client"

import { IconArrowRight, IconPlus } from "@tabler/icons-react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"

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
          <Specimen stateId="default" title="Variant interattive" visualId="button-default">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {variants.map(({ action, label, variant }) => (
                <div className="flex flex-col items-center gap-2" data-button-variant-row={variant} key={variant}>
                  <Button
                    data-button-proof={variant === "default" ? "rapid" : undefined}
                    onClick={() => setActivationCount((count) => count + 1)}
                    type="button"
                    variant={variant}
                  >
                    {variant === "default" ? <IconPlus aria-hidden="true" data-icon="inline-start" /> : null}
                    {action}
                  </Button>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Attivazioni: <output data-button-activation-count>{activationCount}</output>
            </span>
          </Specimen>
          <SpecimenGrid cols={2}>
            <Specimen stateId="disabled" title="Disabled" visualId="button-disabled">
              <Button disabled type="button">Operazione non disponibile</Button>
            </Specimen>
            <Specimen title="Size pubbliche">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="xs" type="button">Compatto XS</Button>
                <Button size="sm" type="button">Compatto SM</Button>
                <Button type="button">Misura standard</Button>
                <Button size="lg" type="button">Azione ampia</Button>
              </div>
            </Specimen>
          </SpecimenGrid>
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
          description="La freccia anticipa la direzione con la stessa spring della Action surface; press, cancel ed exit retargettano dalla posizione corrente."
          region="motion-lifecycle"
          title="Directional icon"
        >
          <Specimen title="Continua">
            <Button iconMotion="directional-right" type="button" variant="outline">
              Continua
              <IconArrowRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection
          description="Il magnetismo è un enhancement ambientale esplicito: confronta il primary normale con la CTA opt-in."
          region="motion-lifecycle"
          title="Magnetic CTA"
        >
          <Specimen title="Normal primary vs magnetic primary">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button type="button">Primary normale</Button>
              <Button data-cursor-magnetic="true" data-magnetic-cta-proof type="button">
                CTA magnetica
                <IconPlus aria-hidden="true" data-icon="inline-end" />
              </Button>
            </div>
          </Specimen>
        </SpecimenSection>
      </div>
    </div>
  )
}
