"use client"

import { useState } from "react"
import { IconArrowRight, IconChevronDown, IconPlus } from "@tabler/icons-react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid, SpecimenSection } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"

export default function ButtonPage() {
  const [activationCount, setActivationCount] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [keyboardCount, setKeyboardCount] = useState(0)
  const [linkActionVisible, setLinkActionVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  function startLoading() {
    setSubmitCount((count) => count + 1)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 900)
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Button"
        description="Command Button Base UI con feedback Motion interrompibile, focus immediato e loading stabile. Navigazione, icon-only, toggle, close e copy mantengono responsabilità separate."
        importPath="import { Button } from '@qoovex/ui/components/button'"
      />

      <div className="flex flex-col gap-12">
        <SpecimenSection
          region="overview"
          title="Overview"
          description="Il Button avvia un’azione. Enter e Space restano nativi; Motion governa soltanto il feedback visuale del contenuto senza spostare hit area o layout."
        >
          <Specimen title="Azione primaria">
            <Button type="button">
              <IconPlus aria-hidden="true" data-icon="inline-start" />
              Nuovo cantiere
            </Button>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection region="variants" title="Varianti pubbliche">
          <SpecimenGrid cols={3}>
            <Specimen title="Default" stateId="default" visualId="button-default">
              <Button
                data-button-proof="rapid"
                onClick={() => setActivationCount((count) => count + 1)}
                type="button"
              >
                Crea cantiere
              </Button>
            </Specimen>
            <Specimen title="Secondary" visualId="button-focus">
              <Button type="button" variant="secondary">Salva bozza</Button>
            </Specimen>
            <Specimen title="Outline">
              <Button type="button" variant="outline">Esporta riepilogo</Button>
            </Specimen>
            <Specimen title="Ghost">
              <Button type="button" variant="ghost">Altre azioni</Button>
            </Specimen>
            <Specimen title="Destructive">
              <Button type="button" variant="destructive">Elimina bozza</Button>
            </Specimen>
            <Specimen title="Link · azione, non navigazione">
              <div className="flex flex-col items-start gap-2">
                <Button
                  onClick={() => setLinkActionVisible((visible) => !visible)}
                  type="button"
                  variant="link"
                >
                  {linkActionVisible ? "Nascondi criteri" : "Mostra criteri"}
                </Button>
                <span aria-live="polite" className="text-xs text-muted-foreground">
                  {linkActionVisible ? "Criteri mostrati." : "Criteri nascosti."}
                </span>
              </div>
            </Specimen>
          </SpecimenGrid>
          <p className="mt-4 text-sm text-muted-foreground">
            Attivazioni rapide: <output data-button-activation-count>{activationCount}</output>
          </p>
        </SpecimenSection>

        <SpecimenSection
          region="sizes"
          title="Size testuali"
          description="Le size icon-only restano pubbliche per compatibilità, ma la loro proof specialistica appartiene a P011."
        >
          <Specimen title="XS, SM, default e LG">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs" type="button">Compatto XS</Button>
              <Button size="sm" type="button">Compatto SM</Button>
              <Button type="button">Misura standard</Button>
              <Button size="lg" type="button">Azione ampia</Button>
            </div>
          </Specimen>
        </SpecimenSection>

        <SpecimenSection region="persistent-states" title="Availability e stato persistente">
          <SpecimenGrid cols={3}>
            <Specimen title="Disabled" stateId="disabled" visualId="button-disabled">
              <Button disabled type="button">Operazione non disponibile</Button>
            </Specimen>
            <Specimen title="Loading deterministico" stateId="loading">
              <Button loading type="button">Invia richiesta</Button>
            </Specimen>
            <Specimen title="Expanded trigger" stateId={expanded ? "open" : "closed"}>
              <div className="flex flex-col items-start gap-3">
                <Button
                  aria-controls="button-disclosure-panel"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((open) => !open)}
                  type="button"
                  variant="outline"
                >
                  Dettagli operazione
                  <IconChevronDown
                    aria-hidden="true"
                    data-icon="inline-end"
                    className={expanded ? "rotate-180" : undefined}
                  />
                </Button>
                <div
                  id="button-disclosure-panel"
                  hidden={!expanded}
                  className="text-sm text-muted-foreground"
                >
                  Il riepilogo resta nello stesso contesto.
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection region="content-stress" title="Icone e contenuto sotto stress">
          <SpecimenGrid cols={3}>
            <Specimen title="Leading icon">
              <Button type="button" variant="secondary">
                <IconPlus aria-hidden="true" data-icon="inline-start" />
                Aggiungi fase
              </Button>
            </Specimen>
            <Specimen title="Trailing icon">
              <Button type="button" variant="outline">
                Continua
                <IconArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            </Specimen>
            <Specimen title="Label lunga · wrap intenzionale">
              <div className="w-full max-w-56">
                <Button className="w-full" type="button">
                  Conferma e invia il riepilogo completo del cantiere
                </Button>
              </div>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection
          region="motion-final"
          title="Stati finali deterministici"
          description="Geometry e snapshot giudicano rest, disabled, loading e open settled; non sostituiscono la verifica del lifecycle Motion."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button">Rest</Button>
            <Button disabled type="button" variant="secondary">Disabled</Button>
            <Button loading type="button" variant="outline">Loading</Button>
            <Button aria-expanded="true" type="button" variant="ghost">Open</Button>
          </div>
        </SpecimenSection>

        <SpecimenSection
          region="motion-lifecycle"
          title="Lifecycle reale"
          description="Usa mouse, touch o tastiera: hover → press → release/cancel → settled. Input rapido retargetta dalla trasformazione corrente; reduced motion conserva feedback cromatico immediato."
        >
          <SpecimenGrid cols={2}>
            <Specimen title="Loading · focus e doppia attivazione">
              <div className="flex flex-col items-start gap-2">
                <Button
                  data-button-proof="loading-lifecycle"
                  loading={loading}
                  onClick={startLoading}
                  type="button"
                >
                  Invia richiesta
                </Button>
                <span className="text-xs text-muted-foreground">
                  Invii: <output data-button-submit-count>{submitCount}</output>
                </span>
              </div>
            </Specimen>
            <Specimen title="Keyboard · Enter e Space">
              <div className="flex flex-col items-start gap-2">
                <Button
                  data-button-proof="keyboard"
                  onClick={() => setKeyboardCount((count) => count + 1)}
                  type="button"
                  variant="secondary"
                >
                  Verifica attivazione
                </Button>
                <span className="text-xs text-muted-foreground">
                  Attivazioni: <output data-button-keyboard-count>{keyboardCount}</output>
                </span>
              </div>
            </Specimen>
          </SpecimenGrid>
        </SpecimenSection>

        <SpecimenSection
          region="responsive"
          title="320px, reflow e coarse pointer"
          description="Lo stesso Button mantiene semantica e feature availability. Il testo può andare a capo; la size visuale compatta resta distinta dal target effettivo coarse da 44px."
        >
          <div className="max-w-64 rounded-xl border border-border bg-card p-3">
            <Button className="w-full" type="button" variant="outline">
              Conferma la revisione e torna al riepilogo precedente
            </Button>
          </div>
        </SpecimenSection>
      </div>
    </div>
  )
}
