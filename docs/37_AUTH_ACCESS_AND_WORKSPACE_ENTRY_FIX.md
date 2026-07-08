# 37 - Auth access and workspace entry fix

## Problema risolto

Il workspace era tecnicamente protetto dai service server-side, ma non era provabile da un utente nuovo. La root `/` reindirizzava sempre a `/dashboard` e la dashboard intercettava ogni errore mostrando un fallback unico:

> Dashboard non disponibile

Quel fallback non distingueva tra sessione mancante, azienda non configurata, accesso negato o configurazione dati non pronta.

## Causa trovata

Il repo usa NextAuth v5 con provider Credentials e Google opzionale. Non usa Clerk e non aveva route frontend `/sign-in` o `/sign-up`.

Il proxy `src/proxy.ts` protegge solo `/api/**`, lasciando la protezione pagina ai Server Component e ai service. Questo resta corretto per non rompere route viewer tokenizzate e asset statici, ma le pagine devono mostrare stati accesso utili.

## Route auth create

- `GET /sign-in`: form credentials con email/username e password.
- `GET /sign-up`: form credentials con email, username, password e verifica codice email.
- `POST /api/auth/credentials/sign-up`: wrapper pubblico sul service credentials esistente.
- `POST /api/auth/credentials/verify-email`: verifica codice email prima del login.

Le route non espongono password hash, token, stack trace, Blob key o URL permanenti.

## Middleware/proxy

Il proxy non e stato cambiato:

- protegge `/api/**`;
- lascia pubbliche `/api/auth/**`;
- lascia pubblica `/api/dev-auth` dove consentito dalle guardie dev;
- non interferisce con route viewer condivise.

L'autorizzazione resta server-side nei service e nei route handler.

## Comportamenti

### Utente non autenticato

`/` reindirizza a `/sign-in?callbackUrl=/dashboard`. Le pagine protette che intercettano una sessione mancante mostrano CTA `Accedi` e `Crea account`, senza dashboard morta.

### Utente autenticato senza azienda

Mostra lo stato:

> Configura la tua azienda

Il form `Nome azienda` usa `POST /api/organizations`, gia presente, che crea `Organization` e membership `OWNER` per l'utente corrente verificato.

### Utente autenticato con azienda

La dashboard legge i dati reali tramite `getDashboardData()` e mostra lo stato documentale normale.

### DB o configurazione non pronta

Mostra uno stato controllato:

> Configurazione dati non pronta

Non viene eseguito reset automatico e non vengono proposti comandi distruttivi nella UI.

## Onboarding rimasto

Il bootstrap azienda e minimale. Restano fuori scope:

- profilo azienda avanzato;
- inviti durante onboarding;
- recupero password UI;
- resend manuale del codice verifica;
- onboarding guidato per document type o dati iniziali.

## Test e check previsti

- type-check dei package;
- test workspace;
- build workspace;
- Prisma validate;
- smoke HTTP su `/`, `/sign-in`, `/sign-up`, `/dashboard` e route admin principali.

## Rischi aperti

- Se il provider email non e configurato in produzione, la registrazione credentials non puo consegnare il codice verifica.
- Il flusso signup resta minimo e richiede completamento nella stessa sessione browser.
- Il DB remoto deve avere migration gia applicate; la hotfix non modifica Prisma e non esegue reset/drop.
