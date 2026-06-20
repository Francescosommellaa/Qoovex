# Workspace architecture

`apps/workspace` è il runtime API-only per account, autenticazione e sicurezza.
Non contiene ancora il prodotto Pre-Service, il backend Event o integrazioni AI.
La direzione futura assegna a questa app il prodotto Next.js responsive su
`app.qoovex.com`, oltre ad auth e servizi server.

## Confini

- Route handler: parsing HTTP, auth, chiamata service, risposta.
- Service: use case, validazione e provider server-only.
- Repository: unico confine ordinario verso Prisma.
- Prisma model: identità, sessioni, credenziali, MFA, dispositivi e audit.

Non esporre record Prisma completi, errori provider o segreti. Ogni futuro
aggregato evento richiederà decisione esplicita su schema, repository, service e
contratto API.
