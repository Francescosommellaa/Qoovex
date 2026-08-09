"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@qoovex/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@qoovex/ui/components/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconTrendingUp,
  IconBuildingStore,
  IconCheck,
} from "@tabler/icons-react";

const areaData = [
  { month: "Gen", completati: 14, programmati: 18 },
  { month: "Feb", completati: 22, programmati: 26 },
  { month: "Mar", completati: 31, programmati: 34 },
  { month: "Apr", completati: 42, programmati: 44 },
  { month: "Mag", completati: 56, programmati: 58 },
  { month: "Giu", completati: 68, programmati: 72 },
];

const areaChartConfig = {
  completati: {
    label: "Cantieri Chiusi",
    color: "var(--chart-1)",
  },
  programmati: {
    label: "Obiettivo Mensile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const barData = [
  { categoria: "Scavi", costo: 42000, fill: "var(--chart-1)" },
  { categoria: "Strutture", costo: 85000, fill: "var(--chart-2)" },
  { categoria: "Impianti", costo: 64000, fill: "var(--chart-3)" },
  { categoria: "Finiture", costo: 51000, fill: "var(--chart-4)" },
  { categoria: "Isolamento", costo: 38000, fill: "var(--chart-5)" },
];

const barChartConfig = {
  costo: {
    label: "Spesa Effettiva (€)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const pieData = [
  { name: "In Corso", value: 38, fill: "var(--chart-1)" },
  { name: "Completati", value: 45, fill: "var(--chart-2)" },
  { name: "In Attesa", value: 12, fill: "var(--chart-3)" },
  { name: "Sospesi", value: 5, fill: "var(--chart-4)" },
];

const pieChartConfig = {
  "In Corso": { label: "In Corso", color: "var(--chart-1)" },
  Completati: { label: "Completati", color: "var(--chart-2)" },
  "In Attesa": { label: "In Attesa", color: "var(--chart-3)" },
  Sospesi: { label: "Sospesi", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function ChartCatalogPage() {
  const totalPieValue = React.useMemo(
    () => pieData.reduce((acc, curr) => acc + curr.value, 0),
    []
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Chart"
        description="Data visualization minimale in toni neutri monocromatici, pensata per una lettura pulita, essenziale ed elegante dell'informazione."
        importPath="import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@qoovex/ui/components/chart'"
      />

      <div className="flex flex-col gap-12">
        {/* ── KPI Minimalist Cards ─────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[0.6875rem] font-accent uppercase tracking-wider text-muted-foreground">
                    Cantieri Operativi
                  </CardDescription>
                  <Badge variant="outline" size="sm" className="font-mono text-[0.65rem]">
                    +14%
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-2xl font-semibold font-accent tracking-tight">100</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[0.6875rem] font-accent uppercase tracking-wider text-muted-foreground">
                    Budget Erogato
                  </CardDescription>
                  <Badge variant="outline" size="sm" className="font-mono text-[0.65rem]">
                    Q3 2026
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-2xl font-semibold font-accent tracking-tight">€ 280.000</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[0.6875rem] font-accent uppercase tracking-wider text-muted-foreground">
                    Efficienza
                  </CardDescription>
                  <Badge variant="outline" size="sm" className="font-mono text-[0.65rem]">
                    94.8%
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-2xl font-semibold font-accent tracking-tight">Ottimizzato</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* ── Grafico ad Area Minimalista ──────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Grafico ad Area (Linee & Gradienti Neutri)</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Progresso Cantieri vs Target">
              <ChartContainer config={areaChartConfig} className="h-72 w-full">
                <AreaChart data={areaData} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillCompletati" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-completati)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-completati)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillProgrammati" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-programmati)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--color-programmati)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.25} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="font-accent text-xs font-medium fill-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="font-accent text-xs font-medium fill-muted-foreground"
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    type="monotone"
                    dataKey="programmati"
                    stroke="var(--color-programmati)"
                    strokeOpacity={0.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#fillProgrammati)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="completati"
                    stroke="var(--color-completati)"
                    fillOpacity={1}
                    fill="url(#fillCompletati)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Grafico a Barre & Donut Minimalista ───────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Grafici a Barre e Donut Neutro</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Distribuzione Costi per Categoria">
              <ChartContainer config={barChartConfig} className="h-68 w-full">
                <BarChart data={barData} margin={{ top: 16, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.25} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="categoria"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="font-accent text-xs font-medium fill-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `€${val / 1000}k`}
                    className="font-accent text-xs font-medium fill-muted-foreground"
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="costo" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </Specimen>

            <Specimen title="Stato Portafoglio Cantieri (Donut Neutro)">
              <div className="relative flex h-68 w-full items-center justify-center">
                <ChartContainer config={pieChartConfig} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      cornerRadius={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>

                {/* Centered KPI metric inside Donut hole */}
                <div className="pointer-events-none absolute inset-0 mb-8 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-semibold font-accent tracking-tight text-foreground">
                    {totalPieValue}
                  </span>
                  <span className="text-[0.625rem] font-accent font-medium text-muted-foreground uppercase tracking-widest">
                    Cantieri
                  </span>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
