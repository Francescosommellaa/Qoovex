"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldError } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { Input } from "@qoovex/ui/components/input";
import { CompositeInput, InputAddon } from "@qoovex/ui/components/composite-input";
import { PhoneInput } from "@qoovex/ui/components/phone-input";
import { CurrencyInput } from "@qoovex/ui/components/currency-input";
import { UrlInput } from "@qoovex/ui/components/url-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@qoovex/ui/components/select";

const states = [
  { value: "editable", label: "Modificabile" },
  { value: "readonly", label: "Sola lettura" },
  { value: "disabled", label: "Disabilitato" },
  { value: "invalid", label: "Da verificare" },
];

export default function CompositeInputPage() {
  const [mode, setMode] = useState<string | null>("editable");
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fixedError, setFixedError] = useState<string | null>(null);
  const availability = { disabled: mode === "disabled", readOnly: mode === "readonly", "aria-invalid": mode === "invalid" || undefined };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageHeader title="Composite Input" description="Telefono, valuta e URL: un unico campo con prefisso o suffisso. Controlli di formato essenziali, senza conversioni o verifiche esterne."
        importPath={'import { CompositeInput, InputAddon } from "@qoovex/ui/components/composite-input";'} />
      <div className="flex flex-wrap items-center gap-3">
        <label id="addon-state-label" className="text-sm font-medium">Stato dei campi</label>
        <Select value={mode} onValueChange={setMode} items={states}>
          <SelectTrigger aria-labelledby="addon-state-label"><SelectValue /></SelectTrigger>
          <SelectContent>{states.map((state) => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <SpecimenGrid cols={2}>
        <Specimen title="Telefono" visualId="sirio-prefix-phone">
          <form className="w-full">
            <Field data-invalid={availability["aria-invalid"]}>
              <Label htmlFor="prefix-phone">Numero di telefono</Label>
              <PhoneInput {...availability} id="prefix-phone" name="phone" countryName="country" autoComplete="tel-national" onValidationChange={setPhoneError}
                placeholder="Numero nazionale" aria-describedby={`prefix-phone-help${phoneError || availability["aria-invalid"] ? " prefix-phone-error" : ""}`} />
              <FieldDescription id="prefix-phone-help">Cambia paese e digita. Prefisso e numero restano valori separati.</FieldDescription>
              {(phoneError || availability["aria-invalid"]) && <FieldError id="prefix-phone-error">{phoneError ?? "Numero da verificare — stato dimostrativo."}</FieldError>}
            </Field>
          </form>
        </Specimen>
        <Specimen title="Valuta" visualId="sirio-prefix-currency">
          <form className="w-full space-y-4">
            <Field data-invalid={availability["aria-invalid"]}>
              <Label htmlFor="prefix-currency">Importo</Label>
              <CurrencyInput {...availability} id="prefix-currency" name="amount" currencyName="currency" locale="it-IT" defaultCurrency="EUR"
                value={amount} onChange={(event) => setAmount(event.target.value)} onValidationChange={setCurrencyError} placeholder="0,00" aria-describedby={`prefix-currency-help${currencyError || availability["aria-invalid"] ? " prefix-currency-error" : ""}`} />
              <FieldDescription id="prefix-currency-help">Scrivi 1250,5: uscendo diventa 1.250,50. Cambiare valuta non converte l’importo.</FieldDescription>
              {(currencyError || availability["aria-invalid"]) && <FieldError id="prefix-currency-error">{currencyError ?? "Importo da verificare — stato dimostrativo."}</FieldError>}
            </Field>
            <Button type="button" size="sm" variant="ghost" disabled={availability.disabled || availability.readOnly} onClick={() => setAmount("1250,50")}>Inserisci esempio</Button>
          </form>
        </Specimen>
      </SpecimenGrid>
      <Specimen title="Valuta unica · importo precompilato" visualId="sirio-currency-fixed">
        <form className="w-full max-w-sm">
          <Field>
            <Label htmlFor="fixed-currency">Costo previsto</Label>
            <CurrencyInput {...availability} id="fixed-currency" name="fixedAmount" currencyName="fixedCurrency"
              currencies={[{ code: "EUR", symbol: "€", name: "Euro" }]} defaultCurrency="EUR" defaultValue="1250,5"
              min={0} max={1000000} placeholder="0,00" onValidationChange={setFixedError}
              aria-describedby={`fixed-currency-help${fixedError ? " fixed-currency-error" : ""}`} />
            <FieldDescription id="fixed-currency-help">Una sola valuta consentita: simbolo statico, nessun menu. Il valore iniziale è fornito dall’app.</FieldDescription>
            {fixedError && <FieldError id="fixed-currency-error">{fixedError}</FieldError>}
          </Field>
        </form>
      </Specimen>
      <Specimen title="URL con protocollo fisso" visualId="sirio-input-addons-url">
        <form className="w-full space-y-4" onSubmit={(event) => {
          event.preventDefault();
          const domain = new FormData(event.currentTarget).get("domain");
          setPreview(domain ? `https://${domain}` : "");
        }}>
          <Field data-invalid={availability["aria-invalid"]}>
            <Label htmlFor="addon-domain" required>Dominio o percorso</Label>
            <UrlInput {...availability} id="addon-domain" name="domain" onValidationChange={setUrlError}
              aria-describedby={`addon-domain-help${urlError || availability["aria-invalid"] ? " addon-domain-error" : ""}`} placeholder="esempio.test" required onChange={() => setPreview("")} />
            <FieldDescription id="addon-domain-help">Protocollo HTTPS. Il campo contiene solo dominio e percorso; questa demo aggiunge il protocollo all’anteprima.</FieldDescription>
            {(urlError || availability["aria-invalid"]) && <FieldError id="addon-domain-error">{urlError ?? "URL da verificare — stato dimostrativo."}</FieldError>}
          </Field>
          <Button type="submit" size="sm" variant="secondary" disabled={availability.disabled}>Anteprima URL</Button>
          <output className="block min-h-6 break-all text-sm text-muted-foreground" aria-live="polite" aria-label="URL composto dal consumer">{preview}</output>
        </form>
      </Specimen>
      <Specimen title="Suffisso statico" visualId="sirio-input-addons-suffix">
        <Field className="w-full max-w-sm">
          <Label htmlFor="addon-share">Percentuale</Label>
          <CompositeInput data-addon-proof="suffix">
            <Input {...availability} id="addon-share" inputMode="decimal" placeholder="25" aria-describedby="addon-share-help" />
            <InputAddon aria-hidden="true">%</InputAddon>
          </CompositeInput>
          <FieldDescription id="addon-share-help">Valore espresso in percentuale. Il simbolo è statico e non viene aggiunto al valore.</FieldDescription>
        </Field>
      </Specimen>
      <Specimen title="Prefisso e suffisso · stima percentuale">
        <Field className="w-full max-w-sm">
          <Label htmlFor="addon-estimate">Avanzamento stimato</Label>
          <CompositeInput data-addon-proof="both">
            <InputAddon aria-hidden="true">≈</InputAddon>
            <Input {...availability} id="addon-estimate" inputMode="decimal" placeholder="25" aria-describedby="addon-estimate-help" />
            <InputAddon aria-hidden="true">%</InputAddon>
          </CompositeInput>
          <FieldDescription id="addon-estimate-help">Percentuale approssimativa. I simboli non fanno parte del valore inserito.</FieldDescription>
        </Field>
      </Specimen>
    </div>
  );
}
