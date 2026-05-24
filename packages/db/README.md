# DB Package

Scopo: accesso dati, schema Prisma e client condiviso.

Metti qui:
- schema, client Prisma, config Prisma e export di accesso database.

Non mettere qui:
- query di feature sparse nelle app;
- business logic UI o route handlers.

Regole:
- `prisma/` contiene la verita` dello schema;
- `src/` espone client e API del package;
- ogni cambiamento strutturale qui va allineato a `project_brain.json` se stabilizza una convenzione.

Auth / User:
- `User.clerkId` e' stato rimosso (`20260522120000_nextauth_remove_clerk`);
- dopo ogni pull che tocca lo schema: `pnpm db:generate` e, se serve, `pnpm db:migrate:deploy`;
- se Prisma Studio mostra errori su `clerkId`, chiudi Studio, rigenera il client e riapri.
