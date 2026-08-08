import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Tooltip, TooltipTrigger, TooltipContent } from "@qoovex/ui/components/tooltip";
import { Button } from "@qoovex/ui/components/button";
import { IconInfoCircle } from "@tabler/icons-react";

export default function TooltipCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Tooltip"
        description="Micro-etichetta informativa visualizzata all'hover o al focus di un elemento."
        importPath="import { Tooltip, TooltipTrigger, TooltipContent } from '@qoovex/ui/components/tooltip'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Posizionamenti</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Informazioni Azione">
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="icon" />}>
                  <IconInfoCircle className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Visualizza dettagli delega economica
                </TooltipContent>
              </Tooltip>
            </Specimen>

            <Specimen title="Con Scorciatoia / Testo">
              <Tooltip>
                <TooltipTrigger render={<Button variant="secondary" />}>
                  Export Dati
                </TooltipTrigger>
                <TooltipContent>
                  Scarica archivio ZIP autenticato
                </TooltipContent>
              </Tooltip>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
