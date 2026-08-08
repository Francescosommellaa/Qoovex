import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@qoovex/ui/components/dialog";
import { Button } from "@qoovex/ui/components/button";

export default function DialogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Dialog"
        description="Finestra modale che interrompe il flusso per chiedere un'azione o mostrare informazioni critiche."
        importPath="import { Dialog, DialogTrigger, DialogContent, ... } from '@qoovex/ui/components/dialog'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempio Base</h2>
          <SpecimenGrid cols={1}>
            <Specimen>
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  Apri Dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sei sicuro?</DialogTitle>
                    <DialogDescription>
                      Questa azione non può essere annullata. Rimuoverà definitivamente il record dai nostri server.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm">Altro contenuto informativo qui...</p>
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Annulla
                    </DialogClose>
                    <Button variant="destructive">Conferma eliminazione</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
