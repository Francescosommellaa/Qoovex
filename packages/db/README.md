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
- `src/` espone client e API del package;
- ogni cambiamento strutturale qui va allineato a `project_brain.json` se stabilizza una convenzione.

Comandi utili:

```bash
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/db db:seed
pnpm --filter @qoovex/db verify:prisma
pnpm --filter @qoovex/db test
pnpm --filter @qoovex/db exec prisma studio
```

Non importare Prisma Client in componenti browser o client component.
