# Dashboard View

Componenti app-local per la dashboard operativa mobile-first del workspace. La dashboard e una coda decisionale: stato, oggetto, conseguenza, responsabile e prossima azione restano nello stesso contesto.

Questa cartella puo contenere:

- componenti specifici della dashboard;
- CSS module specifici della dashboard;
- mapping visuale di stati e copy operativo.

Il payload server-side e situation-centric, limita la coda principale a cinque elementi e separa pacchetti pronti, prossime scadenze e contesti. Gli errori non autorizzativi restano circoscritti alla sezione; auth, Azienda e permessi restano gate di pagina.

Non deve contenere:

- query Prisma;
- auth o policy server-side;
- primitive UI generiche riusabili tra app;
- copy che promette conformita, certificazione o validita legale.
