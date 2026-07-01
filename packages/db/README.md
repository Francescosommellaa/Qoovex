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
- `lib/prisma.ts` crea il singleton server-side con `PrismaPg`;
- `src/` espone client e API del package;
- ogni cambiamento strutturale qui va allineato a `project_brain.json` se stabilizza una convenzione.

Comandi utili:

```bash
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/db db:seed
pnpm --filter @qoovex/db verify:prisma
pnpm --filter @qoovex/db exec prisma studio
```

Non importare Prisma Client in componenti browser o client component.
