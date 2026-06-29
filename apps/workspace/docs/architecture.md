# Workspace architecture

`apps/workspace` e il runtime API-only per account, autenticazione e sicurezza. Non contiene ancora i moduli definitivi per documenti, scadenze, cantieri, lavoratori o prove di cantiere.

`Organization` e il tenant tecnico canonico. I modelli Prisma runtime sono `Organization*`; le tabelle fisiche `Structure*` restano temporaneamente mappate per compatibilita con la baseline auth/tenant esistente.

## Confini

- Route handler: parsing HTTP, auth, chiamata service, risposta.
- Service: use case, validazione e provider server-only.
- Repository: confine ordinario verso Prisma.
- Prisma model: identita, sessioni, credenziali, MFA, dispositivi, Organization, inviti e audit.

Non esporre record Prisma completi, errori provider o segreti. Ogni futuro aggregato documentale richiedera decisione esplicita su schema, repository, service, permessi e contratto API.
