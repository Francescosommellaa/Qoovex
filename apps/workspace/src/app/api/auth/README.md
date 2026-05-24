# Auth API

Route handler NextAuth v5 per il workspace.

## Endpoint
- `apps/workspace/src/app/api/auth/[...nextauth]/route.ts` - catch-all Auth.js con Prisma adapter, Google OAuth e Credentials provider.
- `apps/workspace/src/app/api/auth/username/route.ts` - disponibilita username rate-limited.

## Confini
- Auth esiste solo in `apps/workspace`.
- Niente magic link: email transazionali solo per codici verifica/reset/cambio email.
- Non esporre dati account sensibili o enumerabili oltre alle verifiche richieste dal prodotto.
