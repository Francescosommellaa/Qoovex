# Domain Naming And Permissions

## Decisione

Il tenant tecnico canonico del nuovo Qoovex e `Organization`.

Nel prodotto visibile all'utente `Organization` puo essere chiamata "Azienda". Nel codice, nei contratti futuri, nei servizi dominio e nello schema Prisma futuro il nome corretto e `Organization`.

`apps/workspace` resta il nome tecnico dell'app Next.js in questa fase. Non e un concetto prodotto principale e non va usato nel copy utente se crea confusione.

## Entita canoniche

- `Organization`: tenant principale dell'account.
- `Worker`: lavoratore o persona operativa.
- `JobSite`: cantiere.
- `Document`: documento logico.
- `DocumentType`: tipo documento configurabile.
- `DocumentRequirement`: requisito documentale richiesto da checklist o configurazione.
- `DocumentVersion`: versione caricata di un documento.
- `Deadline`: scadenza collegata a documento, requisito, checklist o promemoria.
- `Checklist`: lista operativa configurata.
- `ChecklistItem`: voce di checklist.
- `Evidence`: prova di cantiere, foto, nota o file operativo.
- `DocumentPackage`: pacchetto documentale condivisibile.
- `ShareLink`: link sicuro e revocabile di condivisione.
- `AuditLog`: registro eventi applicativi e di accesso.

## Termini legacy vietati

Non usare come concetti prodotto o nuovi nomi tecnici:

- `Kitchen`, cucina, capo cucina;
- `Chef`;
- `Restaurant`;
- `Brigade`, brigata;
- `Crew` se usato con significato food;
- `Hall`, sala;
- menu, ricette, allergeni, ingredienti, nutrizione;
- pre-service o service mode come dominio prodotto.

Questi termini possono comparire solo in file legacy marcati, audit o piani di bonifica.

## Ruoli MVP canonici

### `OWNER`

Proprietario dell'organizzazione. Accede a tutto, gestisce impostazioni, membri, ruoli, audit log e in futuro billing.

### `ADMIN`

Amministratore operativo. Gestisce lavoratori, cantieri, documenti, scadenze, checklist e pacchetti documentali. Non gestisce necessariamente proprieta o billing.

### `SAFETY_CONSULTANT`

Consulente sicurezza/RSPP esterno o figura tecnica. Vede documenti e scadenze, segnala stati documentali, aggiorna checklist documentali e aiuta a preparare pacchetti. Non certifica automaticamente conformita.

### `SITE_MANAGER`

Capocantiere, preposto o responsabile operativo di cantiere. Vede solo cantieri assegnati, completa checklist operative, carica prove e segnala problemi.

### `WORKER`

Lavoratore o collaboratore operativo. Vede solo informazioni personali o assegnate, puo caricare documenti/prove se abilitato e completare azioni semplici.

### `VIEWER`

Committente, geometra, general contractor o destinatario esterno. Accede solo in lettura a pacchetti o documenti condivisi.

## Permessi MVP

I permessi sono sempre default-deny e verificati server-side. I permessi sono action gate: non sostituiscono i filtri per risorsa.

| Permesso | OWNER | ADMIN | SAFETY_CONSULTANT | SITE_MANAGER | WORKER | VIEWER |
| --- | --- | --- | --- | --- | --- | --- |
| `organization:read` | si | si | si | si | si | no |
| `organization:update` | si | no | no | no | no | no |
| `members:read` | si | si | no | no | no | no |
| `members:invite` | si | si | no | no | no | no |
| `members:manage` | si | no | no | no | no | no |
| `workers:read` | si | si | si | assegnati | personale | no |
| `workers:create` | si | si | no | no | no | no |
| `workers:update` | si | si | no | no | no | no |
| `workers:archive` | si | si | no | no | no | no |
| `jobSites:read` | si | si | si | assegnati | assegnati | no |
| `jobSites:create` | si | si | no | no | no | no |
| `jobSites:update` | si | si | no | no | no | no |
| `jobSites:archive` | si | si | no | no | no | no |
| `documents:read` | si | si | si | assegnati | personale/assegnati | no |
| `documents:upload` | si | si | no | no | abilitato | no |
| `documents:update` | si | si | si | no | no | no |
| `documents:archive` | si | si | no | no | no | no |
| `deadlines:read` | si | si | si | si | personali | no |
| `deadlines:manage` | si | si | no | no | no | no |
| `checklists:read` | si | si | si | si | no | no |
| `checklists:manage` | si | si | si | no | no | no |
| `checklists:complete` | si | si | si | si | assegnate | no |
| `evidence:read` | si | si | si | assegnate | assegnate | no |
| `evidence:upload` | si | si | si | si | abilitato | no |
| `evidence:delete` | si | si | no | no | no | no |
| `documentPackages:read` | si | si | si | no | no | condivisi |
| `documentPackages:create` | si | si | si | no | no | no |
| `documentPackages:share` | si | si | no | no | no | no |
| `auditLog:read` | si | no | no | no | no | no |
| `settings:update` | si | no | no | no | no | no |

## Note di implementazione

- I ruoli runtime attivi sono `OrganizationRole`. La migration dedicata mappa i valori legacy senza rinominare fisicamente le tabelle.
- Le route `/api/structure*` restano compatibili come wrapper deprecati fino alla rimozione concordata.
- Il nuovo codice dominio deve usare `Organization` e non introdurre nuovi concetti `Structure`.
- `VIEWER` non deve ottenere `documents:read`: i servizi di condivisione devono esporre solo i documenti inclusi nel pacchetto.
- `SITE_MANAGER` e `WORKER` richiedono filtri per assegnazione oltre ai permessi.

## Cosa non implementare ancora

- Rinomina fisica delle tabelle legacy `Structure*`.
- Modelli definitivi per documenti, cantieri e lavoratori.
- Upload Blob completo.
- Liste documentali o scadenze normative precompilate non validate.
- AI normativa autonoma.
- Promesse di conformita o validita legale.

## Regole anti-confusione

- Nome tecnico: `Organization`.
- Nome prodotto: "Azienda".
- Database attuale: `Structure*` e un nome legacy temporaneo.
- Ogni nuovo documento, API o modello deve indicare se usa il dominio nuovo o se e compatibilita legacy.
