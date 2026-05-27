# Auth (NextAuth)

- `auth-env.ts` - risolve `AUTH_SECRET` (fallback `NEXTAUTH_SECRET`, in dev anche `DEV_AUTH_SECRET`)
- `auth.config.ts` - provider Google + pagine, usata da `src/proxy.ts` senza Prisma/adapter
- `config.ts` - istanza completa: Prisma adapter, Google OAuth, Credentials provider e callback profilo/sessione

Route handler: `src/app/api/auth/[...nextauth]/route.ts`.

## Env obbligatorie

| Variabile | Note |
| --------- | ---- |
| `AUTH_SECRET` | Min 32 caratteri. In dev puoi usare lo stesso valore di `DEV_AUTH_SECRET`. |
| `AUTH_URL` | URL base workspace, es. `http://localhost:3001` |
| `DATABASE_URL` | Postgres per Prisma e Auth.js adapter |

## Env email codici / Google

| Variabile | Note |
| --------- | ---- |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Invio codici email per verifica, reset password e cambio email |
| `RESEND_REPLY_TO_EMAIL` | Reply-to opzionale per template transazionali |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `QOOVEX_AUTH_CODE_SECRET` | HMAC codici auth; fallback `AUTH_SECRET` |
| `QOOVEX_PASSWORD_PEPPER` | Pepper password; fallback `AUTH_SECRET` |
| `QOOVEX_AUDIT_SECRET` | Hash IP audit; fallback `AUTH_SECRET` |

Template: `apps/workspace/.env.example`.
