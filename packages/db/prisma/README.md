# Prisma Schema

Scopo: definizione canonica del database Qoovex.

Metti qui:
- `schema.prisma` e, quando presenti, migration o file strettamente legati allo schema.
- `seed.ts` per righe demo minime e idempotenti.
- modelli Prisma dominio MVP per metadati documenti, scadenze, cantieri, prove e pacchetti.
- baseline migration pulita con tabelle fisiche `Organization*`.

Non mettere qui:
- query runtime;
- script applicativi che non definiscono la struttura dati.
- file binari, PDF, immagini o contenuti Blob.

Regole:
- ordine file e model secondo `docs/CodePatterns.md`;
- non duplicare regole business applicative nello schema.
- ogni modello dominio deve riferirsi a `Organization`;
- non introdurre mapping tenant legacy o colonne tenant con nomi non canonici.
- `DATABASE_URL` deve restare in `.env` e non va loggato o committato.
- modifiche enum audit addittive devono avere migration dedicata e non implicano reset DB.
