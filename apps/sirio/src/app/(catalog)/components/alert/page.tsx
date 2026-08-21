import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import {
  IconInfoCircle,
  IconCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconX,
  IconExternalLink,
} from "@tabler/icons-react";

export default function AlertCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Alert"
        description="Messaggi di avviso contestuali in linea con il design system canonico di Qoovex."
        importPath="import { Alert, AlertTitle, AlertDescription, AlertAction } from '@qoovex/ui/components/alert'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Varianti Semantiche Canoniche ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti Semantiche</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Info / Aggiornamento del lavoro">
              <Alert variant="info" className="w-full">
                <IconInfoCircle />
                <div>
                  <AlertTitle>Nuovo aggiornamento</AlertTitle>
                  <AlertDescription>
                    È stato aggiunto un aggiornamento alla cronologia del lavoro.
                  </AlertDescription>
                </div>
              </Alert>
            </Specimen>

            <Specimen title="Success / Modifica accettata">
              <Alert variant="success" className="w-full">
                <IconCheck />
                <div>
                  <AlertTitle>Modifica accettata</AlertTitle>
                  <AlertDescription>
                    La controparte ha accettato la proposta. Puoi consultare il riepilogo aggiornato.
                  </AlertDescription>
                </div>
              </Alert>
            </Specimen>

            <Specimen title="Warning / In Attesa">
              <Alert variant="warning" className="w-full">
                <IconAlertTriangle />
                <div>
                  <AlertTitle>In Attesa di Risposta</AlertTitle>
                  <AlertDescription>
                    La richiesta di modifica è in attesa di una risposta della controparte.
                  </AlertDescription>
                </div>
              </Alert>
            </Specimen>

            <Specimen title="Destructive / Blocco Operativo" visualId="alert-error">
              <Alert variant="destructive" className="w-full">
                <IconAlertOctagon />
                <div>
                  <AlertTitle>Azione Bloccata</AlertTitle>
                  <AlertDescription>
                    Questa azione non è disponibile nello stato attuale del lavoro.
                  </AlertDescription>
                </div>
              </Alert>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Alert con Azioni Integrate ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Alert con Azioni e Pulsanti</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Alert Interattivo con Pulsanti d'Azione">
              <div className="w-full max-w-2xl">
                <Alert variant="info" className="w-full">
                  <IconInfoCircle />
                  <div>
                    <AlertTitle>Modifica da valutare</AlertTitle>
                    <AlertDescription>
                      Apri la proposta per vedere cosa cambia e decidere come procedere.
                    </AlertDescription>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="default">
                        Apri proposta
                      </Button>
                      <Button size="sm" variant="ghost">
                        Dettagli <IconExternalLink className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <AlertAction>
                    <Button size="icon-xs" variant="ghost" className="text-muted-foreground hover:text-foreground">
                      <IconX className="h-3.5 w-3.5" />
                      <span className="sr-only">Chiudi</span>
                    </Button>
                  </AlertAction>
                </Alert>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
