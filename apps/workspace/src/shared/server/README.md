# Shared Server

Scopo: helper server-only interni alla workspace app.

Metti qui:
- service server-only che orchestrano use case, validazioni e provider;
- integrazioni server-side condivise tra route handler, layout e server action;
- repository in `repositories/` come punto ordinario autorizzato per `@qoovex/db`.

Non mettere qui:
- componenti React;
- codice importabile dal client;
- logica specifica di una singola feature.

Regole:
- importa `server-only` nei file che non devono finire nel bundle client;
- mantieni input espliciti e serializzabili quando una funzione viene chiamata da una server action.
- non importare `@qoovex/db` in controller, page, server action o UI.
- eccezioni server-only temporanee ammesse: servizi auth/security/storage/rate-limit in `shared/server` che devono usare transazioni, adapter o primitive Prisma non ancora estratte in repository.

## Rate limit (`rate-limit.ts`)

Limiter in-memory per route API costose. Non e' distribuito tra piu' istanze serverless: in produzione ad alto traffico valutare Upstash Redis.

## Domain services

I servizi dominio MVP restano app-specific finche dipendono da auth, policy workspace, support access o provider runtime:

- documenti, tassonomia documentale, panoramica, tipi, requisiti, versioni e scadenze;
- lavoratori e cantieri;
- checklist, voci checklist ed evidence.
- pacchetti documentali, link di condivisione e accesso destinatario esterno tokenizzato.
- Panoramica operativa read-only, come proiezione bounded di decisioni, eccezioni, review ed eventi persistiti filtrati per Azienda, permessi e resource scope.

I file Evidence usano l'adapter Blob esistente; le response pubbliche non espongono URL permanenti.

I servizi documento validano `macroarea -> categoria -> tipo` dal registro condiviso. Le query restano tenant-scoped e role-scoped; pacchetti e share link applicano default-deny ai documenti non classificati o con sensibilita diversa da `STANDARD`.

## Persone

`people-service.ts` costruisce read model server-only per panoramica, rubrica paginata, accessi e assegnazioni. Le operazioni restano costanti rispetto al numero di righe (nessun N+1) e ogni query contiene `organizationId`; i preset `SITE_MANAGER` e `LIMITED_UPLOAD` ricevono inoltre lo scope da `resource-scope-service.ts`. La visibilita documentale non standard richiede il permesso sensibile canonico.

`organization-invitation-service.ts` conserva il `workerId` opzionale dell'invito Collaboratore con preset `LIMITED_UPLOAD` e crea/riattiva membership e link nella stessa transazione Serializable. Non esegue matching automatico per email sugli inviti legacy.
