"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Separator } from "@qoovex/ui/components/separator";
import { Button } from "@qoovex/ui/components/button";
import { IconCopy, IconShare, IconDownload, IconTrash } from "@tabler/icons-react";

export default function SeparatorCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Separator"
        description="Elemento di divisione visiva o semantica orizzontale e verticale tra sezioni, contenuti o controlli."
        importPath="import { Separator } from '@qoovex/ui/components/separator'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Orientamenti ───────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Orientamenti (Horizontal / Vertical)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Orizzontale (Horizontal)">
              <div className="w-full space-y-3 text-xs">
                <div>
                  <h4 className="font-semibold text-foreground font-accent">Documenti del lavoro Via Roma 42</h4>
                  <p className="text-muted-foreground">File allegati e documenti condivisi</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Stato: Condiviso</span>
                  <span>Ultima modifica: 14 Maggio 2026</span>
                </div>
              </div>
            </Specimen>

            <Specimen title="Verticale in Toolbar (Vertical)">
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-card p-2">
                <Button variant="ghost" size="icon-sm">
                  <IconCopy className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <IconShare className="size-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="icon-sm">
                  <IconDownload className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-destructive">
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Separator con Etichetta Centrale ────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Divisore con Etichetta Testuale</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Separatore di Autenticazione ('Oppure')">
              <div className="w-full max-w-sm space-y-4">
                <Button variant="default" className="w-full">
                  Accedi con SSO Aziendale
                </Button>

                <div className="relative flex items-center justify-center">
                  <Separator className="w-full" />
                  <span className="absolute bg-background px-3 text-[0.6875rem] font-accent uppercase tracking-widest text-muted-foreground">
                    Oppure
                  </span>
                </div>

                <Button variant="outline" className="w-full">
                  Accedi con Credenziali
                </Button>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
