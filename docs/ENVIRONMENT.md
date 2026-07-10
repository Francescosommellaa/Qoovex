# Environment setup

Questa guida definisce le variabili necessarie per far girare Qoovex in locale e in produzione su Vercel.

Non committare mai `.env.local`, `.env`, token, secret o URL database reali. I file versionati devono restare solo template.

## File creati

- `.env.example`: template monorepo unico di riferimento.
- `apps/workspace/.env.example`: template operativo per l'app prodotto.
- `apps/web/.env.example`: template operativo per il sito pubblico.

## App e porte locali

- `apps/workspace`: app prodotto, API, auth, Prisma, Blob, Resend. Porta locale `3001`.
- `apps/web`: sito pubblico. Porta locale `3000`.

Comandi:

```powershell
pnpm install
pnpm --filter @qoovex/workspace dev
pnpm --filter @qoovex/web dev
```

## Setup locale minimo

1. Copia i template:

```powershell
Copy-Item .env.example .env.local
Copy-Item apps/workspace/.env.example apps/workspace/.env.local
Copy-Item apps/web/.env.example apps/web/.env.local
```

2. Compila almeno `apps/workspace/.env.local`:

```dotenv
AUTH_URL=http://localhost:3001
AUTH_SECRET=<secret-almeno-32-caratteri>
DEV_AUTH_SECRET=<secret-almeno-32-caratteri>
DATABASE_URL=<postgres-url>
QOOVEX_AUTH_CODE_SECRET=<secret-lungo>
QOOVEX_PASSWORD_PEPPER=<secret-lungo-e-stabile>
QOOVEX_AUDIT_SECRET=<secret-lungo>
QOOVEX_MFA_ENCRYPTION_KEY=<secret-lungo-e-stabile>
QOOVEX_MFA_COOKIE_SECRET=<secret-lungo>
QOOVEX_CRON_SECRET=<secret-lungo>
BLOB_READ_WRITE_TOKEN=<token-blob-valido>
```

3. Compila `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_WORKSPACE_URL=http://localhost:3001
NEXT_PUBLIC_CONTACT_EMAIL=supporto@qoovex.com
```

## Generazione secret

Puoi generare secret locali con Node:

```powershell
node -e "console.log(crypto.randomBytes(32).toString('base64url'))"
```

Genera valori diversi per:

- `AUTH_SECRET`
- `DEV_AUTH_SECRET`
- `QOOVEX_AUTH_CODE_SECRET`
- `QOOVEX_PASSWORD_PEPPER`
- `QOOVEX_AUDIT_SECRET`
- `QOOVEX_MFA_ENCRYPTION_KEY`
- `QOOVEX_MFA_COOKIE_SECRET`
- `QOOVEX_CRON_SECRET`

`QOOVEX_PASSWORD_PEPPER` e `QOOVEX_MFA_ENCRYPTION_KEY` sono critici: dopo utenti reali non vanno cambiati senza migrazione/rotazione, perché influenzano password e segreti MFA già salvati.

## Variabili workspace

| Variabile | Locale | Produzione | Note |
| --- | --- | --- | --- |
| `AUTH_URL` | obbligatoria | obbligatoria | Locale `http://localhost:3001`; produzione `https://app.qoovex.com`. |
| `AUTH_SECRET` | consigliata | obbligatoria | Secret Auth.js. Minimo 32 caratteri. |
| `NEXTAUTH_URL` | opzionale | opzionale | Alias legacy; preferire `AUTH_URL`. |
| `NEXTAUTH_SECRET` | opzionale | opzionale | Alias legacy; preferire `AUTH_SECRET`. |
| `DEV_AUTH_SECRET` | obbligatoria per dev-auth | non usare | Solo sviluppo locale. |
| `DATABASE_URL` | obbligatoria | obbligatoria | URL PostgreSQL usato da Prisma e Auth.js adapter. |
| `DATABASE_PRISMA_DATABASE_URL` | opzionale | opzionale | Alias supportato dal package DB. |
| `DATABASE_POSTGRES_URL` | opzionale | opzionale | Alias supportato dal package DB. |
| `RESEND_API_KEY` | opzionale | obbligatoria | In locale, se vuota, le email vengono loggate; se invalida, l'invio fallisce. |
| `RESEND_FROM_EMAIL` | opzionale | obbligatoria | Mittente verificato su Resend. |
| `RESEND_REPLY_TO_EMAIL` | opzionale | consigliata | Per Qoovex usare `supporto@qoovex.com` come canale reale di risposta. |
| `QOOVEX_AUTH_CODE_SECRET` | consigliata | obbligatoria | HMAC codici auth. Fallback possibili nel codice, ma in produzione va dedicata. |
| `QOOVEX_PASSWORD_PEPPER` | consigliata | obbligatoria | Pepper password. Deve restare stabile. |
| `QOOVEX_AUDIT_SECRET` | consigliata | obbligatoria | Hash IP/audit. |
| `QOOVEX_MFA_ENCRYPTION_KEY` | obbligatoria se MFA usata | obbligatoria | Richiesta dal codice MFA. |
| `QOOVEX_MFA_COOKIE_SECRET` | consigliata | obbligatoria | Firma cookie MFA. |
| `QOOVEX_CRON_SECRET` | obbligatoria se usi digest cron | obbligatoria se usi digest cron | Header attuale: `x-qoovex-cron-secret`. |
| `GOOGLE_CLIENT_ID` | opzionale | opzionale | Solo se abiliti Google OAuth. |
| `GOOGLE_CLIENT_SECRET` | opzionale | opzionale | Solo se abiliti Google OAuth. |
| `BLOB_READ_WRITE_TOKEN` | obbligatoria fuori Vercel/OIDC | fallback | Token Vercel Blob read-write valido. |
| `BLOB_STORE_ID` | opzionale | consigliata con OIDC | Store Blob collegato al progetto. |
| `VERCEL_OIDC_TOKEN` | generata da Vercel CLI | automatica su Vercel | Token OIDC temporaneo. Non scriverlo manualmente se non pullato da Vercel. |

