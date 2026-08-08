"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { Card, CardHeader, CardContent } from "@qoovex/ui/components/card";

export default function SkeletonCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Skeleton"
        description="Segnaposto animato ad onda pulsante per rappresentare lo stato di caricamento asincrono di layout complessi, tabelle e grafici."
        importPath="import { Skeleton } from '@qoovex/ui/components/skeleton'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Componenti Base e Card ─────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Componenti Base & Card</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Avatar & Info Utente">
              <div className="flex items-center gap-3 w-full">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Specimen>

            <Specimen title="Metric KPI Card">
              <Card className="w-full p-4 space-y-3 border-border/80 bg-card/60">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-7 w-28 font-mono" />
              </Card>
            </Specimen>

            <Specimen title="Badge & Tag Multiline">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Tabelle Dati e Code di Lavoro ──────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Tabelle Dati e Code di Lavoro (Table & Queue)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Righe di Tabella in Caricamento">
              <div className="w-full space-y-2.5 rounded-lg border border-border/80 bg-card/40 p-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 w-full">
                      <Skeleton className="size-4 shrink-0 rounded-sm" />
                      <Skeleton className="h-3.5 w-3/5" />
                    </div>
                    <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                  </div>
                ))}
              </div>
            </Specimen>

            <Specimen title="Scheda Task / Work Queue Item">
              <div className="w-full rounded-xl border border-border/80 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-3/4" />
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Analytics & Data Visualization Skeleton ───────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Grafici & Data Visualization</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Dashboard Analytics in Caricamento">
              <Card className="w-full p-5 space-y-4 border-border/80 bg-card/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
                <div className="flex items-end gap-3 pt-4 h-40">
                  <Skeleton className="h-[40%] w-full rounded-t-md" />
                  <Skeleton className="h-[75%] w-full rounded-t-md" />
                  <Skeleton className="h-[55%] w-full rounded-t-md" />
                  <Skeleton className="h-[90%] w-full rounded-t-md" />
                  <Skeleton className="h-[65%] w-full rounded-t-md" />
                  <Skeleton className="h-[80%] w-full rounded-t-md" />
                </div>
              </Card>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Form e Campi Input Skeleton ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Form & Campi di Input</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Modulo Inserimento Dati">
              <div className="w-full space-y-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </Specimen>

            <Specimen title="Profilo Utente Completo">
              <div className="w-full space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-14 shrink-0 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3.5 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
