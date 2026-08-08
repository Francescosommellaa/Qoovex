"use client";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Switch } from "@qoovex/ui/components/switch";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Skeleton } from "@qoovex/ui/components/skeleton";

export default function ControlsCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Controlli & Input Speciali"
        description="Checkbox, Switch, PasswordInput, OtpInput e indicatori di caricamento."
        importPath="import { Checkbox, Switch, PasswordInput, OtpInput, Spinner, Skeleton } from '@qoovex/ui/components/...'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Controlli d'Input</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Checkbox & Switch">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="check-1" defaultChecked />
                  <label htmlFor="check-1" className="text-sm font-medium leading-none cursor-pointer">
                    Condividi con il cliente
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="switch-1" defaultChecked />
                  <label htmlFor="switch-1" className="text-sm font-medium leading-none cursor-pointer">
                    Notifiche email attive
                  </label>
                </div>
              </div>
            </Specimen>

            <Specimen title="Password Input">
              <PasswordInput placeholder="Inserisci password sicura" className="w-full" />
            </Specimen>

            <Specimen title="OTP Input (Codice Verificatore)">
              <OtpInput length={6} className="w-full" />
            </Specimen>

            <Specimen title="Feedback (Spinner & Skeleton)">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                  <Spinner className="size-5" />
                  <span className="text-xs text-muted-foreground">Caricamento in corso...</span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
