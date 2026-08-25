"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Switch } from "@qoovex/ui/components/switch";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { RadioGroup, Radio, RadioCard } from "@qoovex/ui/components/radio-group";
import { Slider } from "@qoovex/ui/components/slider";
import { Toggle, ToggleGroup } from "@qoovex/ui/components/toggle";
import { ToggleButton } from "@qoovex/ui/components/toggle-button";
import { Button } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from "@tabler/icons-react";

export default function ControlsCatalogPage() {
  const [otpStatus, setOtpStatus] = React.useState<
    "default" | "success" | "error"
  >("default");
  const [otpValue, setOtpValue] = React.useState("");
  const [radioVal, setRadioVal] = React.useState("option-1");

  const handleComplete = (code: string) => {
    if (code === "123456") {
      setOtpStatus("success");
    } else {
      setOtpStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Controlli & Input Speciali"
        description="Checkbox, Switch, Radio, Toggle, Slider, PasswordInput e OtpInput con varianti di dimensione, colore e stati interattivi."
        importPath="import { Checkbox, Switch, RadioGroup, Toggle, Slider, OtpInput } from '@qoovex/ui/components/...'"
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="visual-state-contracts-title">
          <h2 id="visual-state-contracts-title" className="mb-4 text-2xl font-semibold tracking-tight">
            Stati fondamentali
          </h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Controlli selezionati" visualId="controls-checked">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="visual-checkbox-checked" defaultChecked />
                  <label htmlFor="visual-checkbox-checked" className="cursor-pointer text-sm font-medium leading-none">Checkbox selezionata</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="visual-switch-checked" defaultChecked />
                  <label htmlFor="visual-switch-checked" className="cursor-pointer text-sm font-medium leading-none">Switch attivo</label>
                </div>
                <RadioGroup defaultValue="selected">
                  <div className="flex items-center gap-2">
                    <Radio id="visual-radio-checked" value="selected" />
                    <label htmlFor="visual-radio-checked" className="cursor-pointer text-sm font-medium">Radio selezionata</label>
                  </div>
                </RadioGroup>
              </div>
            </Specimen>

            <Specimen title="Errore e stato disabilitato" visualId="controls-error">
              <div className="flex w-full max-w-sm flex-col gap-4">
                <Input aria-invalid="true" aria-label="Codice non valido" defaultValue="QX-13" />
                <Button variant="outline" data-visual-focus-target>
                  Target focus visibile
                </Button>
                <Button disabled>Operazione non disponibile</Button>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Checkbox ──────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Checkbox
          </h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Colori & Indeterminato">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="check-primary" defaultChecked color="primary" />
                  <label htmlFor="check-primary" className="text-sm font-medium leading-none cursor-pointer">Primary (default)</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-success" defaultChecked color="success" />
                  <label htmlFor="check-success" className="text-sm font-medium leading-none cursor-pointer">Success</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-destructive" defaultChecked color="destructive" />
                  <label htmlFor="check-destructive" className="text-sm font-medium leading-none cursor-pointer">Destructive</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-warning" defaultChecked color="warning" />
                  <label htmlFor="check-warning" className="text-sm font-medium leading-none cursor-pointer">Warning</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-indeterminate" indeterminate color="primary" />
                  <label htmlFor="check-indeterminate" className="text-sm font-medium leading-none cursor-pointer">Indeterminato (—)</label>
                </div>
              </div>
            </Specimen>

            <Specimen title="Dimensioni">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="check-sm" defaultChecked size="sm" />
                  <label htmlFor="check-sm" className="text-xs font-medium leading-none cursor-pointer">Small</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-md" defaultChecked size="default" />
                  <label htmlFor="check-md" className="text-sm font-medium leading-none cursor-pointer">Default</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-lg" defaultChecked size="lg" />
                  <label htmlFor="check-lg" className="text-base font-medium leading-none cursor-pointer">Large</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-disabled" disabled defaultChecked />
                  <label htmlFor="check-disabled" className="text-sm font-medium leading-none cursor-not-allowed opacity-60">Disabilitato</label>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Switch ────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Switch</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Colori">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="switch-primary" defaultChecked color="primary" />
                  <label htmlFor="switch-primary" className="text-sm font-medium leading-none cursor-pointer">Primary</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-success" defaultChecked color="success" />
                  <label htmlFor="switch-success" className="text-sm font-medium leading-none cursor-pointer">Success</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-destructive" defaultChecked color="destructive" />
                  <label htmlFor="switch-destructive" className="text-sm font-medium leading-none cursor-pointer">Destructive</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-warning" defaultChecked color="warning" />
                  <label htmlFor="switch-warning" className="text-sm font-medium leading-none cursor-pointer">Warning</label>
                </div>
              </div>
            </Specimen>

            <Specimen title="Dimensioni">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="switch-sm" defaultChecked size="sm" />
                  <label htmlFor="switch-sm" className="text-xs font-medium leading-none cursor-pointer">Small</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-md" defaultChecked size="default" />
                  <label htmlFor="switch-md" className="text-sm font-medium leading-none cursor-pointer">Default</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-lg" defaultChecked size="lg" />
                  <label htmlFor="switch-lg" className="text-base font-medium leading-none cursor-pointer">Large</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-disabled" disabled defaultChecked />
                  <label htmlFor="switch-disabled" className="text-sm font-medium leading-none cursor-not-allowed opacity-60">Disabilitato</label>
                </div>
              </div>
            </Specimen>

            <Specimen title="Stati">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="switch-state-unchecked" />
                  <label htmlFor="switch-state-unchecked" className="text-sm font-medium leading-none cursor-pointer">Unchecked</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-state-checked" defaultChecked />
                  <label htmlFor="switch-state-checked" className="text-sm font-medium leading-none cursor-pointer">Checked</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-state-disabled-unchecked" disabled />
                  <label htmlFor="switch-state-disabled-unchecked" className="text-sm font-medium leading-none cursor-not-allowed opacity-60">Disabled unchecked</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-state-disabled-checked" disabled defaultChecked />
                  <label htmlFor="switch-state-disabled-checked" className="text-sm font-medium leading-none cursor-not-allowed opacity-60">Disabled checked</label>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section aria-labelledby="physical-switch-title">
          <div className="mb-4">
            <h2 id="physical-switch-title" className="text-2xl font-semibold tracking-tight">Qoovex Physical Switch</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Physical response + continuous state travel.{" "}
              <Link href="/foundations/motion" data-link="quiet">
                Apri il contratto motion
              </Link>
              .
            </p>
          </div>
          <SpecimenGrid cols={2}>
            <Specimen title="Interactive default">
              <div className="flex items-center gap-2">
                <Switch id="switch-physical-interactive" />
                <label htmlFor="switch-physical-interactive" className="cursor-pointer text-sm font-medium leading-none">Attiva notifiche</label>
              </div>
            </Specimen>
            <Specimen title="State coverage">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="switch-physical-off" />
                  <label htmlFor="switch-physical-off" className="cursor-pointer text-sm font-medium leading-none">Disattivato</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-physical-on" defaultChecked />
                  <label htmlFor="switch-physical-on" className="cursor-pointer text-sm font-medium leading-none">Attivato</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-physical-disabled-off" disabled />
                  <label htmlFor="switch-physical-disabled-off" className="cursor-not-allowed text-sm font-medium leading-none opacity-60">Disabilitato</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-physical-disabled-on" disabled defaultChecked />
                  <label htmlFor="switch-physical-disabled-on" className="cursor-not-allowed text-sm font-medium leading-none opacity-60">Disabilitato</label>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── RadioGroup ──────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            RadioGroup
          </h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Radio Classici">
              <RadioGroup value={radioVal} onValueChange={setRadioVal}>
                <div className="flex items-center gap-2">
                  <Radio value="option-1" id="radio-1" />
                  <label htmlFor="radio-1" className="text-sm font-medium cursor-pointer">Opzione uno</label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio value="option-2" id="radio-2" />
                  <label htmlFor="radio-2" className="text-sm font-medium cursor-pointer">Opzione due</label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio value="option-3" id="radio-3" color="success" />
                  <label htmlFor="radio-3" className="text-sm font-medium cursor-pointer">Colore Success</label>
                </div>
              </RadioGroup>
            </Specimen>

            <Specimen title="Radio Card">
              <RadioGroup defaultValue="option-b" className="gap-2">
                <RadioCard value="option-a">
                  <div>
                    <p className="font-semibold">Opzione A</p>
                    <p className="text-muted-foreground text-xs">Esempio di scelta con una breve descrizione.</p>
                  </div>
                </RadioCard>
                <RadioCard value="option-b">
                  <div>
                    <p className="font-semibold">Opzione B</p>
                    <p className="text-muted-foreground text-xs">Esempio selezionato per mostrare lo stato attivo.</p>
                  </div>
                </RadioCard>
                <RadioCard value="option-c">
                  <div>
                    <p className="font-semibold">Opzione C</p>
                    <p className="text-muted-foreground text-xs">Esempio aggiuntivo per confrontare contenuti più lunghi.</p>
                  </div>
                </RadioCard>
              </RadioGroup>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Toggle ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Toggle & ToggleGroup
          </h2>
          <SpecimenGrid cols={2}>
            <Specimen title="ToggleButton standalone">
              <div className="flex flex-col gap-3">
                <ToggleButton aria-label="Grassetto" size="icon-sm">
                  <IconBold aria-hidden="true" />
                </ToggleButton>
                <span className="text-xs text-muted-foreground">La proof completa vive nella pagina ToggleButton.</span>
              </div>
            </Specimen>

            <Specimen title="ToggleGroup — Toolbar di Formattazione">
              <div className="flex flex-col gap-4">
                <div>
                  <span className="mb-1.5 block font-mono text-xs text-muted-foreground">
                    Stile testo
                  </span>
                  <ToggleGroup multiple variant="outline" size="icon-sm">
                    <Toggle aria-label="Bold" value="bold">
                      <IconBold aria-hidden="true" />
                    </Toggle>
                    <Toggle aria-label="Italic" value="italic">
                      <IconItalic aria-hidden="true" />
                    </Toggle>
                    <Toggle aria-label="Underline" value="underline">
                      <IconUnderline aria-hidden="true" />
                    </Toggle>
                    <Toggle aria-label="Strikethrough" value="strikethrough">
                      <IconStrikethrough aria-hidden="true" />
                    </Toggle>
                  </ToggleGroup>
                </div>
                <div>
                  <span className="mb-1.5 block font-mono text-xs text-muted-foreground">
                    Allineamento
                  </span>
                  <ToggleGroup variant="outline" size="icon-sm">
                    <Toggle aria-label="Align left" value="left">
                      <IconAlignLeft aria-hidden="true" />
                    </Toggle>
                    <Toggle aria-label="Align center" value="center">
                      <IconAlignCenter aria-hidden="true" />
                    </Toggle>
                    <Toggle aria-label="Align right" value="right">
                      <IconAlignRight aria-hidden="true" />
                    </Toggle>
                  </ToggleGroup>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Slider ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Slider
          </h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Colori & Tooltip">
              <div className="flex flex-col gap-6 py-2">
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">Primary (tooltip on hover)</span>
                  <Slider defaultValue={40} color="primary" showTooltip />
                </div>
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">Success</span>
                  <Slider defaultValue={65} color="success" showValue />
                </div>
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">Destructive</span>
                  <Slider defaultValue={80} color="destructive" showValue />
                </div>
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">Warning</span>
                  <Slider defaultValue={30} color="warning" showValue />
                </div>
              </div>
            </Specimen>

            <Specimen title="Dimensioni">
              <div className="flex flex-col gap-6 py-2">
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">size="sm"</span>
                  <Slider defaultValue={50} size="sm" showValue />
                </div>
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">size="default"</span>
                  <Slider defaultValue={50} size="default" showValue />
                </div>
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">size="lg"</span>
                  <Slider defaultValue={50} size="lg" showValue />
                </div>
                <div>
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">Disabilitato</span>
                  <Slider defaultValue={50} disabled showValue />
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── OTP Input ───────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            OTP Input
          </h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Verifica Codice (123456 = Ok, altro = Errore)">
              <div className="flex min-w-0 w-full flex-col items-center gap-3 py-2">
                <div
                  className="w-full overflow-x-auto rounded-md px-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="region"
                  aria-label="Codice di verifica a sei cifre"
                  tabIndex={0}
                >
                  <div className="mx-auto w-max">
                    <OtpInput
                      length={6}
                      status={otpStatus}
                      value={otpValue}
                      onValueChange={(val) => {
                        setOtpValue(val);
                        if (otpStatus !== "default") setOtpStatus("default");
                      }}
                      onComplete={handleComplete}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setOtpValue("123456"); setOtpStatus("success"); }}>
                    Prova Ok
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setOtpValue("999999"); setOtpStatus("error"); }}>
                    Prova Errore
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setOtpValue(""); setOtpStatus("default"); }}>
                    Reset
                  </Button>
                </div>
              </div>
            </Specimen>

            <Specimen title="Dimensioni & PIN Mascherato">
              <div className="flex min-w-0 w-full flex-col gap-5 py-1">
                <div>
                  <span className="mb-1.5 block font-mono text-xs text-muted-foreground">size="sm"</span>
                  <div className="w-full overflow-x-auto pb-2"><div className="w-max"><OtpInput length={6} size="sm" /></div></div>
                </div>
                <div>
                  <span className="mb-1.5 block font-mono text-xs text-muted-foreground">size="lg"</span>
                  <div className="w-full overflow-x-auto pb-2"><div className="w-max"><OtpInput length={6} size="lg" /></div></div>
                </div>
                <div>
                  <span className="mb-1.5 block font-mono text-xs text-muted-foreground">PIN mascherato (4 cifre)</span>
                  <OtpInput length={4} mask groupSeparator={false} />
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Password Input ──────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Password Input
          </h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Password con toggle visibilità">
              <div className="max-w-sm">
                <PasswordInput placeholder="Inserisci password sicura" className="w-full" />
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