## Variabili web

| Variabile | Locale | Produzione | Note |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_WORKSPACE_URL` | `http://localhost:3001` | `https://app.qoovex.com` | Pubblica, usata dal sito per link al workspace. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `supporto@qoovex.com` | `supporto@qoovex.com` | Pubblica, usata dal sito per link mailto e pagine legal. |

Non mettere segreti in variabili `NEXT_PUBLIC_*`: sono visibili nel browser.

## Database e Prisma

Qoovex usa Prisma e PostgreSQL. I file binari restano su Vercel Blob; il database salva metadati, relazioni, permessi, scadenze, audit e riferimenti Blob.

Comandi locali consigliati dopo aver configurato `DATABASE_URL`:

```powershell
pnpm db:generate
pnpm db:migrate:deploy
pnpm --filter @qoovex/db verify:prisma
pnpm type-check
pnpm test:unit
pnpm build
```

Usa `pnpm db:migrate:deploy` per applicare migration già presenti.

Non usare `pnpm db:push` su produzione. Non usare reset o migration distruttive su database con dati reali.

Se lanci Prisma direttamente dentro `packages/db`, assicurati che il processo veda una variabile database valida. Opzioni:

```powershell
$env:DATABASE_URL="<postgres-url>"
pnpm --filter @qoovex/db db:migrate:deploy
```

oppure crea un `packages/db/.env` locale non versionato con `DATABASE_URL`.

## Vercel Blob

Qoovex usa Vercel Blob privato per documenti, PDF, foto e prove di cantiere.

Produzione su Vercel:

- collega un Blob Store al progetto Vercel del workspace;
- usa OIDC quando disponibile;
- se serve fallback statico, configura `BLOB_READ_WRITE_TOKEN`;
- per file sensibili mantieni accesso Blob `private`.

Locale:

- se usi OIDC, entra in `apps/workspace` ed esegui `vercel env pull .env.local --environment=development`;
- se non usi OIDC, inserisci un `BLOB_READ_WRITE_TOKEN` read-write valido in `apps/workspace/.env.local`.

## Resend

Resend serve per:

- verifica email signup;
- inviti;
- reset password;
- notifiche e digest email.

Produzione:

- crea/verifica il dominio mittente in Resend;
- genera `RESEND_API_KEY`;
- configura `RESEND_FROM_EMAIL` con `noreply@qoovex.com` o altro mittente verificato del dominio;
- configura `RESEND_REPLY_TO_EMAIL=supporto@qoovex.com` quando vuoi che le risposte vadano al canale reale.

Locale:

- puoi lasciare `RESEND_API_KEY` e `RESEND_FROM_EMAIL` vuoti per loggare le email in console;
- non lasciare una API key invalida: il codice proverà a inviare davvero e l'operazione fallirà.

## Produzione Vercel

Qoovex ha due app Next distinte:

- workspace: deploy dell'app `apps/workspace`;
- web pubblico: deploy dell'app `apps/web`.

Configura i progetti Vercel con root directory separate.

### Workspace project

Root directory:

```text
apps/workspace
```

Variabili Production minime:

