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

- documenti, versioni documento e scadenze;
- lavoratori e cantieri;
- checklist, voci checklist ed evidence.
- pacchetti documentali, link di condivisione e accesso destinatario esterno tokenizzato.
- dashboard operativa read-only, come aggregazione sintetica filtrata per Organization.

I file Evidence usano l'adapter Blob esistente; le response pubbliche non espongono URL permanenti.
