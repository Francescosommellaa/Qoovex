# Dashboard support

`/dashboard` e la route compatibile della Panoramica exception-driven. `DashboardOverviewView` chiarisce che il motore applica regole deterministiche e che l'IA non e attiva; separa `Cosa serve da te` da `Cosa ha fatto Qoovex`. Ogni intervento presenta fatto, scelta richiesta e una sola azione. I parametri `?view=` legacy non controllano piu la pagina.

La cartella conserva anche `DashboardAssignmentDialog`, riusato dalle viste cantiere per assegnazioni contestuali. Il Dialog usa endpoint e permessi esistenti, mantiene loading/vuoto/errore/successo e non concede nuovi scope.

Non aggiungere qui una seconda dashboard, query Prisma, auth, policy server-side o primitive UI generiche. La foundation visuale proviene da `@qoovex/ui` e resta invariata.