```dotenv
AUTH_URL=https://app.qoovex.com
AUTH_SECRET=<secret>
DATABASE_URL=<production-postgres-url>
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL=<mittente-verificato>
RESEND_REPLY_TO_EMAIL=supporto@qoovex.com
QOOVEX_AUTH_CODE_SECRET=<secret>
QOOVEX_PASSWORD_PEPPER=<secret-stabile>
QOOVEX_AUDIT_SECRET=<secret>
QOOVEX_MFA_ENCRYPTION_KEY=<secret-stabile>
QOOVEX_MFA_COOKIE_SECRET=<secret>
QOOVEX_CRON_SECRET=<secret>
BLOB_READ_WRITE_TOKEN=<solo-se-non-usi-oidc-o-serve-fallback>
BLOB_STORE_ID=<blob-store-id-se-richiesto>
GOOGLE_CLIENT_ID=<opzionale>
GOOGLE_CLIENT_SECRET=<opzionale>
```

### Web project

Root directory:

```text
apps/web
```

Variabili Production:

```dotenv
NEXT_PUBLIC_WORKSPACE_URL=https://app.qoovex.com
NEXT_PUBLIC_CONTACT_EMAIL=supporto@qoovex.com
```

Dominio Production previsto:

```text
https://qoovex.com
```

Azioni manuali su Vercel Domains:

1. assegna `qoovex.com` al progetto Vercel con root `apps/web`;
2. assegna `app.qoovex.com` al progetto Vercel con root `apps/workspace`;
3. verifica che `NEXT_PUBLIC_WORKSPACE_URL` nel progetto web punti a `https://app.qoovex.com`;
4. verifica che `AUTH_URL` nel progetto workspace punti a `https://app.qoovex.com`.

## Vercel CLI

Installa e autentica Vercel CLI, poi collega i progetti dalla rispettiva root app:

```powershell
cd apps/workspace
vercel link
vercel env pull .env.local --environment=development
cd ../web
vercel link
vercel env pull .env.local --environment=development
```

Per aggiungere variabili:

```powershell
vercel env add AUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add RESEND_API_KEY production
```

Ripeti per Preview/Development se vuoi ambienti separati.

## Migration produzione

Prima o subito dopo il primo deploy, applica le migration al database production:

```powershell
$env:DATABASE_URL="<production-postgres-url>"
pnpm db:generate
pnpm db:migrate:deploy
pnpm --filter @qoovex/db verify:prisma
```

Esegui questi comandi da una macchina fidata o da CI con accesso al database production.

## Cron digest email

Il codice attuale espone:

```text
POST /api/reminders/email-digest/run
Header: x-qoovex-cron-secret: <QOOVEX_CRON_SECRET>
```

Nota operativa: Vercel Cron invia richieste `GET` verso path definiti in `vercel.json` e raccomanda `Authorization: Bearer <CRON_SECRET>`. Quindi, prima di considerare il digest automatico pronto in produzione, bisogna allineare endpoint, metodo, header e protezione del proxy, oppure configurare un chiamante che supporti il contratto attuale. Non aggiungere provider esterni senza decisione dedicata.

Test manuale locale:

```powershell
Invoke-WebRequest `
  -Method POST `
  -Uri http://localhost:3001/api/reminders/email-digest/run `
  -Headers @{ "x-qoovex-cron-secret" = "<QOOVEX_CRON_SECRET>" }
```

## Checklist finale locale

```powershell
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm --filter @qoovex/db verify:prisma
pnpm --filter @qoovex/workspace dev
pnpm --filter @qoovex/web dev
pnpm type-check
pnpm test:unit
pnpm build
```

## Checklist finale produzione

1. Crea/collega database PostgreSQL production.
2. Crea/collega Vercel Blob Store privato.
3. Configura Resend e dominio mittente verificato.
4. Configura variabili Production su Vercel per `apps/workspace`.
5. Configura `NEXT_PUBLIC_WORKSPACE_URL` e `NEXT_PUBLIC_CONTACT_EMAIL` su Vercel per `apps/web`.
6. Applica migration production con `pnpm db:migrate:deploy`.
7. Esegui deploy workspace e web.
8. Verifica domini: `https://qoovex.com` apre il sito pubblico e `https://app.qoovex.com` apre il workspace.
9. Verifica signup/login, upload documento, download documento, invito/email, dashboard e accesso multi-tenant.
10. Allinea cron digest a Vercel Cron prima di abilitarlo come automazione production.

## Riferimenti ufficiali

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel CLI env](https://vercel.com/docs/cli/env)
- [Vercel Blob private storage](https://vercel.com/docs/vercel-blob/private-storage)
- [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
