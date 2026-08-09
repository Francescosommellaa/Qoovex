"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@qoovex/ui/components/collapsible";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { Input } from "@qoovex/ui/components/input";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Label } from "@qoovex/ui/components/label";
import {
  IconChevronDown,
  IconHelpCircle,
  IconFilter,
  IconShieldCheck,
  IconFileText,
  IconUsers,
  IconCreditCard,
  IconFolderCheck,
  IconSparkles,
} from "@tabler/icons-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqItems: FAQItem[] = [
  {
    id: "faq-1",
    category: "Piattaforma",
    icon: IconSparkles,
    question: "Come funziona il tracciamento in tempo reale dei cantieri?",
    answer:
      "Tutti i dati provenienti dai dispositivi sul campo, timbrature digitali ed avanzamento SAL vengono sincronizzati istantaneamente sui server cloud di Qoovex con crittografia end-to-end e registro di audit inalterabile.",
  },
  {
    id: "faq-2",
    category: "Amministrazione",
    icon: IconCreditCard,
    question: "Quali sono i limiti della delega economica per responsabile?",
    answer:
      "La delega economica è personalizzabile fino a € 50.000 per singola transazione. Al superamento della soglia impostata, la piattaforma richiede l'approvazione a doppio fattore dell'Amministratore Delegato.",
  },
  {
    id: "faq-3",
    category: "Sicurezza",
    icon: IconShieldCheck,
    question: "Come vengono verificati i documenti di idoneità professionale (POS/DURC)?",
    answer:
      "Il sistema OCR proprietario di Qoovex analizza automaticamente le scadenze dei certificati DURC, identificando eventuali irregolarità e bloccando preventivamente gli accessi al cantiere 15 giorni prima della scadenza.",
  },
  {
    id: "faq-4",
    category: "Collaboratori",
    icon: IconUsers,
    question: "Posso invitare subappaltatori ed ingegneri esterni alla piattaforma?",
    answer:
      "Sì, è possibile invitare un numero illimitato di collaboratori esterni assegnando ruoli ad accesso limitato (Visualizzatore, Certificatore, Direttore Lavori) senza costi aggiuntivi di licenza.",
  },
];

