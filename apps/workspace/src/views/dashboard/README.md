# Dashboard View

Componenti app-local per la dashboard operativa mobile-first del workspace. La dashboard e una coda decisionale: stato, oggetto, conseguenza, responsabile e prossima azione restano nello stesso contesto.

La composizione usa esclusivamente primitive canoniche `@qoovex/ui`; il CSS module locale e limitato a motion di ingresso, hover su puntatore fine e feedback dell'elemento aggiornato, con fallback reduced-motion e forced-colors.

Questa cartella puo contenere:

- componenti specifici della dashboard;
- CSS module specifici della dashboard;
- mapping visuale di stati e copy operativo.

Il payload server-side e situation-centric, limita la coda principale a cinque elementi e separa pacchetti pronti, prossime scadenze e contesti. Gli errori non autorizzativi restano circoscritti alla sezione; auth, Azienda e permessi restano gate di pagina.

Per OWNER e ADMIN, una risorsa senza responsabile apre `DashboardAssignmentDialog`: le opzioni vengono caricate da una route protetta e l'assegnazione usa gli endpoint esistenti per collegamenti lavoratore-utente o responsabile-cantiere. Il Dialog conserva la route `/dashboard`, mostra loading, vuoto, errore e successo e rimanda alla pagina completa Accessi operativi soltanto come scelta secondaria.

Non deve contenere:

- query Prisma;
- auth o policy server-side;
- primitive UI generiche riusabili tra app;
- copy che promette conformita, certificazione o validita legale.
