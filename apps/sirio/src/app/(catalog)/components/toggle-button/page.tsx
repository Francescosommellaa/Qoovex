"use client"

import { IconPin, IconPinFilled } from "@tabler/icons-react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import { ToggleButton } from "@qoovex/ui/components/toggle-button"

const offContent = (
  <>
    <IconPin aria-hidden="true" />
    Fissa elemento
  </>
)

const onContent = (
  <>
    <IconPinFilled aria-hidden="true" />
    Elemento fissato
  </>
)

export default function ToggleButtonPage() {
  const [livePressed, setLivePressed] = useState(false)
  const [parentPressed, setParentPressed] = useState(false)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <PageHeader
        description="Button a due stati persistenti: copy, icon e surface cambiano insieme senza confondere lo stato con il contatto fisico."
        importPath="import { ToggleButton } from '@qoovex/ui/components/toggle-button'"
        title="ToggleButton"
      />

      <SpecimenSection
        description="OFF e ON usano copy accessibile coerente con lo stato reale. Usa Tab per verificare focus + pressed simultanei."
        region="persistent-states"
        title="OFF / ON reali"
      >
        <SpecimenGrid cols={2}>
          <Specimen stateId="unpressed" title="OFF">
            <ToggleButton pressedContent={onContent}>{offContent}</ToggleButton>
          </Specimen>
          <Specimen stateId="pressed" title="ON" visualId="sirio-toggle-button-pressed">
            <ToggleButton defaultPressed pressedContent={onContent}>{offContent}</ToggleButton>
          </Specimen>
        </SpecimenGrid>

        <Specimen title="Transition e geometria stabili" visualId="sirio-toggle-button-targets">
          <div className="grid w-full max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-4" data-toggle-button-geometry-row>
            <span className="justify-self-end text-sm text-muted-foreground" data-toggle-button-sibling="before">Prima</span>
            <ToggleButton
              data-toggle-button-proof="stateful-copy"
              onPressedChange={setLivePressed}
              pressed={livePressed}
              pressedContent={onContent}
            >
              {offContent}
            </ToggleButton>
            <span className="justify-self-start text-sm text-muted-foreground" data-toggle-button-sibling="after">Dopo</span>
          </div>
        </Specimen>
      </SpecimenSection>

      <SpecimenSection
        description="Il parent aggiorna pressed; il ToggleButton anima icon, copy e surface senza simulare un physical press."
        region="high-risk-combinations"
        title="Controlled parent update"
      >
        <Specimen title="Aggiornamento esterno pulito">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ToggleButton
              data-toggle-button-proof="controlled"
              onPressedChange={setParentPressed}
              pressed={parentPressed}
              pressedContent={onContent}
            >
              {offContent}
            </ToggleButton>
            <Button
              data-toggle-button-parent-control
              onClick={() => setParentPressed((current) => !current)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Imposta dal parent
            </Button>
          </div>
        </Specimen>
      </SpecimenSection>
    </div>
  )
}
