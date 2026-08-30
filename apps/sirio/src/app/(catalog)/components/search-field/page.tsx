"use client"

import * as React from "react"
import {
  IconBuilding,
  IconFileText,
  IconPhoto,
  type Icon,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/page-header"
import { Specimen, SpecimenGrid } from "@/components/specimen"
import { Button } from "@qoovex/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog"
import { Field, FieldDescription } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { SearchField, SearchResults } from "@qoovex/ui/components/search-field"
import {
  SlidingIndicatorContainer,
  useSlidingIndicator,
} from "@qoovex/ui/components/sliding-indicator"

const sampleResults = [
  { title: "Ristrutturazione Via Roma 42", meta: "Cantiere · Roma", icon: IconBuilding },
  { title: "Preventivo aggiornato", meta: "Documento · 12 agosto", icon: IconFileText },
  { title: "Riqualificazione Parco Sud", meta: "Cantiere · Milano", icon: IconBuilding },
  { title: "Foto sopralluogo", meta: "Allegato · 8 immagini", icon: IconPhoto },
]

type SampleResult = {
  title: string
  meta: string
  icon: Icon
}

function SearchResultOption({
  result,
  onSelect,
}: {
  result: SampleResult
  onSelect: () => void
}) {
  const indicator = useSlidingIndicator()
  const ResultIcon = result.icon

  return (
    <div role="listitem">
      <button
        className="group/search-result relative z-10 flex min-h-12 w-full items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-2.5 text-left outline-none transition-[border-color,color] duration-150 ease-out hover:border-border/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        onClick={onSelect}
        onFocus={(event) => indicator?.moveIndicator(event.currentTarget)}
        onMouseEnter={(event) => indicator?.moveIndicator(event.currentTarget)}
        type="button"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground transition-colors duration-150 group-hover/search-result:bg-primary group-hover/search-result:text-primary-foreground group-focus-visible/search-result:bg-primary group-focus-visible/search-result:text-primary-foreground motion-reduce:transition-none">
          <ResultIcon aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{result.title}</span>
          <span className="block text-xs text-muted-foreground">{result.meta}</span>
        </span>
      </button>
    </div>
  )
}

function SearchResultList({
  ariaLabel,
  results,
  onSelect,
}: {
  ariaLabel: string
  results: SampleResult[]
  onSelect: (result: SampleResult) => void
}) {
  return (
    <SlidingIndicatorContainer
      aria-label={ariaLabel}
      className="flex flex-col gap-1"
      role="list"
      rounded="lg"
    >
      {results.map((result) => (
        <SearchResultOption
          key={result.title}
          onSelect={() => onSelect(result)}
          result={result}
        />
      ))}
    </SlidingIndicatorContainer>
  )
}

function filterResults(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("it")
  if (!normalizedQuery) return []
  return sampleResults.filter(({ title, meta }) =>
    `${title} ${meta}`.toLocaleLowerCase("it").includes(normalizedQuery)
  )
}

export default function SearchFieldCatalogPage() {
  const [query, setQuery] = React.useState("ri")
  const [noResultQuery, setNoResultQuery] = React.useState("permesso inesistente")
  const [modalQuery, setModalQuery] = React.useState("ri")
  const [selectedResult, setSelectedResult] = React.useState<string | null>(null)
  const [modalSelection, setModalSelection] = React.useState<string | null>(null)
  const queryRef = React.useRef<HTMLInputElement>(null)
  const noResultRef = React.useRef<HTMLInputElement>(null)
  const modalRef = React.useRef<HTMLInputElement>(null)

  const filteredResults = React.useMemo(() => filterResults(query), [query])
  const modalResults = React.useMemo(() => filterResults(modalQuery), [modalQuery])
  const noResultResults = React.useMemo(() => filterResults(noResultQuery), [noResultQuery])

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Search Field"
        description="Input di ricerca con lente decorativa, clear reale e continuità del focus. Query e risultati restano responsabilità del consumer."
        importPath="import { SearchField } from '@qoovex/ui/components/search-field'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Ricerca inline</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Vuota">
              <Field className="w-full">
                <Label htmlFor="search-empty">Cerca nel catalogo</Label>
                <SearchField
                  data-search-proof="empty"
                  id="search-empty"
                  placeholder="Componenti, pattern o fondazioni…"
                />
                <FieldDescription>Nessun risultato viene simulato finché la query è vuota.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Typing, risultati e clear">
              <div className="grid w-full gap-3">
                <Field>
                  <Label htmlFor="search-controlled">Trova una risorsa</Label>
                  <SearchField
                    data-search-proof="controlled"
                    id="search-controlled"
                    ref={queryRef}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cerca per nome o tipo…"
                    value={query}
                  />
                </Field>

                {query.trim() ? (
                  <p className="text-sm text-muted-foreground" data-search-proof="controlled-status" role={filteredResults.length ? "status" : undefined}>
                    {filteredResults.length ? (filteredResults.length === 1 ? "1 risultato" : `${filteredResults.length} risultati`) : "Risultati della ricerca"}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground" data-search-proof="controlled-status">Inizia a digitare per filtrare le risorse.</p>
                )}

                <SearchResults
                  empty={Boolean(query.trim()) && filteredResults.length === 0}
                  onReset={() => { setQuery(""); queryRef.current?.focus() }}
                >
                {filteredResults.length > 0 ? (
                  <SearchResultList
                    ariaLabel="Risultati di esempio"
                    onSelect={(result) => setSelectedResult(result.title)}
                    results={filteredResults}
                  />
                ) : null}
                </SearchResults>
                {selectedResult ? <p className="text-sm text-foreground">Selezionato: {selectedResult}</p> : null}
              </div>
            </Specimen>

            <Specimen title="Sola lettura, senza clear">
              <Field className="w-full">
                <Label htmlFor="search-readonly">Filtro applicato</Label>
                <SearchField
                  data-search-proof="readonly"
                  defaultValue="Documenti approvati"
                  id="search-readonly"
                  readOnly
                />
                <FieldDescription>Il valore resta selezionabile ma non cancellabile.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Disabilitata, senza clear">
              <Field className="w-full" data-disabled>
                <Label htmlFor="search-disabled">Ricerca non disponibile</Label>
                <SearchField
                  data-search-proof="disabled"
                  defaultValue="Archivio remoto"
                  disabled
                  id="search-disabled"
                />
                <FieldDescription>Input e azione clear sono entrambi inattivi.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Clear disattivato intenzionalmente">
              <Field className="w-full">
                <Label htmlFor="search-not-clearable">Filtro persistente</Label>
                <SearchField
                  clearable={false}
                  data-search-proof="not-clearable"
                  defaultValue="Cantieri attivi"
                  id="search-not-clearable"
                />
                <FieldDescription>Il consumer può mantenere editabile il campo senza offrire la X.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Nessun risultato</h2>
          <Specimen title="Cambia termine o ricomincia">
            <div className="grid w-full max-w-xl gap-4">
              <SearchField
                aria-label="Ricerca senza risultati"
                data-search-proof="escape"
                ref={noResultRef}
                onChange={(event) => setNoResultQuery(event.target.value)}
                value={noResultQuery}
              />
              <SearchResults
                empty={Boolean(noResultQuery.trim()) && noResultResults.length === 0}
                onReset={() => { setNoResultQuery(""); noResultRef.current?.focus() }}
              >
              {noResultResults.length > 0 ? (
                <SearchResultList ariaLabel="Risultati della nuova ricerca" results={noResultResults} onSelect={(result) => setNoResultQuery(result.title)} />
              ) : (
                <p className="text-sm text-muted-foreground">Scrivi un termine per iniziare la ricerca.</p>
              )}
              </SearchResults>
            </div>
          </Specimen>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dentro una modal reale</h2>
          <Specimen title="Selector con focus gestito dal Dialog">
            <Dialog>
              <DialogTrigger render={<Button type="button">Apri ricerca risorse</Button>} />
              <DialogContent closeButtonProps={{ "aria-label": "Chiudi ricerca risorse" }} size="sm">
                <DialogHeader>
                  <DialogTitle>Seleziona una risorsa</DialogTitle>
                  <DialogDescription>Cerca tra cantieri, documenti e allegati disponibili.</DialogDescription>
                </DialogHeader>
                <SearchField
                  autoFocus
                  aria-label="Cerca risorse"
                  data-search-proof="uncontrolled"
                  defaultValue="ri"
                  ref={modalRef}
                  onInput={(event) => setModalQuery(event.currentTarget.value)}
                  placeholder="Cerca risorse…"
                />
                <SearchResults
                  empty={Boolean(modalQuery.trim()) && modalResults.length === 0}
                  onReset={() => {
                    // Keep the proof uncontrolled: use the real native input event.
                    const input = modalRef.current
                    if (!input) return
                    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
                    setter?.call(input, "")
                    input.dispatchEvent(new Event("input", { bubbles: true }))
                    input.focus()
                  }}
                >
                {modalQuery.trim() ? (
                  modalResults.length > 0 ? (
                    <SearchResultList
                      ariaLabel="Risultati nella modal"
                      onSelect={(result) => setModalSelection(result.title)}
                      results={modalResults}
                    />
                  ) : (
                    null
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Inizia a digitare per filtrare le risorse.</p>
                )}
                </SearchResults>
                {modalSelection ? <p className="text-sm text-foreground">Selezionato: {modalSelection}</p> : null}
              </DialogContent>
            </Dialog>
          </Specimen>
        </section>
      </div>
    </div>
  )
}
