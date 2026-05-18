# Shared Server

Scopo: helper server-only interni alla workspace app.

Metti qui:
- service server-only che orchestrano use case, validazioni e provider;
- integrazioni server-side condivise tra route handler, layout e server action;
- repository in `repositories/` come unico punto autorizzato per `@qoovex/db`.

Non mettere qui:
- componenti React;
- codice importabile dal client;
- logica specifica di una singola feature.

Regole:
- importa `server-only` nei file che non devono finire nel bundle client;
- mantieni input espliciti e serializzabili quando una funzione viene chiamata da una server action.
- non importare `@qoovex/db` fuori da `shared/server/repositories`.

## Rate limit (`rate-limit.ts`)

Limiter in-memory per route API costose. Non e' distribuito tra piu' istanze serverless: in produzione ad alto traffico valutare Upstash Redis.
