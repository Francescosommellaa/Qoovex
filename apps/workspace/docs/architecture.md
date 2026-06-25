# Workspace architecture

`apps/workspace` e il runtime API-only per account, autenticazione e sicurezza. Non contiene ancora il prodotto Pre-Service, backend Event o integrazioni AI.

## Confini

- Route handler: parsing HTTP, auth, chiamata service, risposta.
- Service: use case, validazione e provider server-only.
- Repository: confine ordinario verso Prisma.
- Prisma model: identita, sessioni, credenziali, MFA, dispositivi, tenant, inviti e audit.

Non esporre record Prisma completi, errori provider o segreti. Ogni futuro aggregato evento richiedera decisione esplicita su schema, repository, service e contratto API.
