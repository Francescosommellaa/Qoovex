import { IconAlertTriangle, IconCheck, IconClock } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@qoovex/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@qoovex/ui/components/tabs";

const items = [
  { context: "Cantiere Aurora", state: "Da verificare", icon: IconClock, action: "Controlla scadenza" },
  { context: "Squadra impianti", state: "Mancante", icon: IconAlertTriangle, action: "Richiedi prova" },
  { context: "Pacchetto accessi", state: "Pronto per revisione", icon: IconCheck, action: "Apri pacchetto" },
];

export function MarketingDashboardPreview() {
  return (
    <div
      aria-label="Anteprima interattiva della dashboard Qoovex"
      className="min-w-0 p-4 sm:p-6"
      data-selection="none"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Oggi</p><h2 className="text-xl font-semibold tracking-tight">Situazioni operative</h2></div>
        <Badge variant="outline">Dati dimostrativi</Badge>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[['Presenti', '18'], ['Da verificare', '6'], ['Mancanti', '3']].map(([label, value]) => (
          <Card size="sm" key={label}><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>
        ))}
      </div>
      <Tabs defaultValue="priorita">
        <TabsList><TabsTrigger value="priorita">Priorità</TabsTrigger><TabsTrigger value="recenti">Recenti</TabsTrigger></TabsList>
        <TabsContent value="priorita">
          <Card className="mt-3">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Contesto</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Azione</TableHead></TableRow></TableHeader>
                <TableBody>
                  {items.map(({ action, context, icon: Icon, state }) => (
                    <TableRow key={context}><TableCell className="font-medium">{context}</TableCell><TableCell><Badge variant="outline"><Icon />{state}</Badge></TableCell><TableCell className="text-right text-muted-foreground">{action}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recenti"><Card className="mt-3"><CardHeader><CardTitle>Attività recenti</CardTitle><CardDescription>La vista mantiene contesto, stato e prossima azione nello stesso spazio.</CardDescription></CardHeader></Card></TabsContent>
      </Tabs>
    </div>
  );
}
