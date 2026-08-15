"use client";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@qoovex/ui/components/select";

export default function SelectCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Select"
        description="Menu a discesa per la selezione di valori singoli in form e filtri."
        importPath="import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@qoovex/ui/components/select'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempi di Selezione</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Stato Cantiere" visualId="select-open">
              <Select defaultValue="ACTIVE">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Stati Operativi</SelectLabel>
                    <SelectItem value="DRAFT">Bozza</SelectItem>
                    <SelectItem value="WAITING_FOR_CLIENT">In attesa del cliente</SelectItem>
                    <SelectItem value="ACTIVE">Attivo</SelectItem>
                    <SelectItem value="CLOSURE_PROPOSED">Chiusura proposta</SelectItem>
                    <SelectItem value="CLOSED">Chiuso</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Specimen>

            <Specimen title="Tipo di Richiesta">
              <Select defaultValue="CHANGE">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo richiesta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Informazione</SelectItem>
                  <SelectItem value="CHANGE">Modifica Lavorazione</SelectItem>
                  <SelectItem value="PAYMENT">Richiesta di Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
