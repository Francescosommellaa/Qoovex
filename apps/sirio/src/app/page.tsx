"use client";

import * as React from "react";
import {
  IconSparkles,
  IconPalette,
  IconTypography,
  IconRuler2,
  IconBolt,
  IconComponents,
  IconInfoCircle,
  IconExternalLink,
  IconLayoutDashboard,
} from "@tabler/icons-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@qoovex/ui/components/tabs";
import { FoundationsOverview } from "@/components/showcase/foundations-overview";
import { FoundationsColors } from "@/components/showcase/foundations-colors";
import { FoundationsTypography } from "@/components/showcase/foundations-typography";
import { FoundationsSpacing } from "@/components/showcase/foundations-spacing";
import { FoundationsMotion } from "@/components/showcase/foundations-motion";
import { ComponentsCatalog } from "@/components/showcase/components-catalog";

export default function SirioPage() {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col selection:bg-primary/20">
      <SiteHeader brand="sirio" action={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-8">
        {/* Navigation Tabs Header */}
        <div className="space-y-4 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="gap-1 px-2.5 py-0.5">
                <IconSparkles className="size-3.5" /> Sirio Design System
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Sorgente Canonica Qoovex v2.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/marketing"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border px-2.5 py-1 rounded-md transition-colors"
              >
                <IconExternalLink className="size-3.5" /> Preview Marketing
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border px-2.5 py-1 rounded-md transition-colors"
              >
                <IconLayoutDashboard className="size-3.5" /> Preview Workspace Shell
              </a>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto p-1 bg-muted/40 gap-1 rounded-xl w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="gap-1.5 text-xs py-1.5 px-3">
                <IconSparkles className="size-3.5" /> Panoramica
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-1.5 text-xs py-1.5 px-3">
                <IconPalette className="size-3.5" /> Colori & OKLCH
              </TabsTrigger>
              <TabsTrigger value="typography" className="gap-1.5 text-xs py-1.5 px-3">
                <IconTypography className="size-3.5" /> Tipografia
              </TabsTrigger>
              <TabsTrigger value="spacing" className="gap-1.5 text-xs py-1.5 px-3">
                <IconRuler2 className="size-3.5" /> Spaziature & Ombre
              </TabsTrigger>
              <TabsTrigger value="motion" className="gap-1.5 text-xs py-1.5 px-3">
                <IconBolt className="size-3.5" /> Animazioni & Motion
              </TabsTrigger>
              <TabsTrigger value="components" className="gap-1.5 text-xs py-1.5 px-3 font-semibold">
                <IconComponents className="size-3.5 text-primary" /> Catalogo Componenti (37)
              </TabsTrigger>
            </TabsList>

            <div className="pt-6">
              <TabsContent value="overview">
                <FoundationsOverview />
              </TabsContent>
              <TabsContent value="colors">
                <FoundationsColors />
              </TabsContent>
              <TabsContent value="typography">
                <FoundationsTypography />
              </TabsContent>
              <TabsContent value="spacing">
                <FoundationsSpacing />
              </TabsContent>
              <TabsContent value="motion">
                <FoundationsMotion />
              </TabsContent>
              <TabsContent value="components">
                <ComponentsCatalog />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {/* Main Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">Sirio</span> — Catalogo e Superficie di Verifica Canonica Qoovex.
        </div>
        <div className="flex items-center gap-4">
          <span>@qoovex/ui</span>
          <span>OKLCH Design Tokens</span>
          <span>Geist Typography</span>
        </div>
      </footer>
    </div>
  );
}
