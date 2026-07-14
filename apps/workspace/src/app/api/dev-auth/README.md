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
- formato corrente: `v2.<expUnix>.<organizationRole>.<hmac-sha256-base64url>`
- il formato legacy `v1.<expUnix>.<hmac-sha256-base64url>` resta valido fino alla scadenza e usa OWNER
- TTL: 8 ore
- redirect `redirect_url` limitato allo stesso origin

`POST /api/dev-auth` senza body crea la sessione con ruolo OWNER. Un body JSON `{ "role": "WORKER" }` rigenera il cookie con uno dei cinque ruoli Azienda canonici; input diversi ricevono `400`. Il valore client diventa attivo solo dopo validazione e firma server-side.

## Sicurezza

Lo switch non modifica `OrganizationMembership`, non crea fixture e non cambia il ruolo persistito.

Non usare in preview o produzione. Il bypass NextAuth è solo per sviluppo locale controllato (cookie `qv-dev-auth`, utente seed `dev_qoovex_local_user`).
