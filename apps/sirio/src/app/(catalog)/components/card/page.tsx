import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@qoovex/ui/components/card";
import { Button } from "@qoovex/ui/components/button";

export default function CardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Card"
        description="Contenitore per raggruppare informazioni correlate."
        importPath="import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@qoovex/ui/components/card'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempio Base</h2>
          <SpecimenGrid cols={1}>
            <Specimen>
              <Card className="w-[350px]">
                <CardHeader>
                  <CardTitle>Crea progetto</CardTitle>
                  <CardDescription>Inserisci i dettagli del nuovo cantiere con un click.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Contenuto principale della card, ad esempio un form o dei dettagli informativi.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Annulla</Button>
                  <Button>Salva</Button>
                </CardFooter>
              </Card>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Casi d'uso</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Senza Footer">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Statistiche</CardTitle>
                  <CardDescription>Riepilogo mensile.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€ 4,500</div>
                </CardContent>
              </Card>
            </Specimen>
            <Specimen title="Solo Contenuto">
              <Card className="w-full">
                <CardContent className="pt-6">
                  <p className="text-sm">Un semplice contenitore con padding e bordo uniforme.</p>
                </CardContent>
              </Card>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
