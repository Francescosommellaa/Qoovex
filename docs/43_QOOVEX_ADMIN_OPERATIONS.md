# Console Qoovex: operazioni interne

La Console Qoovex vive in `apps/workspace` sotto `/qoovex-admin` ed e riservata agli account con `PlatformRole.SUPER_ADMIN`. Nella UI questo ruolo e chiamato **Operatore Qoovex** per distinguerlo dall'`ADMIN` di una singola azienda.

## Abilitazione del primo operatore

La promozione non e disponibile tramite UI o API pubbliche. Eseguire sul database corretto:

```sql
UPDATE "User"
SET "platformRole" = 'SUPER_ADMIN', "authVersion" = "authVersion" + 1
WHERE "email" = 'account@qoovex.com';
```

Dopo la promozione, effettuare nuovamente il login e configurare MFA dalla panoramica della console. Gli operatori reali senza MFA non possono leggere dati amministrativi o aprire sessioni supporto.

## Gestione utenti

La console permette soltanto operazioni conservative:

- ricerca e dettaglio account;
- sospensione o riattivazione con motivo obbligatorio;
- revoca di tutte le sessioni tramite incremento `authVersion` e cancellazione sessioni persistenti;
- lettura di membership ed eventi sicurezza minimizzati.

Non permette modifica di email/password, cancellazione account o promozione di altri `SUPER_ADMIN`. Un operatore non puo modificare il proprio account o un altro operatore. Ogni azione viene registrata in `SecurityAuditEvent`.

## Supporto cliente

1. Cercare l'azienda da `/qoovex-admin/organizations`.
2. Verificare codice, owner e richiesta ricevuta.
3. Inserire un motivo specifico e aprire la sessione.
4. Controllare il banner persistente con azienda, motivo e scadenza.
5. Operare solo sui dati necessari.
6. Chiudere la sessione dal banner appena concluso il supporto.

Le sessioni reali durano 30 minuti, notificano gli owner e registrano accessi e operazioni. Le azioni sensibili richiedono una conferma MFA recente. Il dev-auth locale non invia email supporto.

## Registro errori

Il registro Prisma aggrega errori server per fingerprint e salva soltanto route senza query string, metodo, nome, messaggio e stack sanitizzati, digest/request ID e conteggio. Non salva body, cookie, header Authorization, password, token, email, URL Blob o contenuti cliente.

Un errore risolto che ricompare torna automaticamente `OPEN`. La risoluzione e la riapertura richiedono un motivo. Il registro non sostituisce i log Vercel: se il database e indisponibile, anche la registrazione Prisma puo fallire e resta best-effort.

## Dev locale

`Accedi come dev` compare esclusivamente in development su `localhost`, `127.0.0.1` o `::1`. Richiede `DEV_AUTH_SECRET` di almeno 32 caratteri. L'identita seed riceve `SUPER_ADMIN` soltanto a runtime mentre il cookie firmato e valido; il ruolo persistito nel database non viene promosso.

L'endpoint ritorna `404` fuori dagli host e ambienti consentiti e `503` se il secret locale non e configurato. Non usare dev-auth con database o destinatari email di produzione.

## Migrazione e verifica

Sviluppo:

```bash
pnpm --filter @qoovex/db exec prisma migrate dev
pnpm db:generate
pnpm --filter @qoovex/db exec prisma validate
pnpm --filter @qoovex/workspace test
pnpm --filter @qoovex/workspace type-check
pnpm --filter @qoovex/workspace build
pnpm test:e2e
```

Produzione:

```bash
pnpm db:migrate:deploy
pnpm db:generate
```

Qoovex organizza dati e operazioni. La console non certifica conformita, non garantisce validita legale e non sostituisce consulenti o valutazioni del cliente.
