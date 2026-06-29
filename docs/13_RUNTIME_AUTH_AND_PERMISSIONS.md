# Runtime Auth And Permissions

Data: 2026-06-29.

## Ruoli runtime finali

- `OWNER`: proprietario dell'organizzazione.
- `ADMIN`: amministratore operativo.
- `SAFETY_CONSULTANT`: consulente sicurezza/RSPP esterno o figura tecnica.
- `SITE_MANAGER`: capocantiere, preposto o responsabile operativo di cantiere.
- `WORKER`: lavoratore o collaboratore operativo.
- `VIEWER`: destinatario esterno in sola lettura di pacchetti condivisi.

Il sistema non deve rappresentare nessun ruolo come figura che certifica automaticamente conformita legale.

## Permessi runtime finali

- `organization:read`
- `organization:update`
- `members:read`
- `members:invite`
- `members:manage`
- `workers:read`
- `workers:create`
- `workers:update`
- `workers:archive`
- `jobSites:read`
- `jobSites:create`
- `jobSites:update`
- `jobSites:archive`
- `documents:read`
- `documents:upload`
- `documents:update`
- `documents:archive`
- `deadlines:read`
- `deadlines:manage`
- `checklists:read`
- `checklists:manage`
- `checklists:complete`
- `evidence:read`
- `evidence:upload`
- `evidence:delete`
- `documentPackages:read`
- `documentPackages:create`
- `documentPackages:share`
- `auditLog:read`
- `settings:update`

## Mapping ruolo -> permessi

`OWNER` riceve tutti i permessi.

`ADMIN` riceve permessi operativi su membri, lavoratori, cantieri, documenti, scadenze, checklist, prove e pacchetti. Non riceve `organization:update`, `members:manage`, `auditLog:read` o `settings:update`.

`SAFETY_CONSULTANT` puo leggere organizzazione, lavoratori, cantieri, documenti e scadenze; puo aggiornare stati documentali operativi, gestire/completare checklist, caricare prove e creare pacchetti pronti per revisione.

`SITE_MANAGER` puo leggere organizzazione, lavoratori assegnati, cantieri assegnati, documenti necessari, scadenze, checklist e prove; puo completare checklist e caricare prove.

`WORKER` puo leggere organizzazione, documenti assegnati o personali e scadenze personali; puo caricare documenti/prove se abilitato e completare checklist assegnate.

`VIEWER` riceve solo `documentPackages:read`.

## Default deny

Ogni controllo server-side parte da deny.

Una route o servizio e accessibile solo se:

- l'utente e autenticato;
- esiste una membership o una support session valida;
- il ruolo ha il permesso richiesto;
- il filtro per risorsa consente l'accesso al dato specifico.

I permessi sono action gate. Non sostituiscono i filtri per cantiere assegnato, dato personale o pacchetto condiviso.

## Utenti esterni e viewer

`VIEWER` non ottiene `documents:read` globale.

Quando saranno implementati `DocumentPackage` e `ShareLink`, il viewer dovra vedere solo:

- pacchetti inclusi nella condivisione;
- documenti inclusi nel pacchetto;
- informazioni strettamente necessarie alla revisione.

## Consulente sicurezza

`SAFETY_CONSULTANT` puo aiutare a verificare stato documentale, note operative e checklist. Il prodotto non deve dire che il consulente o Qoovex certificano automaticamente l'impresa, il cantiere o il documento.

## Cosa non deve fare il sistema

- Promettere conformita garantita.
- Dichiarare che un documento e legalmente valido.
- Sostituire consulenti, RSPP, tecnici, geometri o responsabili.
- Esporre dati di altri lavoratori a `WORKER`.
- Esporre tutta l'organizzazione a `VIEWER`.
- Usare permessi larghi per comodita.

## Esempi

Consentito:

- `OWNER` legge audit log.
- `ADMIN` invita un `WORKER`.
- `SAFETY_CONSULTANT` aggiorna una checklist documentale.
- `SITE_MANAGER` carica una prova di cantiere per un cantiere assegnato.
- `VIEWER` legge un pacchetto condiviso.

Negato:

- `ADMIN` invita un altro `ADMIN`.
- `ADMIN` legge audit log MVP.
- `WORKER` legge dati sensibili di altri lavoratori.
- `VIEWER` legge documenti fuori dal pacchetto.
- Qualsiasi ruolo senza permesso esplicito accede a una route non implementata.
