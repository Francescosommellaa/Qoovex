"use client";

import * as React from "react";
import { IconRuler2, IconBox, IconLayersSubtract } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";

export function FoundationsSpacing() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Spaziature, Raggi & Ombre (Elevation)</h2>
            <p className="text-sm text-muted-foreground">
              Sistema di layout a griglia base 4px, raggi di curvatura modulari e scala di profondità visiva a 8 livelli.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 font-mono text-xs">
            <IconRuler2 className="size-3.5" />
            Grid 4px Base
          </Badge>
        </div>
      </div>

      {/* Spacing Tokens */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold">1. Token di Spaziatura (Griglia 4px)</h3>
          <p className="text-xs text-muted-foreground">Margini, padding e gap per allineamento millimetrico.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[
            { token: "--space-1 / --spacing", px: "4px", rem: "0.25rem", widthClass: "w-1" },
            { token: "--space-2", px: "8px", rem: "0.50rem", widthClass: "w-2" },
            { token: "--space-3", px: "12px", rem: "0.75rem", widthClass: "w-3" },
            { token: "--space-4", px: "16px", rem: "1.00rem", widthClass: "w-4" },
            { token: "--space-5", px: "20px", rem: "1.25rem", widthClass: "w-5" },
            { token: "--space-6", px: "24px", rem: "1.50rem", widthClass: "w-6" },
          ].map((item) => (
            <div key={item.token} className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-semibold text-foreground block">{item.token}</span>
                <span className="text-[0.7rem] text-muted-foreground">{item.px} ({item.rem})</span>
              </div>
              <div className="h-6 bg-primary/20 border border-primary/40 rounded flex items-center justify-center relative overflow-hidden" style={{ width: item.px }}>
                <div className="h-full bg-primary w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Heights & Icons */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold">2. Dimensioni Controlli & Icone</h3>
          <p className="text-xs text-muted-foreground">Altezze standard per campi di input, bottoni e iconografia Tabler.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit font-mono text-xs">--control</Badge>
              <CardTitle className="text-sm font-semibold mt-2">Control Height Standard (32px / 2rem)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="text-muted-foreground">Altezza predefinita per Button, Input, Select e Badge attivi.</p>
              <div className="h-[var(--control)] px-3 rounded-lg border bg-primary text-primary-foreground flex items-center justify-between text-xs font-medium">
                <span>Input / Button Standard</span>
                <span className="font-mono text-[0.7rem]">32px</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit font-mono text-xs">--control-lg</Badge>
              <CardTitle className="text-sm font-semibold mt-2">Control Height Large (40px / 2.5rem)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="text-muted-foreground">Altezza per form in hero section o modali ad impatto visivo elevato.</p>
              <div className="h-[var(--control-lg)] px-4 rounded-lg border bg-secondary text-secondary-foreground flex items-center justify-between text-xs font-medium">
                <span>Control Large Surface</span>
                <span className="font-mono text-[0.7rem]">40px</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit font-mono text-xs">--icon</Badge>
              <CardTitle className="text-sm font-semibold mt-2">Dimensione Icona Standard (16px / 1rem)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="text-muted-foreground">Icone Tabler con stroke 1.5px / 2px integrate nei componenti.</p>
              <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconBox className="size-[var(--icon)] text-primary" />
                  <span className="text-xs font-medium">Icon Box Standard</span>
                </div>
                <span className="font-mono text-[0.7rem]">16x16px</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Border Radius System */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold">3. Raggi di Curvatura (`Border Radius`)</h3>
          <p className="text-xs text-muted-foreground">Curvature calibrate da sm smussato a pill circolare completo.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {[
            { name: "--radius-sm", value: "4px", classRadius: "rounded-sm" },
            { name: "--radius-md", value: "6px", classRadius: "rounded-md" },
            { name: "--radius-lg / --radius", value: "8px", classRadius: "rounded-lg" },
            { name: "--radius-xl", value: "12px", classRadius: "rounded-xl" },
            { name: "Full Pill", value: "999px", classRadius: "rounded-full" },
          ].map((item) => (
            <div key={item.name} className="p-4 rounded-xl border bg-card flex flex-col items-center justify-center text-center gap-3">
              <div className={`size-16 border-2 border-primary bg-primary/10 ${item.classRadius} flex items-center justify-center font-mono text-xs text-primary font-bold shadow-xs`}>
                {item.value}
              </div>
              <div>
                <span className="text-xs font-mono font-semibold block">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elevation & Shadows */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold">4. Elevazione & Sistema di Ombre (Depth Hierarchy)</h3>
          <p className="text-xs text-muted-foreground">Profondità visiva modulata da micro-ombre 2xs a sovrapposizioni 2xl.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { token: "--shadow-2xs", desc: "Perimetri e micro-card", style: "var(--shadow-2xs)" },
            { token: "--shadow-xs", desc: "Pulsanti e tag rialzati", style: "var(--shadow-xs)" },
            { token: "--shadow-sm", desc: "Card standard e tabelle", style: "var(--shadow-sm)" },
            { token: "--shadow-md", desc: "Dropdown menu e tooltip", style: "var(--shadow-md)" },
            { token: "--shadow-lg", desc: "Modali e dialoghi di sistema", style: "var(--shadow-lg)" },
            { token: "--shadow-xl", desc: "Pannelli laterali (Sheet)", style: "var(--shadow-xl)" },
            { token: "--shadow-2xl", desc: "Overlay ad alto contrasto", style: "var(--shadow-2xl)" },
          ].map((sh) => (
            <div
              key={sh.token}
              className="p-4 rounded-xl border bg-card flex flex-col justify-between h-28"
              style={{ boxShadow: sh.style }}
            >
              <div>
                <span className="text-xs font-mono font-semibold block">{sh.token}</span>
                <span className="text-[0.7rem] text-muted-foreground mt-1 block">{sh.desc}</span>
              </div>
              <div className="text-[0.65rem] font-mono text-muted-foreground/60">Shadow elevation token</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
