# Qoovex pre-commercial operations

Questa runbook porta Qoovex alla fase "ready for pilots" senza introdurre nuovi provider, senza preset documentali inventati e senza presentare bozze legal come testi definitivi.

## Stato e limiti

- Il sito pubblico previsto e `https://qoovex.com`.
- Il workspace di produzione previsto e `https://app.qoovex.com`.
- Il canale operativo reale e `supporto@qoovex.com`.
- Il mittente transazionale previsto e `noreply@qoovex.com`.
- Qoovex organizza, non certifica: il prodotto ordina documenti, scadenze, checklist, prove e pacchetti, ma non sostituisce responsabili, consulenti o verifiche del cliente.
- Privacy policy, termini, cookie policy e DPA sono bozze strutturate da validare prima della vendita.

## Checklist dominio, email e Vercel

### Sito pubblico

1. Progetto Vercel con root directory `apps/web`.
2. Dominio Vercel assegnato: `qoovex.com`.
3. Variabili Production:

```dotenv
NEXT_PUBLIC_WORKSPACE_URL=https://app.qoovex.com
NEXT_PUBLIC_CONTACT_EMAIL=supporto@qoovex.com
```

4. Verifica manuale:

```powershell
Invoke-WebRequest https://qoovex.com
```

Controlla che la home mostri `supporto@qoovex.com` e linki privacy, termini, cookie, DPA e manuale operativo.

### Workspace

1. Progetto Vercel con root directory `apps/workspace`.
2. Dominio Vercel assegnato: `app.qoovex.com`.
3. Variabile Production:

```dotenv
AUTH_URL=https://app.qoovex.com
```

4. Verifica manuale:

```powershell
Invoke-WebRequest https://app.qoovex.com
```

Controlla login, dashboard, upload/download Blob e permessi organizationId con un account pilota.

### Resend

1. Verifica il dominio `qoovex.com` in Resend.
2. Configura mittente transazionale:

```dotenv
RESEND_FROM_EMAIL=noreply@qoovex.com
RESEND_REPLY_TO_EMAIL=supporto@qoovex.com
```

3. Esegui un invio test da ambiente di staging o produzione controllata.
4. Non usare `noreply@qoovex.com` come canale di risposta cliente.

## Procedura cancellazione dati cliente

La cancellazione definitiva non deve partire da una richiesta informale o non verificata.

### Input richiesta

1. Ricevi richiesta su `supporto@qoovex.com`.
2. Identifica richiedente, organization, ruolo e autorita interna.
3. Verifica che l'owner o referente autorizzato confermi la richiesta.
4. Chiedi se serve export prima della cancellazione.

### Export prima della cancellazione

1. Avvia export metadata dal Data Control del workspace.
2. Attendi `DataControlJob` completato.
3. Consegna il file secondo canale concordato e registra data/ora.
4. Non includere token, hash, URL permanenti o chiavi Blob nell'export.

### Cancellazione organization

1. Usa il flusso `ORGANIZATION_DELETE` del Data Control.
2. Richiedi conferma testuale forte prevista dal prodotto.
3. Il job deve cancellare prima Blob referenziati, poi record Prisma dove previsto.
4. Registra risultato finale del job e segnala eventuali errori.
5. Non cancellare audit globali o security log fuori organization quando servono a integrita piattaforma; minimizzali se previsto dalla procedura tecnica.

### Controlli post-cancellazione

1. Verifica che organization, documenti, prove e file Blob riferiti non siano piu accessibili.
2. Verifica che non restino Blob orfani sotto il prefisso organization.
3. Verifica che nuovi backup o restore non reintroducano dati cancellati.
4. Archivia evidenza operativa della richiesta e del risultato.

## Procedura backup e restore

Qoovex usa database PostgreSQL per metadati e Vercel Blob per file operativi. Un restore valido deve considerare entrambi.

### Backup

