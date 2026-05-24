# Dev Auth API

Endpoint locale per creare una sessione di sviluppo tramite cookie `httpOnly` firmato.

## Quando è attivo

- `NODE_ENV=development`
- host **solo** `localhost`, `127.0.0.1` o `::1` (non LAN / `0.0.0.0` con IP di rete)
- mai su Vercel (`VERCEL=1`)
- mai con `NODE_ENV=production` o `VERCEL_ENV=production`
- mai durante `next build` (`NEXT_PHASE=phase-production-build`)

In tutti gli altri casi l'endpoint risponde `404`.

## Configurazione locale

Aggiungi in `apps/workspace/.env.local`:

```env
DEV_AUTH_SECRET=una-stringa-casuale-di-almeno-32-caratteri
```

Senza secret valido, `POST` risponde `503`.

## Cookie

- nome: `qv-dev-auth`
- formato: `v1.<expUnix>.<hmac-sha256-base64url>`
- TTL: 8 ore
- redirect `redirect_url` limitato allo stesso origin

## Sicurezza

Non usare in preview o produzione. Il bypass NextAuth è solo per sviluppo locale controllato (cookie `qv-dev-auth`, utente seed `dev_qoovex_local_user`).
