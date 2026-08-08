import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import {
  IconBuildingStore,
  IconDotsVertical,
  IconReceipt2,
  IconTrendingUp,
  IconClock,
  IconArrowRight,
  IconFileText,
} from "@tabler/icons-react";

export default function CardCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Card"
        description="Contenitore primario di superficie per raggruppare informazioni correlate, KPI di cantiere e schede interattive."
        importPath="import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@qoovex/ui/components/card'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Card Cantiere Interattiva ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Card Cantiere (Caso d'Uso Primario)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Scheda Cantiere Interattiva">
              <Card variant="interactive" className="w-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      <AvatarFallback className="bg-primary/10 text-primary font-accent font-semibold">
                        RM
                      </AvatarFallback>
                    </Avatar>
                    <CardHeader className="gap-0.5">
                      <CardTitle className="font-accent text-base text-primary">JOB-SITE #8942-2026</CardTitle>
                      <CardDescription>Via Roma 42, Milano (MI)</CardDescription>
                    </CardHeader>
                  </div>
                  <CardAction>
                    <Badge variant="default" className="font-accent text-[0.6875rem]">ACTIVE</Badge>
                  </CardAction>
                </div>

                <CardContent className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ristrutturazione impianto elettrico ed idraulico. Fase 02 in corso.
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">Importo Stimato Iniziale:</span>
                    <span className="font-accent text-sm font-semibold text-foreground">€ 45.000,00</span>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <IconClock className="h-3.5 w-3.5" />
                    <span>Aggiornato 10m fa</span>
                  </div>
                  <Button size="xs" variant="ghost" className="gap-1">
                    Dettagli <IconArrowRight className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            </Specimen>

            <Specimen title="Card KPI Finanziario / Totale Saldo">
              <Card variant="default" className="w-full">
                <div className="flex items-center justify-between">
                  <CardHeader className="gap-0.5">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">
                      Pagamenti Documentati
                    </CardDescription>
                    <CardTitle className="font-accent text-2xl font-bold tracking-tight text-foreground">
                      € 124.500,00
                    </CardTitle>
                  </CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <IconReceipt2 className="h-5 w-5" />
                  </div>
                </div>

                <CardContent className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="gap-1 bg-success/10 text-success font-accent text-[0.6875rem]">
                      <IconTrendingUp className="h-3 w-3" /> +14.2%
                    </Badge>
                    <span>rispetto al mese precedente</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <span>18 ricevute registrate dalle parti</span>
                </CardFooter>
              </Card>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Varianti di Superficie ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti di Superficie (Default, Outline, Ghost, Interactive)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Default (Sfondo Card + Ombra Sottile)">
              <Card variant="default" className="w-full">
                <CardHeader>
                  <CardTitle>Superficie Default</CardTitle>
                  <CardDescription>Bordo standard con micro-ombra elevata.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Adatta per pannelli primari e dashboard.</p>
                </CardContent>
              </Card>
            </Specimen>

            <Specimen title="Outline (Sfondo Trasparente)">
              <Card variant="outline" className="w-full">
                <CardHeader>
                  <CardTitle>Superficie Outline</CardTitle>
                  <CardDescription>Sfondo neutro per layout nidificati.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Senza elevazione, con solo bordo visibile.</p>
                </CardContent>
              </Card>
            </Specimen>

            <Specimen title="Ghost (Superficie Muted)">
              <Card variant="ghost" className="w-full">
                <CardHeader>
                  <CardTitle>Superficie Ghost</CardTitle>
                  <CardDescription>Sfondo tenue per contenuti secondari.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Utile per note interne o dettagli opzionali.</p>
                </CardContent>
              </Card>
            </Specimen>

            <Specimen title="Interactive (Hover Reattivo)">
              <Card variant="interactive" className="w-full">
                <CardHeader>
                  <CardTitle>Superficie Interactive</CardTitle>
                  <CardDescription>Passa il mouse per testare l'effetto lift.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Micro-sollevamento `-translate-y-0.5` con ombra dinamica.</p>
                </CardContent>
              </Card>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
