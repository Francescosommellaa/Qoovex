# Operations and environment

## Stato attuale verificato

Gli esempi env versionati sono l'unica guida locale. `AUTH_URL` deve essere assoluto e includere il protocollo. Resend, Blob e database non dispongono di fallback che possa stampare segreti, token o contenuti sensibili.

Production, Preview, sviluppo locale e CI/test usano target distinti. Sviluppo e Prisma Studio usano `qoovex-local`; CI/E2E usa `qoovex_ci` su loopback. `pnpm dev` esegue `db:start:local`, valida marker, host e porta `51225`, riusa o avvia il database e attende una query di readiness.

Il repository contiene nove migration canoniche. Il numero di file non prova lo stato di alcun ambiente; prima di ogni rollout verificare target, cronologia, checksum, diff, backup e marker. Il comando ammesso e `pnpm --filter @qoovex/db db:migrate:deploy`; non usare il deploy Prisma diretto, `db push`, reset o resolve per aggirare i guardrail.

I runner attivi sono data-control e digest tramite GitHub Actions con `Authorization: Bearer <CRON_SECRET>`, risposta JSON valida e `failed == 0`. Playwright richiede target DB/Blob E2E dedicati, modalita e attestazione esplicite. Local, test e Preview non interrogano Production.

## Direzione approvata

Il motore operativo futuro sara database-sensitive. Dovra usare claim atomico, fencing, tentativi limitati, backoff, idempotenza e riconciliazione. Errori transitori saranno ritentati senza coinvolgere l'utente; errori terminali o di business diventeranno eccezioni visibili e minimizzate.

Il centro operativo e la timeline dovranno evitare query per card, polling aggressivo, scansioni di processi chiusi, duplicazioni tra dashboard/topbar/notifiche e N+1 su artefatti o responsabili. Serviranno read model tenant-scoped, paginazione cursor, batch, invalidazione esplicita e misurazione Prisma prima/dopo.

## Specifiche concettuali non implementate

Non sono scelti runner, coda, scheduler, frequenze, concorrenza, indici, retry massimi, monitoraggio o livelli di servizio. GitHub Actions non e automaticamente il runner del futuro motore. Nessuna Operation DB o Blob viene aggiunta dalla sola documentazione.

## Decisioni aperte e hard stop

Richiedono approvazione runner, frequenze, ambienti, deployment, schema, migration, backup/rollback, retention, osservabilita, soglie tecniche e provider. La Git integration Prisma/Compute non appartiene all'architettura Vercel approvata e qualunque scollegamento o cleanup resta azione esterna separata.

## Database operation impact di questa specifica

```text
Operazioni aggiunte: 0
Operazioni eliminate: 0
Query per flusso prima: non modificate
Query per flusso dopo: invariato
Rischio N+1: nessuna modifica runtime; rischi futuri documentati
Strategia cache: invariata; futura solo tenant-aware
Strategia invalidazione: invariata; da progettare con i read model
Impatto tenant isolation: nessuno; invarianti server-side confermati
Ambienti coinvolti: solo repository e Brain; nessun database o Blob interrogato
Misurazione eseguita: audit statico di codice, schema e documentazione
```
