"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableHeadSort,
  TableRow,
  TableToolbar,
  TablePagination,
} from "@qoovex/ui/components/table";
import { Button } from "@qoovex/ui/components/button";
import { Badge } from "@qoovex/ui/components/badge";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { SearchInput } from "@qoovex/ui/components/input";
import {
  IconPlus,
  IconDownload,
  IconDotsVertical,
  IconBuildingStore,
  IconCheck,
} from "@tabler/icons-react";

const jobSites = [
  {
    code: "JOB-8942",
    name: "Ristrutturazione Via Roma 42",
    client: "Marco Rossi",
    initials: "MR",
    status: "ACTIVE",
    statusVariant: "default" as const,
    amount: "€ 45.000,00",
    date: "10 AGO 2026",
  },
  {
    code: "JOB-8943",
    name: "Impianto Elettrico Palazzo Po",
    client: "Giulia Bianchi",
    initials: "GB",
    status: "PENDING",
    statusVariant: "warning" as const,
    amount: "€ 12.500,00",
    date: "12 AGO 2026",
  },
  {
    code: "JOB-8944",
    name: "Manutenzione Idraulica Corso Italia",
    client: "Alessandro Verdi",
    initials: "AV",
    status: "COMPLETED",
    statusVariant: "secondary" as const,
    amount: "€ 8.200,00",
    date: "05 AGO 2026",
  },
  {
    code: "JOB-8945",
    name: "Riqualificazione Energetica Villa Sospeso",
    client: "Elena Neri",
    initials: "EN",
    status: "ACTIVE",
    statusVariant: "default" as const,
    amount: "€ 98.000,00",
    date: "14 AGO 2026",
  },
];

export default function TablePage() {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | false>("asc");
  const [selectedRow, setSelectedRow] = useState("JOB-8942");
  const [page, setPage] = useState(1);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Table"
        description="Data table di livello enterprise per la gestione di cantieri, report finanziari e dati complessi con ordinamento, toolbar, impaginazione e contenitore card."
        importPath="import { TableContainer, Table, TableHeader, TableHeadSort, TableBody, TableRow, TableCell, TableToolbar, TablePagination } from '@qoovex/ui/components/table'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Tabella Enterprise Completa ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Data Table Enterprise (Gestione Cantieri)</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Tabella Completa con Toolbar, Ordinamento & Impaginazione">
              <TableContainer>
                <TableToolbar>
                  <div className="flex items-center gap-2 max-w-xs w-full">
                    <SearchInput
                      placeholder="Filtra cantieri..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClear={() => setSearch("")}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <IconDownload />
                      <span>Esporta CSV</span>
                    </Button>
                    <Button size="sm">
                      <IconPlus />
                      <span>Nuovo Cantiere</span>
                    </Button>
                  </div>
                </TableToolbar>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadSort
                        sortDirection={sortDir}
                        onSort={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                      >
                        Codice & Cantiere
                      </TableHeadSort>
                      <TableHead>Committente</TableHead>
                      <TableHead>Stato Lavori</TableHead>
                      <TableHead className="text-right">Importo Stimato</TableHead>
                      <TableHead className="text-right">Data Inizio</TableHead>
                      <TableHead className="w-12 text-center">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobSites.map((site) => (
                      <TableRow
                        key={site.code}
                        data-state={selectedRow === site.code ? "selected" : undefined}
                        onClick={() => setSelectedRow(site.code)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                              <IconBuildingStore className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{site.name}</p>
                              <span className="font-accent text-xs text-muted-foreground">{site.code}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar size="xs">
                              <AvatarFallback className="text-[0.625rem] bg-primary/10 text-primary font-bold">
                                {site.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span>{site.client}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={site.statusVariant} className="font-accent text-[0.6875rem]">
                            {site.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-accent font-bold text-foreground">
                          {site.amount}
                        </TableCell>
                        <TableCell className="text-right font-accent text-xs text-muted-foreground">
                          {site.date}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon-xs">
                            <IconDotsVertical className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <TablePagination
                  pageIndex={page}
                  pageCount={4}
                  totalItems={38}
                  pageSize={10}
                  onPageChange={setPage}
                />
              </TableContainer>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Tabella Densitá Compatta Striped Zebra ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Densità Compatta & Righe Striped Zebra</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Tabella Compatta Striped Zebra (density=compact, striped=true)">
              <TableContainer>
                <Table density="compact" striped>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Codice</TableHead>
                      <TableHead>Descrizione Lavorazione</TableHead>
                      <TableHead className="text-right">Ore Stimate</TableHead>
                      <TableHead className="text-right">Costo Orario</TableHead>
                      <TableHead className="text-right">Totale Parte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-accent font-semibold">PART-01</TableCell>
                      <TableCell>Posatori tubature e tracce muro</TableCell>
                      <TableCell className="text-right font-accent">40 h</TableCell>
                      <TableCell className="text-right font-accent">€ 45,00/h</TableCell>
                      <TableCell className="text-right font-accent font-bold">€ 1.800,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-accent font-semibold">PART-02</TableCell>
                      <TableCell>Cablaggio centralina differenziale</TableCell>
                      <TableCell className="text-right font-accent">24 h</TableCell>
                      <TableCell className="text-right font-accent">€ 50,00/h</TableCell>
                      <TableCell className="text-right font-accent font-bold">€ 1.200,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-accent font-semibold">PART-03</TableCell>
                      <TableCell>Collaudo e certificazione impianto</TableCell>
                      <TableCell className="text-right font-accent">12 h</TableCell>
                      <TableCell className="text-right font-accent">€ 65,00/h</TableCell>
                      <TableCell className="text-right font-accent font-bold">€ 780,00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