export default function CollapsibleCatalogPage() {
  const [openFaq, setOpenFaq] = React.useState<string | null>("faq-1");
  const [openFilters, setOpenFilters] = React.useState(true);
  const [openNestedDocs, setOpenNestedDocs] = React.useState(true);

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Collapsible"
        description="Componente per la contrazione ed espansione fluida di contenuti secondari a 60fps con transizioni in grid-template-rows ed estetica glassmorphic."
        importPath="import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@qoovex/ui/components/collapsible'"
      />

      <div className="flex flex-col gap-12">
        {/* ── FAQ Section (Domande Frequenti) ───────────────────────── */}
        <section>
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Domande Frequenti (FAQ Accordion)</h2>
              <p className="text-xs text-muted-foreground">
                Esempio di accordion a selezione singola con badge di categoria e transizioni morbide.
              </p>
            </div>
            <Badge variant="glass" size="sm" className="w-fit gap-1">
              <IconHelpCircle className="size-3.5 text-primary" />
              <span>4 Quesiti Disponibili</span>
            </Badge>
          </div>

          <div className="space-y-3">
            {faqItems.map((item) => {
              const isOpen = openFaq === item.id;
              const ItemIcon = item.icon;

              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={() => toggleFaq(item.id)}
                  className="w-full"
                >
                  <Card
                    className={`border transition-all duration-300 ${
                      isOpen
                        ? "border-primary/50 bg-card/80 shadow-sm backdrop-blur-md"
                        : "border-border/70 bg-card/40 hover:border-foreground/20 hover:bg-card/60 backdrop-blur-xs"
                    }`}
                  >
                    <CollapsibleTrigger
                      render={
                        <button
                          type="button"
                          className="flex w-full items-center justify-between p-4 text-left outline-none cursor-pointer select-none group"
                        />
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                            isOpen
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border/60 bg-muted/40 text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          <ItemIcon className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                          <span className="text-sm font-semibold font-accent tracking-tight text-foreground">
                            {item.question}
                          </span>
                          <Badge variant="outline" size="sm" className="w-fit text-[0.65rem] font-mono">
                            {item.category}
                          </Badge>
                        </div>
                      </div>

                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/50 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen ? "rotate-180 text-foreground bg-accent" : "group-hover:text-foreground"
                        }`}
                      >
                        <IconChevronDown className="size-4" />
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-border/40 px-4 pt-3 pb-4">
                        <p className="text-xs leading-relaxed text-muted-foreground font-sans pl-11">
                          {item.answer}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </section>

        {/* ── Filtri Avanzati Espandibili ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Filtri Avanzati Espandibili (Sidebar Filters)</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Pannello Filtri Cantiere con Contatore Attivo">
              <Collapsible open={openFilters} onOpenChange={setOpenFilters} className="w-full">
                <Card className="border border-border/80 bg-card/60 backdrop-blur-md">
                  <CardHeader className="flex flex-row items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-2">
                      <IconFilter className="size-4 text-primary" />
                      <CardTitle className="text-sm font-semibold font-accent">
                        Filtri Avanzati Ricerca
                      </CardTitle>
                      <Badge variant="info" size="sm" className="font-mono">
                        3 Attivi
                      </Badge>
                    </div>

                    <CollapsibleTrigger
                      render={
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                          <span>{openFilters ? "Nascondi Filtri" : "Mostra Filtri"}</span>
                          <IconChevronDown
                            className={`size-3.5 transition-transform duration-300 ${
                              openFilters ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                      }
                    />
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="border-t border-border/60 p-4 pt-3 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-accent">Cerca per Codice o Via</Label>
                          <Input placeholder="Es. JOB-8942..." className="h-8 text-xs" />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-accent">Stato Avanzamento</Label>
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Checkbox id="filter-active" defaultChecked />
                              <Label htmlFor="filter-active" className="text-xs font-normal cursor-pointer">
                                Attivi (38)
                              </Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Checkbox id="filter-pending" defaultChecked />
                              <Label htmlFor="filter-pending" className="text-xs font-normal cursor-pointer">
                                In Attesa (12)
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-accent">Ruoli Assegnati</Label>
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Checkbox id="filter-director" defaultChecked />
                              <Label htmlFor="filter-director" className="text-xs font-normal cursor-pointer">
                                Direttore Lavori
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Documentazione Nidata (Nested Collapsible) ─────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Documentazione Cantiere (Nested Panel)</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Cartella Documenti con Sezioni Espandibili">
              <Card className="border border-border/80 bg-card/60 backdrop-blur-md p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <IconFolderCheck className="size-4 text-success" />
                    <span className="text-sm font-semibold font-accent">
                      Fascicolo Tecnico Cantiere Via Roma 42
                    </span>
                  </div>
                  <Badge variant="outline" size="sm" className="font-mono">
                    12 File Totali
                  </Badge>
                </div>

                {/* Sub-collapsible 1 */}
                <Collapsible open={openNestedDocs} onOpenChange={setOpenNestedDocs} className="w-full">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <div className="flex items-center gap-2 text-xs font-medium font-accent">
                      <IconFileText className="size-3.5 text-muted-foreground" />
                      <span>1. Certificazioni di Sicurezza (POS / DURC)</span>
                    </div>
                    <CollapsibleTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" className="size-6">
                          <IconChevronDown
                            className={`size-3.5 transition-transform duration-200 ${
                              openNestedDocs ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                      }
                    />
                  </div>
                  <CollapsibleContent className="pt-2">
                    <div className="ml-5 space-y-1.5 border-l-2 border-border/60 pl-3 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted/30">
                        <span>• DURC_Inail_Azienda_2026.pdf</span>
                        <Badge variant="success" size="sm">Valido</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted/30">
                        <span>• Piano_Operativo_Sicurezza_v3.pdf</span>
                        <Badge variant="info" size="sm">Approvato</Badge>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
