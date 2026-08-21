"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Button } from "@qoovex/ui/components/button";
import { Badge } from "@qoovex/ui/components/badge";
import { Card } from "@qoovex/ui/components/card";

export default function SpinnerCatalogPage() {
  // Interactive Progress Demo State
  const [progress, setProgress] = React.useState(25);
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");

  // Simulation handler
  const handleSimulateProcess = () => {
    setStatus("loading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("success");
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Spinner"
        description="Indicatore di caricamento ultra-dinamico GPU con avanzamento determinato (0-100%), morphing di stato (Loading → Success → Error), messaggi rotanti dinamici e 6 varianti di stile."
        importPath="import { Spinner } from '@qoovex/ui/components/spinner'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Demo Dinamica: Avanzamento Determinato & Morphing di Stato ───────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dimostrazione Dinamica & Morphing di Stato</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Avanzamento Determinato 0-100% con Status Morphing">
              <div className="flex flex-col items-center gap-4 py-3">
                <Spinner
                  variant="track"
                  size="xl"
                  color={status === "success" ? "success" : status === "error" ? "destructive" : "primary"}
                  progress={status === "loading" ? progress : undefined}
                  status={status}
                  glow
                />

                <div className="flex items-center gap-2">
                  <Badge variant={status === "success" ? "success" : "outline"} className="font-mono text-xs">
                    {status === "loading" ? `Caricamento: ${progress}%` : status === "success" ? "Caricamento completato" : "Errore di caricamento"}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <Button size="sm" onClick={handleSimulateProcess}>
                    Simula caricamento file
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus("error")}>
                    Simula Errore
                  </Button>
                </div>
              </div>
            </Specimen>

            <Specimen title="Messaggi Dinamici a Rotazione Fasi Cantieri">
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <Spinner
                  size="lg"
                  color="primary"
                  label={["Preparazione del caricamento...", "Caricamento file...", "Aggiornamento del contenuto...", "Completato"]}
                  labelPosition="bottom"
                />
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Varianti di Stile ──────────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti di Stile Indeterminate</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Ring (Default Sweep)">
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner variant="ring" size="lg" color="primary" />
                <span className="text-xs font-mono text-muted-foreground">ring</span>
              </div>
            </Specimen>

            <Specimen title="Track (Dual Arc Gauge)">
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner variant="track" size="lg" color="primary" />
                <span className="text-xs font-mono text-muted-foreground">track</span>
              </div>
            </Specimen>

            <Specimen title="Bars (iOS Radial)">
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner variant="bars" size="lg" color="primary" />
                <span className="text-xs font-mono text-muted-foreground">bars</span>
              </div>
            </Specimen>

            <Specimen title="Orbit (Concentric Circles)">
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner variant="orbit" size="lg" color="primary" />
                <span className="text-xs font-mono text-muted-foreground">orbit</span>
              </div>
            </Specimen>

            <Specimen title="Pulse (Ambient Beacon)">
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner variant="pulse" size="lg" color="primary" />
                <span className="text-xs font-mono text-muted-foreground">pulse</span>
              </div>
            </Specimen>

            <Specimen title="Dots (Wave Bouncing)">
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner variant="dots" size="lg" color="primary" />
                <span className="text-xs font-mono text-muted-foreground">dots</span>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Scala delle Dimensioni & Velocità ────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dimensioni & Velocità di Rotazione</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Scala Dimensioni (xs → xl)">
              <div className="flex flex-wrap items-center gap-6 py-2">
                <Spinner size="xs" color="primary" />
                <Spinner size="sm" color="primary" />
                <Spinner size="default" color="primary" />
                <Spinner size="lg" color="primary" />
                <Spinner size="xl" color="primary" />
              </div>
            </Specimen>

            <Specimen title="Velocità di Animazione">
              <div className="flex flex-wrap items-center justify-center gap-6 py-2 sm:justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  <Spinner speed="slow" size="lg" color="primary" />
                  <span className="text-xs font-mono text-muted-foreground">slow (1.5s)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Spinner speed="normal" size="lg" color="primary" />
                  <span className="text-xs font-mono text-muted-foreground">normal (1.0s)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Spinner speed="fast" size="lg" color="primary" />
                  <span className="text-xs font-mono text-muted-foreground">fast (0.6s)</span>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
