"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Field, FieldLabel, FieldDescription, FieldError, FieldContent } from "@qoovex/ui/components/field";
import {
  Input,
  InputGroup,
  InputAddon,
  InputIcon,
  PasswordInput,
  SearchInput,
  PhoneInput,
  CurrencyInput,
  NumberInput,
  OTPInput,
  DatePickerInput,
  TimePickerInput,
} from "@qoovex/ui/components/input";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconWorld,
  IconAt,
  IconSearch,
} from "@tabler/icons-react";

export default function FieldPage() {
  const [searchValue, setSearchValue] = useState("Ristrutturazione Via Roma");
  const [phoneVal, setPhoneVal] = useState("334 567 8901");
  const [currencyVal, setCurrencyVal] = useState("45000,00");
  const [numberVal, setNumberVal] = useState(4);
  const [otpVal, setOtpVal] = useState("894210");
  const [dateVal, setDateVal] = useState("2026-08-10");
  const [timeVal, setTimeVal] = useState("09:30");
  const [comboboxQuery, setComboboxQuery] = useState("");
  const [isComboOpen, setIsComboOpen] = useState(false);

  const cities = ["Roma - Via Flaminia 42", "Milano - Corso Buenos Aires 12", "Torino - Via Po 8", "Napoli - Via Toledo 15"];
  const filteredCities = cities.filter((c) => c.toLowerCase().includes(comboboxQuery.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Field & Varianti di Input"
        description="Raccolta completa di tutte le 15 varianti dei campi form: Testo, Email, Password, Ricerca senza doppia X, Telefono con Dropdown Prefissi, URL, Numero senza freccette native, Valuta con Selettore, DatePicker personalizzato, TimePicker, Data/Ora, Codice OTP, Username, Indirizzo ed Autocomplete."
        importPath="import { Field, FieldLabel, FieldDescription, FieldError } from '@qoovex/ui/components/field'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Input Testuali & Credenziali ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">1. Testo, Email, Password & Username</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="1. Text — Testo Generico" visualId="field-default">
              <Field className="w-full">
                <FieldLabel htmlFor="field-text">Nome Cantiere</FieldLabel>
                <Input id="field-text" placeholder="es. Ristrutturazione Impianti" />
                <FieldDescription>Nome identificativo del progetto.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="Stato di errore" visualId="field-error">
              <Field className="w-full">
                <FieldLabel htmlFor="field-error">Codice cantiere</FieldLabel>
                <Input id="field-error" aria-invalid="true" defaultValue="QX-13" />
                <FieldError>Il codice cantiere non è valido.</FieldError>
              </Field>
            </Specimen>

            <Specimen title="2. Email">
              <Field className="w-full">
                <FieldLabel htmlFor="field-email">Indirizzo Email</FieldLabel>
                <div className="relative w-full">
                  <InputIcon position="left">
                    <IconMail />
                  </InputIcon>
                  <Input id="field-email" type="email" placeholder="mario.rossi@impresa.it" className="pl-9" />
                </div>
                <FieldDescription>Riceverà le conferme degli accordi.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="3. Password (con Toggle Mostra/Nascondi)">
              <Field className="w-full">
                <FieldLabel htmlFor="field-password">Password di Accesso</FieldLabel>
                <PasswordInput id="field-password" placeholder="••••••••••••" />
                <FieldDescription>Minimo 8 caratteri con lettere e numeri.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="13. Username">
              <Field className="w-full">
                <FieldLabel htmlFor="field-username">Username Operatore</FieldLabel>
                <InputGroup>
                  <InputAddon position="left">@</InputAddon>
                  <Input id="field-username" placeholder="mario_rossi_89" className="rounded-l-none" />
                </InputGroup>
                <FieldDescription>Identificatore unico del tecnico sul campo.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Ricerca, Contatti & Web ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">2. Ricerca (Singola X), Telefono con Dropdown Prefissi, URL & Indirizzo</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="4. Search (Nessuna doppia X)">
              <Field className="w-full">
                <FieldLabel htmlFor="field-search">Ricerca Cantiere</FieldLabel>
                <SearchInput
                  id="field-search"
                  placeholder="Cerca per codice o nome..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue("")}
                />
                <FieldDescription>Rimossa la X nativa del browser per evitare doppie icone.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="5. Telephone (Dropdown con Cerca Prefissi Nazione)">
              <Field className="w-full">
                <FieldLabel htmlFor="field-phone">Telefono di Contatto</FieldLabel>
                <PhoneInput
                  id="field-phone"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  defaultCountry="IT"
                />
                <FieldDescription>Seleziona la bandiera/prefisso con ricerca integrata e digita il numero.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="6. URL (Prefisso https://)">
              <Field className="w-full">
                <FieldLabel htmlFor="field-url">Sito Web Impresa / Documentazione</FieldLabel>
                <InputGroup>
                  <InputAddon position="left">https://</InputAddon>
                  <Input id="field-url" type="url" placeholder="impresa.it/cantiere-89" className="rounded-l-none" />
                </InputGroup>
              </Field>
            </Specimen>

            <Specimen title="14. Address (Indirizzo Cantiere)">
              <Field className="w-full">
                <FieldLabel htmlFor="field-address">Indirizzo di Cantiere</FieldLabel>
                <div className="relative w-full">
                  <InputIcon position="left">
                    <IconMapPin />
                  </InputIcon>
                  <Input id="field-address" placeholder="Via Roma 42, 00100 Roma RM" className="pl-9" />
                </div>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 3: Numeri, Valuta & Date ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">3. Numeri (Senza Freccette Native), Valuta (Selettore) & DatePicker Custom</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="7. Number (Pulsanti +/- Puliti senza Freccette Native)">
              <Field className="w-full">
                <FieldLabel>Numero Operatori Assegnati</FieldLabel>
                <NumberInput value={numberVal} min={1} max={20} onChangeValue={setNumberVal} />
                <FieldDescription>Freccette spinner del browser rimosse a favore dei bottoni +/-.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="8. Decimal / Currency (Selettore Valuta Funzionante)">
              <Field className="w-full">
                <FieldLabel htmlFor="field-currency">Importo Lavorazione (€ / $ / £)</FieldLabel>
                <CurrencyInput
                  id="field-currency"
                  value={currencyVal}
                  onChange={(e) => setCurrencyVal(e.target.value)}
                  defaultCurrency="EUR"
                />
                <FieldDescription>Clicca sul simbolo valuta per cambiare tra EUR, USD, GBP, CHF, JPY.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="9. Date & 10. Time (DatePicker e TimePicker Custom)">
              <div className="grid grid-cols-2 gap-3 w-full">
                <Field>
                  <FieldLabel>9. Data Inizio</FieldLabel>
                  <DatePickerInput value={dateVal} onChangeDate={setDateVal} />
                </Field>
                <Field>
                  <FieldLabel>10. Ora Inizio</FieldLabel>
                  <TimePickerInput value={timeVal} onChangeTime={setTimeVal} />
                </Field>
              </div>
            </Specimen>

            <Specimen title="11. Date & Time (Data e Ora Combinati)">
              <div className="grid grid-cols-2 gap-3 w-full">
                <Field>
                  <FieldLabel>11a. Data Sopralluogo</FieldLabel>
                  <DatePickerInput value={dateVal} onChangeDate={setDateVal} />
                </Field>
                <Field>
                  <FieldLabel>11b. Ora Sopralluogo</FieldLabel>
                  <TimePickerInput value={timeVal} onChangeTime={setTimeVal} />
                </Field>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 4: Codice OTP & Autocomplete Combobox ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">4. Codice OTP / Verifica & Autocomplete Combobox</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="12. OTP / Codice di Verifica">
              <Field className="w-full">
                <FieldLabel>Codice di Verifica OTP (6 cifre)</FieldLabel>
                <OTPInput length={6} value={otpVal} onChangeOTP={setOtpVal} className="mt-1" />
                <FieldDescription>Inserisci il codice ricevuto via SMS per autorizzare la firma.</FieldDescription>
              </Field>
            </Specimen>

            <Specimen title="15. Autocomplete / Combobox Input">
              <Field className="w-full">
                <FieldLabel>Autocomplete Sede Cantiere</FieldLabel>
                <div className="relative w-full">
                  <Input
                    placeholder="Digita città o indirizzo..."
                    value={comboboxQuery}
                    onChange={(e) => {
                      setComboboxQuery(e.target.value);
                      setIsComboOpen(true);
                    }}
                    onFocus={() => setIsComboOpen(true)}
                  />
                  {isComboOpen && filteredCities.length > 0 ? (
                    <div className="absolute top-full left-0 mt-1 z-50 w-full rounded-xl border border-border bg-popover p-1 shadow-lg backdrop-blur-md">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className="w-full text-left px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-accent hover:text-accent-foreground font-medium"
                          onClick={() => {
                            setComboboxQuery(city);
                            setIsComboOpen(false);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <FieldDescription>Seleziona una sede attiva nell'elenco.</FieldDescription>
              </Field>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
