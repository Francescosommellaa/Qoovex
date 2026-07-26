# Data, storage and security

## Stato attuale verificato

Prisma salva record, relazioni, stati, permessi, scadenze e audit. Vercel Blob privato salva file binari; DocumentVersion ed Evidence conservano metadati e blob key. Download e condivisione passano da endpoint autorizzati senza esporre blob key, token hash o URL permanenti.

Il repository contiene nove migration canoniche, da `20260712010000_single_company_baseline` a `20260725010000_add_session_account_user_indexes`. La presenza dei file non prova lo stato applicato di Local, Preview o Production: ogni ambiente deve essere verificato separatamente con i guardrail di `packages/db`. Le migration applicate sono immutabili; non usare `migrate resolve`, `db push` o reset per nascondere divergenze.

Il dominio corrente include tassonomia e sensibilita documentale, CalendarEvent, fase operativa dei cantieri e relazione invito-lavoratore. I record legacy non vengono riclassificati o backfillati per deduzione. Auth, MFA, rate limit, support session, audit e protezioni HTTP restano nel workspace.

## Direzione approvata

Un processo futuro deve essere persistente, riprendibile e idempotente. Evento, processo e step richiedono chiavi idempotenti distinte; claim e completamento devono essere atomici; un worker obsoleto non puo completare dopo una nuova acquisizione. Replay e riconciliazione aggiungono storia e aggiornano lo stato corrente senza riscrivere il passato.

Le regole validate devono essere versionate e il processo deve conservare quale versione ha applicato. Gli output restano nelle entita dominio esistenti; la persistenza di processo conserva riferimenti autorizzati, non copie di file o segreti.

La timeline operativa deve essere minimizzata. Puo conservare riepiloghi, attori, fonti, affidabilita, impatto, decisioni e riferimenti dominio; non conserva contenuti completi, token, blob key, URL permanenti, credenziali, stack trace, body email o dati sensibili non necessari.

## Specifiche concettuali non implementate

I concetti di definizione, run, step, evento, proposta, decisione, eccezione e riferimento artefatto non corrispondono a modelli Prisma. Stati, indici, vincoli, payload, retention e compensazioni non sono approvati.

## Decisioni aperte e hard stop

Richiedono decisione esplicita: schema e migration, versionamento concreto, idempotency key, fencing token, retention di timeline/eventi, trattamento dei documenti sensibili, indicizzazione, cifratura aggiuntiva, compensazioni, provider OCR/AI e subprocessors. Non introdurre provider DB o storage alternativi.
