# Prisma Schema

Scopo: definizione canonica del database Qoovex.

Metti qui:
- `schema.prisma` e, quando presenti, migration o file strettamente legati allo schema.
- `seed.ts` per righe demo minime e idempotenti.
- modelli Prisma dominio MVP per metadati documenti, scadenze, cantieri, prove e pacchetti.
- baseline canonica immutabile e migration incrementali con tabelle fisiche `Organization*`.

Non mettere qui:
- query runtime;
- script applicativi che non definiscono la struttura dati.
- file binari, PDF, immagini o contenuti Blob.

Regole:
- ordine file e model secondo `docs/02_ARCHITECTURE_AND_BOUNDARIES.md`;
- non duplicare regole business applicative nello schema.
- ogni modello dominio deve riferirsi a `Organization`;
- ogni `User` ha zero o una sola `OrganizationMembership`, univoca per `userId` e riutilizzata dopo revoca;
- questo vincolo descrive il solo `verified_current_state`: la direzione vNext richiede contesti Azienda/cliente multipli, ma il modello tecnico resta `conceptual_not_implemented` e non autorizza modifiche schema;
- `JobSite.clientName` resta un riferimento testuale legacy; non esistono ancora `JobSiteParticipant`, `CLIENT` o `ClientProperty`;
- non introdurre mapping tenant legacy o colonne tenant con nomi non canonici.
- `DATABASE_URL` deve restare in `.env` e non va loggato o committato.
- modifiche enum audit addittive devono avere migration dedicata e non implicano reset DB.
- `CLIENT` non deve essere aggiunto a `OrganizationRole`; qualunque partecipazione cliente richiede il contratto dominio approvato prima di Prisma.
- D-VNEXT-18-45 descrivono un target concettuale, non lo schema corrente. La futura implementazione, se autorizzata, dovra usare una sola migration additiva coordinata e preservare `clientName`, `JobSiteOperationalPhase`, assegnazioni e processi `@1` durante la compatibility window.
