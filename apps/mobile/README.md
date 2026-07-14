# Mobile App

Contratto architetturale per una futura app nativa. Nessuno stack nativo viene introdotto in questa fase: l'esperienza mobile corrente appartiene alle superfici responsive di `apps/web` e `apps/workspace`.

## Contratto futuro

- riusare i ruoli cromatici e tipografici di Traccia Operativa senza copiare CSS web;
- preservare la sequenza `stato → oggetto → conseguenza → responsabile → prossima azione`;
- rendere il mobile sequenziale, non una compressione del desktop;
- mantenere vuoto indicizzato, traccia e terminale come grammatica, adattandoli alle convenzioni native;
- importare contratti condivisi da `packages/types` e utility condivise solo quando esistono.

## Confini

- niente Prisma o servizi server workspace;
- niente duplicazione di tipi dominio;
- niente geolocalizzazione continua, sorveglianza o funzionalità non approvate;
- nessuna promessa di parità nativa finché l'app non viene realmente avviata.
