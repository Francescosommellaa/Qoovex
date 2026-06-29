# Qoovex

Monorepo di Qoovex: il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Stato

- `apps/workspace`: runtime Next.js API-only per auth, tenant, MFA, inviti e supporto auditato.
- `apps/web`: placeholder vuoto per il futuro sito pubblico.
- `apps/mobile`: placeholder vuoto per la futura app mobile.
- `apps/sirio`: placeholder vuoto; nessun design system o stile canonico e presente.
- `packages/db`: schema Prisma e migrazioni auth, tenant e supporto.
- `packages/types`: ruoli, permessi e DTO platform-neutral per auth/tenant/supporto.

Il dominio documenti, scadenze, cantieri e prove operative e in fase di reset documentale. Non sono ancora implementati modello MVP, UI finale o migrazioni di dominio.

## Regole

- Auth e sicurezza restano confinate in `apps/workspace`.
- Tenant, ruoli, support session e autorizzazioni derivano sempre dal server.
- Nessun ruolo o permesso proveniente dal client e fonte autorevole.
- Il codice struttura identifica una struttura, ma non autentica.
- Le app non importano codice da altre app.
- Qoovex organizza documenti e stati operativi; non promette conformita o validita legale.

## Comandi

```bash
pnpm install
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/types type-check
pnpm --filter @qoovex/workspace type-check
pnpm --filter @qoovex/workspace test
```
