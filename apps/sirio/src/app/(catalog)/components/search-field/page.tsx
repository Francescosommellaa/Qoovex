"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { SearchField, SearchResults } from "@qoovex/ui/components/search-field";
import { Badge } from "@qoovex/ui/components/badge";
import { Card } from "@qoovex/ui/components/card";
import { IconBuildingStore, IconFileText } from "@tabler/icons-react";

const sampleData = [
  { id: "1", title: "Ristrutturazione Via Roma 42", type: "Cantiere", location: "Milano" },
  { id: "2", title: "Preventivo aggiornato", type: "Documento", location: "PDF" },
  { id: "3", title: "Riqualificazione Parco Sud", type: "Cantiere", location: "Monza" },
  { id: "4", title: "Foto sopralluogo", type: "Documento", location: "JPG" },
];

export default function SearchFieldCatalogPage() {
  const [searchValue, setSearchValue] = React.useState("");

  const filteredResults = React.useMemo(() => {
    if (!searchValue.trim()) return [];
    return sampleData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.type.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Search Field"
        description="Campo di ricerca rapida con icona integrata, pulsante di cancellazione dinamico (Clear) ed aria-live per la resa accessibile dei risultati."
        importPath="import { SearchField, SearchResults } from '@qoovex/ui/components/search-field'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Interattivo con Risultati in Tempo Reale ────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Ricerca Interattiva in Tempo Reale</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Search Field con Reset Dinamico">
              <div className="w-full max-w-lg space-y-4">
                <SearchField
                  placeholder="Cerca lavori o documenti (es. Via Roma, preventivo...)"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue("")}
                />

                <SearchResults>
                  {searchValue.trim() !== "" && filteredResults.length === 0 ? (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                      Nessun risultato trovato per &quot;{searchValue}&quot;
                    </div>
                  ) : null}

                  {filteredResults.map((result) => (
                    <Card
                      key={result.id}
                      className="flex items-center justify-between p-3.5 border-border/70 bg-card/60 backdrop-blur-md text-xs hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {result.type === "Cantiere" ? (
                          <IconBuildingStore className="size-4 text-primary shrink-0" />
                        ) : (
                          <IconFileText className="size-4 text-info shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold font-accent text-foreground">{result.title}</p>
                          <p className="text-[0.6875rem] text-muted-foreground">{result.location}</p>
                        </div>
                      </div>
                      <Badge variant="outline" size="sm">
                        {result.type}
                      </Badge>
                    </Card>
                  ))}
                </SearchResults>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Dimensioni e Varianti ──────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dimensioni e Stati d'Uso</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Stato Vuoto (Placeholder)">
              <SearchField placeholder="Cerca nel registro cantieri..." className="w-full" />
            </Specimen>

            <Specimen title="Stato Valorizzato con Pulsante Clear">
              <SearchField
                value="Cantiere Parco Sud"
                readOnly
                onClear={() => {}}
                className="w-full"
              />
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
