"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconBuildingStore,
  IconChartBar,
  IconFileText,
  IconSettings,
  IconPlus,
  IconSearch,
  IconBell,
  IconUser,
  IconCheck,
  IconAlertTriangle,
  IconChevronRight,
  IconFilter,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Input } from "@qoovex/ui/components/input";
import { SearchField } from "@qoovex/ui/components/search-field";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@qoovex/ui/components/table";
import { ChartContainer, type ChartConfig } from "@qoovex/ui/components/chart";
import { WorkQueueItem, WorkQueueItemContent, WorkQueueItemActions } from "@qoovex/ui/components/work-queue-item";
import { Timeline, TimelineEntry, TimelineMarker, TimelineContent, TimelineActor, TimelineDateSeparator, TimelineTransition } from "@qoovex/ui/components/timeline";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@qoovex/ui/components/dialog";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@qoovex/ui/components/breadcrumb";

const chartData = [
  { month: "Gen", prog: 30, val: 120 },
  { month: "Feb", prog: 45, val: 190 },
  { month: "Mar", prog: 62, val: 240 },
  { month: "Apr", prog: 78, val: 310 },
  { month: "Mag", prog: 90, val: 420 },
];

const chartConfig: ChartConfig = {
  prog: { label: "Avanzamento Globale (%)", color: "var(--chart-1)" },
  val: { label: "Valore Produzione (€k)", color: "var(--chart-2)" },
};

export default function DashboardPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SiteHeader brand="sirio" action={true} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/dashboard">Workspace</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Panoramica Cantieri</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard Direzione Lavori</h1>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger render={<Button size="sm" className="gap-1.5" data-cursor-magnetic="true" />}>
                <IconPlus className="size-4" />
                Nuovo Cantiere
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registra Nuovo Cantiere</DialogTitle>
                  <DialogDescription>Aggiungi un nuovo cantiere di produzione alla workspace.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nome Cantiere</label>
                    <Input placeholder="Es. Residenza Navigli" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Impresa Appaltatrice</label>
                    <Input placeholder="Es. EdilCostruzioni Srl" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
                  <Button>Crea Scheda</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-mono">Cantieri Attivi</CardDescription>
              <CardTitle className="text-3xl font-extrabold">24 Lotti</CardTitle>
            </CardHeader>
            <CardContent><Badge variant="success">100% In Regola</Badge></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-mono">Avanzamento Medio</CardDescription>
              <CardTitle className="text-3xl font-extrabold">78.4%</CardTitle>
            </CardHeader>
            <CardContent><Badge variant="info">+4.2% questo mese</Badge></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-mono">Valore Produzione</CardDescription>
              <CardTitle className="text-3xl font-extrabold">€4.2M</CardTitle>
            </CardHeader>
            <CardContent><Badge variant="outline">Budget Assegnato</Badge></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-mono">Segnalazioni Aperte</CardDescription>
              <CardTitle className="text-3xl font-extrabold">2 Criticità</CardTitle>
            </CardHeader>
            <CardContent><Badge variant="warning">Azione Richiesta</Badge></CardContent>
          </Card>
        </div>

        {/* Main Grid: Analytics & Priority Work Queue */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart Analytics */}
          <Card className="lg:col-span-2 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Metriche di Produzione & Valore</CardTitle>
                <CardDescription className="text-xs">Andamento mensile avanzamento lavori in OKLCH.</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">Gen - Mag 2026</Badge>
            </div>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="prog" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
              </AreaChart>
            </ChartContainer>
          </Card>

          {/* Work Queue */}
          <Card className="p-4 space-y-4">
            <div>
              <CardTitle className="text-base">Coda di Lavoro Prioritaria</CardTitle>
              <CardDescription className="text-xs">Segnalazioni da evadere entro 24h.</CardDescription>
            </div>
            <div className="space-y-3">
              <WorkQueueItem priority="blocking">
                <WorkQueueItemContent>
                  <span className="text-xs font-bold block">Collaudo Solaio Lotto C</span>
                  <p className="text-[0.7rem] text-muted-foreground">Ispezione strutturale richiesta prima del getto.</p>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Button size="xs" variant="destructive">Approva</Button>
                </WorkQueueItemActions>
              </WorkQueueItem>

              <WorkQueueItem priority="attention">
                <WorkQueueItemContent>
                  <span className="text-xs font-bold block">Consegna Ponteggi Ovest</span>
                  <p className="text-[0.7rem] text-muted-foreground">Attesa verifica montaggio dal responsabile.</p>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Button size="xs" variant="outline">Verifica</Button>
                </WorkQueueItemActions>
              </WorkQueueItem>
            </div>
          </Card>
        </div>

        {/* Data Table of Sites */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Elenco Cantieri di Produzione</CardTitle>
              <CardDescription className="text-xs">Registro integrato di tutte le unità operative.</CardDescription>
            </div>
            <SearchField placeholder="Cerca cantiere..." className="w-full sm:w-64" />
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codice</TableHead>
                  <TableHead>Denominazione Cantiere</TableHead>
                  <TableHead>Impresa</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Valore (€)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">CNT-2026-01</TableCell>
                  <TableCell className="font-medium text-xs">Residenza Parco Nord</TableCell>
                  <TableCell className="text-xs text-muted-foreground">MilanoEdile Spa</TableCell>
                  <TableCell><Badge variant="success">Attivo</Badge></TableCell>
                  <TableCell className="text-right font-mono text-xs">€1,850,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">CNT-2026-02</TableCell>
                  <TableCell className="font-medium text-xs">Campus Innovazione Navigli</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Lombardia Costruzioni</TableCell>
                  <TableCell><Badge variant="warning">In Sospensione</Badge></TableCell>
                  <TableCell className="text-right font-mono text-xs">€3,400,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">CNT-2026-03</TableCell>
                  <TableCell className="font-medium text-xs">Torre Direzionale San Siro</TableCell>
                  <TableCell className="text-xs text-muted-foreground">TechBuild Srl</TableCell>
                  <TableCell><Badge variant="info">Inizializzazione</Badge></TableCell>
                  <TableCell className="text-right font-mono text-xs">€2,900,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