1. Conferma che il provider PostgreSQL abbia backup abilitati.
2. Conferma che il Blob Store sia collegato al progetto corretto.
3. Registra frequenza, retention e responsabile del controllo.
4. Non salvare dump o token in repository.

### Restore test

1. Esegui restore solo su ambiente isolato.
2. Applica migration coerenti con il commit applicativo:

```powershell
pnpm db:generate
pnpm db:migrate:deploy
pnpm --filter @qoovex/db verify:prisma
```

3. Verifica login, organizationId, dashboard, upload/download Blob, share link e permessi ruoli.
4. Verifica `DataControlJob` e delivery email fallite se presenti.

### Anti-ripristino dati cancellati

Prima di promuovere un restore in produzione:

1. confronta data backup con elenco organization o record cancellati;
2. escludi o ricancella dati che non devono rientrare;
3. ricontrolla Blob referenziati e orfani;
4. registra l'azione nel log operativo.

## Monitoraggio produzione Vercel base

Non viene introdotto Sentry in questa fase. Il monitoraggio pre-commerciale usa strumenti Vercel e controlli applicativi esistenti.

### Controlli giornalieri durante piloti

- Runtime Logs del progetto workspace: errori 5xx, eccezioni API, errori Blob, errori email.
- Deploy Logs: build fallite, warning runtime, variabili mancanti.
- Observability Vercel: picchi latenza, funzioni lente, route con errori.
- Data Control: `DataControlJob` in `FAILED` o bloccati in `RUNNING`.
- Notifiche: `NotificationEmailDelivery` fallite o ripetute.
- Cron/digest: endpoint runner, secret corretto e assenza di errori.

### Reazione a errore produzione

1. Identifica route, deploy, commit e organization coinvolta.
2. Verifica se il problema e globale o limitato a un tenant.
3. Se riguarda dati cliente, limita l'accesso o sospendi il flusso specifico.
4. Correggi in branch dedicato, esegui type-check/build/test pertinenti e deploya.
5. Registra causa, impatto e azione correttiva.

## Onboarding clienti pilota

### Prima dell'accesso

1. Dominio pubblico e workspace verificati.
2. Resend verificato su `qoovex.com`.
3. Variabili Production complete su Vercel.
4. Database migrato e Blob Store funzionante.
5. Account owner creato e associato alla organization corretta.
6. Ruoli minimi assegnati: owner/admin, eventuale consulente, site manager o worker solo se necessari.
7. Procedura export/cancellazione pronta.

### Materiale cliente

- Non creare preset documentali senza materiale verificato.
- Eventuali requisiti o checklist devono essere forniti dal cliente, da consulenti incaricati o approvati dal team.
- Il materiale demo deve essere chiaramente separato dai dati reali.

### Sessione iniziale

1. Spiega il principio: Qoovex organizza, non certifica.
2. Mostra caricamento documento, scadenza, prova, pacchetto e share link.
3. Mostra ruoli e isolamento per organization.
4. Conferma canale supporto: `supporto@qoovex.com`.
5. Definisci criterio di uscita dal pilota: export, cancellazione o conversione a contratto.

## Manuale operativo sintetico

- Inserisci solo dati pertinenti.
- Verifica sempre documenti e scadenze con persone competenti.
- Non usare pacchetti condivisi come sostituti di una revisione formale.
- Non trattare stati e badge come decisioni automatiche.
- Mantieni ruoli minimi necessari.
- Richiedi export o cancellazione tramite canale tracciato.

## Test pre-commerciale

Prima di attivare un pilota:

```powershell
pnpm --filter @qoovex/web type-check
pnpm --filter @qoovex/web build
pnpm --filter @qoovex/workspace type-check
pnpm --filter @qoovex/db verify:prisma
node packages/ui/scripts/verify-foundation.mjs
git diff --check
```

Poi verifica manualmente:

- `https://qoovex.com/privacy`
- `https://qoovex.com/terms`
- `https://qoovex.com/cookies`
- `https://qoovex.com/dpa`
- `https://qoovex.com/manuale-operativo`
- `https://app.qoovex.com`
