# Initial Work Plan

Questo piano divide il reset in task piccoli. Non richiede implementazione completa del prodotto in un unico intervento.

## Blocco 1 - Reset documentazione e brain operativo

- Obiettivo: rendere il nuovo posizionamento la fonte primaria.
- File/cartelle coinvolte: `/docs`, README root, project brain, vault operativo via MCP.
- Rischi: vecchie note ancora indicizzate possono riportare Codex al dominio precedente.
- Dipendenze: decisione esplicita del proprietario sul nuovo dominio.
- Serve dal proprietario: conferma che i documenti numerati sono canonici.
- Output atteso: docs 00-08 e documenti legacy marcati come non canonici.

## Blocco 2 - Bonifica naming e ruoli

- Obiettivo: mantenere ruoli e permessi coerenti con `Organization`, documenti, cantieri, checklist, prove e pacchetti.
- File/cartelle coinvolte: `packages/types`, `packages/db`, `apps/workspace/src/shared/server`.
- Rischi: migrazioni e policy auth possono rompersi se rinominate senza piano DB.
- Dipendenze: scelta nomi definitivi per azienda/organizzazione e ruoli.
- Serve dal proprietario: conferma ruoli MVP e significato di ogni permesso.
- Output atteso: piano tecnico di migrazione e poi PR separata.
- Criteri di completamento: nessun ruolo legacy in type, schema, policy, test o email.

## Blocco 3 - Modello dominio MVP

- Obiettivo: definire entita minime per aziende, lavoratori, cantieri, documenti, scadenze e pacchetti.
- File/cartelle coinvolte: docs di architettura, `packages/types`, futuro schema DB.
- Rischi: modello troppo complesso o troppo normativo.
- Dipendenze: research requests sui dati minimi e sulle liste documentali.
- Serve dal proprietario: esempi reali anonimizzati e priorita MVP.
- Output atteso: specifica dati MVP senza normative inventate.
- Criteri di completamento: ogni entita ha scopo, campi minimi e ownership chiara.

## Blocco 4 - API documenti e scadenze

- Obiettivo: aggiungere backend per upload metadata, stato documentale e promemoria.
- File/cartelle coinvolte: `apps/workspace`, `packages/db`, `packages/types`.
- Rischi: gestione file, privacy e scadenze sensibili.
- Dipendenze: storage scelto, policy permessi, definizione stati.
- Serve dal proprietario: priorita tra archivio generico e template documentali.
- Output atteso: API server-side protette e testate.
- Criteri di completamento: documenti caricabili, collegabili e filtrabili per stato.

## Blocco 5 - Condivisione pacchetto documentale

- Obiettivo: creare pacchetti pronti per revisione e link viewer revocabili.
- File/cartelle coinvolte: `apps/workspace`, modello permessi, email/link sharing.
- Rischi: esposizione eccessiva di dati personali.
- Dipendenze: regole privacy e durata link.
- Serve dal proprietario: esempi di pacchetto e dati da escludere.
- Output atteso: pacchetto con indice, stato e accesso viewer limitato.
- Criteri di completamento: il viewer vede solo cio che e stato condiviso.

## Blocco 6 - Mobile-first UI successiva

- Obiettivo: costruire interfacce semplici per caricamento, checklist, prove e stati.
- File/cartelle coinvolte: app web/workspace e futura app mobile.
- Rischi: UI troppo da gestionale desktop o troppo complessa.
- Dipendenze: design direction e flussi prioritari.
- Serve dal proprietario: priorita prima schermata e benchmark di usabilita.
- Output atteso: prototipo mobile-first con dashboard stato documentale.
- Criteri di completamento: utente capisce cosa manca, cosa scade e cosa condividere.

## Blocco 7 - Privacy, permessi e audit

- Obiettivo: mantenere separazione accessi, audit e supporto controllato.
- File/cartelle coinvolte: auth workspace, support session, policy autorizzazione.
- Rischi: riuso dei vecchi ruoli con significati sbagliati.
- Dipendenze: ruoli MVP definitivi e regole viewer.
- Serve dal proprietario: policy accessi desiderata e responsabilita operative.
- Output atteso: matrice permessi e test default deny.
- Criteri di completamento: nessun ruolo client e fonte autorevole, ogni accesso e server-side.
