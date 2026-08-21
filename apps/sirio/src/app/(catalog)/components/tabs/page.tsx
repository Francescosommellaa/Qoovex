"use client";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@qoovex/ui/components/tabs";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconInfoCircle,
  IconTimeline,
  IconReceipt2,
  IconFiles,
  IconBell,
  IconShield,
  IconBuildingStore,
} from "@tabler/icons-react";

export default function TabsCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Tabs"
        description="Navigazione a schede con indicatore hover scorrevole estratto dalla Topbar Navigation. Il componente è lo stesso usato internamente da FloatingNavigation — stessi stili, stessa curva, stessa fisica."
        importPath="import { Tabs, TabsList, TabsTrigger, TabsContent } from '@qoovex/ui/components/tabs'"
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Tabs base ──────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            1. Tabs con Pannelli di Contenuto
          </h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Navigazione Cantiere" visualId="tabs-selected">
              <Tabs defaultValue="overview" className="w-full">
                <div
                  className="w-full overflow-x-auto rounded-lg px-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="region"
                  aria-label="Sezioni del cantiere"
                  tabIndex={0}
                >
                <TabsList>
                  <TabsTrigger value="overview">
                    <IconInfoCircle />
                    Panoramica
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <IconTimeline />
                    Timeline
                    <Badge variant="secondary" className="ml-1.5 font-accent text-xs">
                      12
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <IconReceipt2 />
                    Pagamenti
                    <Badge variant="secondary" className="ml-1.5 font-accent text-xs">
                      € 12.450
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="docs">
                    <IconFiles />
                    Documentazione
                  </TabsTrigger>
                </TabsList>
                </div>

                <TabsContent value="overview" className="mt-4">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold mb-1">Panoramica del Cantiere</h3>
                      <p className="text-sm text-muted-foreground">
                        Riepilogo delle attività attive, stato di avanzamento, richieste e decisioni
                        del cantiere selezionato.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold mb-1">Cronologia Eventi</h3>
                      <p className="text-sm text-muted-foreground">
                        12 eventi registrati — ultimo aggiornamento 3 ore fa.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold mb-1">Pagamenti documentati</h3>
                      <p className="text-sm text-muted-foreground">
                        Una richiesta di pagamento e una dichiarazione del Cliente da consultare.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="docs" className="mt-4">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold mb-1">Documentazione</h3>
                      <p className="text-sm text-muted-foreground">
                        File allegati al lavoro e documenti condivisi nel relativo contesto.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── 2. Tabs senza pannelli (link puri) ────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            2. TabsList Standalone (senza pannelli)
          </h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Usato come segmented control senza contenuto associato">
              <div
                className="w-full overflow-x-auto rounded-lg px-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                role="region"
                aria-label="Filtri per stato"
                tabIndex={0}
              >
              <TabsList activeValue="tutti">
                <TabsTrigger value="tutti">Tutti</TabsTrigger>
                <TabsTrigger value="attivi">
                  Attivi
                  <Badge variant="secondary" className="ml-1.5 font-accent text-xs">
                    8
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="archiviati">Archiviati</TabsTrigger>
                <TabsTrigger value="bozze">Bozze</TabsTrigger>
              </TabsList>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── 3. Tabs controllato ───────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            3. Impostazioni (Tabs Controllato)
          </h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Pannello impostazioni con icone">
              <Tabs defaultValue="general" className="w-full">
                <div
                  className="w-full overflow-x-auto rounded-lg px-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="region"
                  aria-label="Sezioni delle impostazioni"
                  tabIndex={0}
                >
                <TabsList>
                  <TabsTrigger value="general">
                    <IconBuildingStore />
                    Generale
                  </TabsTrigger>
                  <TabsTrigger value="notifications">
                    <IconBell />
                    Notifiche
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <IconShield />
                    Sicurezza
                  </TabsTrigger>
                </TabsList>
                </div>

                <TabsContent value="general" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Gestisci le informazioni della tua azienda.
                  </p>
                </TabsContent>
                <TabsContent value="notifications" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Configura le notifiche per richieste e aggiornamenti del lavoro.
                  </p>
                </TabsContent>
                <TabsContent value="security" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Gestisci le opzioni di accesso al tuo account.
                  </p>
                </TabsContent>
              </Tabs>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── 4. Anatomia ───────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">4. Anatomia del Componente</h2>
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground leading-7">
            <p className="mb-3 text-foreground font-medium">
              Il componente Tabs è stato estratto dalla{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">FloatingNavigation</code> e
              ne replica esattamente il pattern visivo e interattivo:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Indicatore hover</strong> — un <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;span&gt;</code> posizionato
                in assoluto che misura il <code className="text-xs bg-muted px-1.5 py-0.5 rounded">boundingClientRect</code> dell'elemento sotto il
                cursore e scorre con <code className="text-xs bg-muted px-1.5 py-0.5 rounded">translate3d</code>.
              </li>
              <li>
                <strong>Curva di animazione</strong> — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">cubic-bezier(0.16, 1, 0.3, 1)</code> a
                260ms per posizione e dimensione, 120ms per opacità.
              </li>
              <li>
                <strong>Stato attivo</strong> — pillola invertita: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">bg-foreground text-background</code> con <code className="text-xs bg-muted px-1.5 py-0.5 rounded">transition-colors</code>.
              </li>
              <li>
                <strong>Render polimorfico</strong> — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">TabsTrigger</code> accetta un
                prop <code className="text-xs bg-muted px-1.5 py-0.5 rounded">render</code> per renderizzare <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;a href&gt;</code> invece
                di <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;button&gt;</code>.
              </li>
              <li>
                <strong>useTabsList()</strong> — hook per accedere al contesto e guidare
                l'indicatore da componenti figli (usato da <code className="text-xs bg-muted px-1.5 py-0.5 rounded">FloatingNavigation</code> per il
                resource dropdown).
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
