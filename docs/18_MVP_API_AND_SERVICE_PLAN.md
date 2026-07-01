# MVP API And Service Plan

Data: 2026-06-30.

## Obiettivo

Definire le API e i servizi futuri per il dominio MVP senza esporre route insicure in questa fase.

La fase corrente crea documentazione, tipi condivisi e schema Prisma additivo. Le API complete saranno implementate solo con policy e test dedicati.

## Route future

Route da progettare in fasi successive:

- `/api/workers`;
- `/api/job-sites`;
- `/api/document-types`;
- `/api/document-requirements`;
- `/api/documents`;
- `/api/deadlines`;
- `/api/checklists`;
- `/api/evidence`;
- `/api/document-packages`;
- `/api/share-links`.

Ogni route deve essere:

- server-side;
- autenticata;
- default-deny;
- filtrata per `organizationId`;
- coperta da test minimi;
- prudente nel copy e negli stati.

## Servizi server-side previsti

- `worker-service`: crea, aggiorna, archivia e lista lavoratori.
- `job-site-service`: crea, aggiorna, archivia e lista cantieri.
- `document-type-service`: gestisce tipi documento configurabili.
- `document-requirement-service`: gestisce richieste documentali configurate.
- `document-service`: gestisce documento logico e stato documentale.
- `document-version-service`: registra metadata Blob dopo upload autorizzato.
- `deadline-service`: gestisce scadenze registrate e promemoria.
- `checklist-service`: gestisce checklist e completamento voci.
- `evidence-service`: registra prove operative e metadata Blob.
- `document-package-service`: prepara pacchetti per revisione.
- `share-link-service`: crea link revocabili e verifica token hash.

## Repository/data access previsti

Ogni repository deve:

- importare `server-only`;
- usare select espliciti;
- filtrare per `organizationId`;
- non restituire URL Blob permanenti;
- non esporre record Prisma completi se non necessario.

Repository previsti:

- `worker-repository`;
- `job-site-repository`;
- `document-repository`;
- `deadline-repository`;
- `checklist-repository`;
- `evidence-repository`;
- `document-package-repository`;
- `share-link-repository`.

## Policy necessarie

Permessi gia definiti:

- `workers:*`;
- `jobSites:*`;
- `documents:*`;
- `deadlines:*`;
- `checklists:*`;
- `evidence:*`;
- `documentPackages:*`.

Regole aggiuntive da implementare prima delle API complete:

- `SITE_MANAGER` vede solo cantieri assegnati;
- `WORKER` vede solo dati personali o assegnati;
- `VIEWER` vede solo pacchetti condivisi;
- `SAFETY_CONSULTANT` non certifica conformita, ma puo aiutare a verificare stati documentali;
- i permessi sono action gate e non sostituiscono filtri per risorsa.

## Test minimi futuri

- Un utente senza membership non accede a record dominio.
- Ogni query dominio filtra per `organizationId`.
- `WORKER` non legge dati di altri lavoratori.
- `VIEWER` non ottiene `documents:read` globale.
- `ShareLink` usa token hash e rispetta revoca/scadenza.
- `DocumentVersion` ed `Evidence` salvano metadata Blob, non contenuto file.
- `MISSING` nasce solo da `DocumentRequirement` o checklist configurata.
- Nessun copy API promette conformita.

## Cosa implementare ora

- Documentazione 15-18.
- Tipi condivisi dominio MVP.
- Enum e modelli Prisma additivi.
- Migration Prisma non distruttiva.
- Test minimo per verificare che la migration dominio non introduca drop distruttivi e che includa `organizationId`/`blobKey`/`tokenHash`.

## Cosa rimandare

- Route API complete.
- Upload Blob.
- Download o preview file.
- Share viewer attivo.
- Assegnazioni operative dettagliate.
- Notifiche e promemoria.
- Preset documentali.
- UI mobile o desktop.
- OCR, AI, classificazione automatica.
- Firma digitale qualificata.
- Integrazioni ufficiali.

## Criteri di completamento API futura

Una route dominio puo essere introdotta solo quando:

- esiste policy esplicita;
- esiste filtro `organizationId`;
- sono definiti input/output minimi;
- ci sono test autorizzazione;
- non vengono esposti Blob permanenti;
- il linguaggio resta prudente.
