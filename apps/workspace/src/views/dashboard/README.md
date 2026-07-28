# Dashboard support

`/dashboard` e la route compatibile del Centro operativo. La composizione principale vive in `src/views/operational-center`.

Questa cartella conserva soltanto `DashboardAssignmentDialog`, ancora riusato dalle viste cantiere per assegnazioni contestuali. Il Dialog usa endpoint e permessi esistenti, mantiene loading/vuoto/errore/successo e non concede nuovi scope.

Non aggiungere qui una seconda dashboard, query Prisma, auth, policy server-side o primitive UI generiche. La foundation visuale proviene da `@qoovex/ui` e resta invariata.
