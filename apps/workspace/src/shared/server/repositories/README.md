# Server Repositories

Scopo: unico confine autorizzato tra Workspace e `@qoovex/db`.

Metti qui:
- funzioni server-only che leggono o scrivono con Prisma;
- `select` espliciti per DTO e read model;
- query riusabili da service e server action.

Non mettere qui:
- route handler;
- componenti React;
- logica UI;
- parsing HTTP o `NextResponse`.

Regole:
- ogni file deve importare `server-only`;
- nessun controller in `src/app` o `src/shared/actions` deve importare `@qoovex/db`;
- i repository restituiscono DTO o record minimi, non entita complete se non serve.
