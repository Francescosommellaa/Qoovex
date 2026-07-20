# DB Package

Scopo: accesso dati, schema Prisma e client condiviso.

Metti qui:
- schema, client Prisma, config Prisma e export di accesso database.

Non mettere qui:
- query di feature sparse nelle app;
- business logic UI o route handlers.

Regole:
- `prisma/` contiene la verita` dello schema;
- `generated/prisma/` contiene il Prisma Client generato con `provider = "prisma-client"`;
- `Notification` contiene promemoria interni e non salva file, token o URL privati;
- `NotificationPreference` contiene opt-in email per utente/azienda, disattivato di default;
- `NotificationEmailDelivery` contiene log minimo degli invii email e non salva body, token, blob key o URL privati;
- `ProductAuditEvent` contiene audit prodotto minimizzato e separato da support/auth audit;
- `WorkerUserLink`, `JobSiteUserAssignment` e `JobSiteWorkerAssignment` contengono assegnazioni operative addittive per scope risorsa;
- `OrganizationMembership` e singolare per utente; la lettura esterna usa share link e non un ruolo interno dedicato;
- `lib/prisma.ts` crea il singleton server-side con `PrismaPg`;
- il singleton applica un contatore opt-in request/flow-scoped che non registra query, argomenti o identificatori tenant;
- i comandi locali e Prisma Studio devono usare il guardrail loopback; accessi remoti richiedono un'attestazione esplicita;
- `db:start:local` riusa o avvia `qoovex-local` sulla porta canonica senza stampare connection string;
- il comando root `pnpm dev` esegue automaticamente `db:start:local` prima delle app; il database locale non consuma Operations cloud;
- `src/` espone client e API del package;
- ogni cambiamento strutturale qui va allineato a `project_brain.json` se stabilizza una convenzione.

Comandi utili:

```bash
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/db db:seed
pnpm --filter @qoovex/db db:start:local
pnpm --filter @qoovex/db verify:prisma
pnpm --filter @qoovex/db test
pnpm --filter @qoovex/db db:studio
```

Non importare Prisma Client in componenti browser o client component.

## Database operation impact

Per misure locali impostare `QOOVEX_DB_OPERATION_METRICS=1` e racchiudere il flusso server con `withDatabaseOperationMeasurement(flow, run)`. Il risultato riporta soltanto modello, operazione, conteggio e durata aggregata ed e sempre etichettato come proxy di chiamate Prisma Client, non come metrica ufficiale Prisma Postgres.

Ogni nuova query deve documentare operazioni prima/dopo, rischio N+1, cache e invalidazione, isolamento tenant, ambienti e metodo di misurazione. `include` e `select` vanno verificati sulla versione Prisma reale; non assumere che riducano il numero di operazioni o delle query SQL.

Questo controllo e automatico per ogni task che tocca flussi database-sensitive. Se emerge uno spreco verificabile, la correzione sicura e i test di regressione devono essere inclusi nello stesso task senza attendere una richiesta separata; hard stop su schema, migration, auth, tenant, audit, job, provider o configurazioni cloud richiedono invece approvazione.
