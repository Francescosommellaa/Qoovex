# 04 — Runtime e feature

## verified_current_state

Superfici raggiungibili: dashboard foundation, Worker, cantieri minimi, file/versioni, prove, Collaborator/inviti, assegnazioni, profilo Azienda, sicurezza account, notifiche di sistema, audit, data-control e console piattaforma autorizzate.

Il runner data-control è infrastrutturale. Non esistono processi prodotto registrati, enqueue automatici o branch runner sul dominio rimosso. Non esistono ricerca, cron di reminder, email digest prodotto o feature AI.

## Audit percorso conservato

| Route/UI | Mutation | Servizio | Authorization | Persistence | Audit |
|---|---|---|---|---|---|
| Worker | `/api/workers` | `worker-service` | tenant + permission | `Worker` | Product/support audit |
| Cantiere | `/api/job-sites` | `job-site-service` | tenant + scope | `JobSite` | Product audit |
| File/versione | `/api/documents` | document services | tenant + scope + file permission | Document/Version + private Blob | upload/download audit |
| Prova | `/api/evidence` | `evidence-service` | tenant + scope | Evidence/Revision + private Blob | audit |
| Accessi | organization/resource APIs | access/assignment services | Owner o permission | membership/grant/assignment | security/product audit |
| Data-control | `/api/data/*` | data-control services | Owner/data-control | job/export/private Blob | audit/receipt |

## Negative contract

Route e API di calendario, deadline, checklist, pacchetti/share, source/acquisition, richieste, timeline, ricerca, fase e processi devono restituire 404 senza redirect.

## conceptual_not_implemented

Tutti i lifecycle vNext sono assenti; nessuna UI nascosta o placeholder li simula.
