"use client";

import { IconAlertTriangle, IconArrowUpRight, IconCircleCheck, IconClock, IconFileDescription, IconFolderOpen } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@qoovex/ui/components/chart";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@qoovex/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@qoovex/ui/components/tabs";
import { cn } from "@qoovex/ui/lib/utils";

const chartData = [
  { week: "1 lug", ready: 18, review: 8 },
  { week: "8 lug", ready: 22, review: 10 },
  { week: "15 lug", ready: 20, review: 7 },
  { week: "22 lug", ready: 27, review: 9 },
  { week: "29 lug", ready: 31, review: 6 },
];

const chartConfig = {
  ready: { label: "Presenti", color: "var(--chart-2)" },
  review: { label: "Da verificare", color: "var(--chart-1)" },
} satisfies ChartConfig;

const queue = [
  { item: "Documento identità - Marco Rinaldi", context: "Cantiere Aurora", status: "Mancante", action: "Richiedi" },
  { item: "Verbale coordinamento del 12 luglio", context: "Cantiere Naviglio", status: "Da verificare", action: "Apri" },
  { item: "Attestato formazione - Elena Conti", context: "Cantiere Aurora", status: "In scadenza", action: "Controlla" },
  { item: "Pacchetto accesso subappaltatore con denominazione estesa", context: "Cantiere Porta Nuova", status: "Pronto", action: "Rivedi" },
];

const metrics = [
  { label: "Situazioni aperte", value: "12", note: "4 richiedono un'azione", icon: IconFolderOpen },
  { label: "Da verificare", value: "7", note: "Contenuti già presenti", icon: IconFileDescription },
  { label: "In scadenza", value: "3", note: "Entro i prossimi 30 giorni", icon: IconClock },
  { label: "Pacchetti pronti", value: "5", note: "Disponibili per revisione", icon: IconCircleCheck },
];

export function DashboardOverview({ preview = false }: { preview?: boolean }) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-4", preview ? "p-4 sm:p-5" : "p-4 md:p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Dati dimostrativi</Badge>
            <span className="text-xs text-muted-foreground">Aggiornamento manuale</span>
          </div>
          <h1 className={cn("font-semibold tracking-tight", preview ? "text-xl" : "text-2xl")}>Stato documentale</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Contenuti presenti, mancanti o da verificare nei contesti accessibili.</p>
        </div>
        {!preview ? <Button><IconArrowUpRight data-icon="inline-start" />Apri la coda</Button> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ icon: Icon, label, note, value }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardAction><Icon className="size-4 text-muted-foreground" /></CardAction>
              <CardTitle className="font-mono text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{note}</CardContent>
          </Card>
        ))}
      </div>

      <div className={cn("grid gap-4", preview ? "xl:grid-cols-[0.85fr_1.15fr]" : "xl:grid-cols-[0.8fr_1.2fr]")}>
        <Card>
          <CardHeader>
            <CardTitle>Andamento dei contenuti</CardTitle>
            <CardDescription>Distribuzione settimanale nell'esempio Sirio.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-52 w-full aspect-auto" config={chartConfig}>
              <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} dataKey="week" tickLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area dataKey="ready" fill="var(--color-ready)" fillOpacity={0.14} stroke="var(--color-ready)" strokeWidth={2} type="monotone" />
                <Area dataKey="review" fill="var(--color-review)" fillOpacity={0.12} stroke="var(--color-review)" strokeWidth={2} type="monotone" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="justify-between gap-3 text-xs text-muted-foreground">
            <span>Campione non produttivo</span><span>5 settimane</span>
          </CardFooter>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Coda operativa</CardTitle>
            <CardDescription>Le prossime azioni restano vicine al relativo contesto.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-4">Elemento</TableHead><TableHead>Stato</TableHead><TableHead className="pr-4 text-right">Azione</TableHead></TableRow></TableHeader>
              <TableBody>
                {queue.map((row) => (
                  <TableRow key={row.item}>
                    <TableCell className="max-w-64 pl-4 whitespace-normal"><span className="block font-medium">{row.item}</span><span className="block text-xs text-muted-foreground">{row.context}</span></TableCell>
                    <TableCell><Badge variant={row.status === "Mancante" ? "destructive" : "outline"}>{row.status}</Badge></TableCell>
                    <TableCell className="pr-4 text-right"><Button size="sm" variant="ghost">{row.action}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {!preview ? (
        <Card>
          <CardHeader><CardTitle>Stati della superficie</CardTitle><CardDescription>Loading, vuoto ed errore sono verificabili senza cambiare route.</CardDescription></CardHeader>
          <CardContent>
            <Tabs defaultValue="loading">
              <TabsList aria-label="Stati dashboard"><TabsTrigger value="loading">Loading</TabsTrigger><TabsTrigger value="empty">Vuoto</TabsTrigger><TabsTrigger value="error">Errore</TabsTrigger></TabsList>
              <TabsContent className="pt-4" value="loading"><div aria-busy="true" aria-label="Caricamento contenuti" className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div></TabsContent>
              <TabsContent className="pt-4" value="empty"><div className="rounded-lg border border-dashed p-6 text-center"><IconFolderOpen className="mx-auto size-5 text-muted-foreground" /><h3 className="mt-3 font-medium">Nessun elemento in coda</h3><p className="mt-1 text-sm text-muted-foreground">Gli elementi appariranno quando richiederanno attenzione.</p></div></TabsContent>
              <TabsContent className="pt-4" value="error"><Alert variant="destructive"><IconAlertTriangle /><AlertTitle>La coda non è disponibile</AlertTitle><AlertDescription>Riprova tra poco. Le altre sezioni restano consultabili.</AlertDescription></Alert></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
