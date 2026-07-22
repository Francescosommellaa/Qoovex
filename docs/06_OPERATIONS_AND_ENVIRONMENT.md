# Operations and environment

Gli esempi env versionati sono l'unica guida per la configurazione locale. `AUTH_URL` deve essere un URL assoluto con protocollo; in produzione workspace e web restano progetti Vercel separati. Le variabili Vercel generate dal sistema non sostituiscono i valori applicativi richiesti.

Resend invia email: mittente, reply-to e casella che riceve risposte sono responsabilita distinte. Se Resend non e configurato, ogni invio fallisce senza stampare destinatario, OTP, token o body. L'unica eccezione e il sink HTTP E2E esplicito, autenticato con secret effimero e vincolato a loopback. Blob resta privato e usa OIDC o token read-write secondo la configurazione dell'ambiente.

Non eseguire reset, seed distruttivi, `db push`, cancellazioni organization o cleanup Blob senza classificare database e storage: un ambiente locale puo condividere risorse con produzione.

## Separazione database per ambiente

Production, Preview, sviluppo locale e CI/test devono usare target distinti. Production conserva il database Prisma Postgres di produzione; Preview usa un database Prisma Postgres dedicato; sviluppo e Prisma Studio usano Prisma Postgres locale; CI/test usa esclusivamente PostgreSQL locale `qoovex_ci`.

I comandi locali passano dal guardrail `@qoovex/db`: `pnpm --filter @qoovex/db db:studio`, `verify:prisma` e l'avvio Workspace rifiutano target non-loopback. Una manutenzione remota eccezionale richiede contemporaneamente `QOOVEX_ALLOW_REMOTE_DATABASE=1` e `QOOVEX_REMOTE_DATABASE_ATTESTATION=I_ACKNOWLEDGE_REMOTE_DATABASE`; non usare queste variabili nel normale sviluppo. Su Vercel, `QOOVEX_DATABASE_ENVIRONMENT` deve coincidere con `VERCEL_ENV` per Preview e Production.

Il comando root `pnpm dev` esegue prima `db:start:local`: se `qoovex-local` risponde viene riusato, altrimenti Prisma Postgres locale viene avviato in background e le app partono soltanto dopo una query di readiness. Il bootstrap accetta esclusivamente marker `local`, target loopback e porta canonica `51225`; non stampa connection string e non contatta i database cloud Preview o Production.

### Stato verificato 2026-07-21

- `packages/db/.env` e `apps/workspace/.env.local` puntano a `qoovex-local`; un riavvio viene recuperato automaticamente da `pnpm dev`.
- `db:seed` e deny-by-default fuori da `qoovex-local` sulla porta `51225`. La fixture locale ricrea l'Azienda dev con ruoli, lavoratori, cantieri, documenti senza file, scadenze, calendario, checklist, note evidence, pacchetti, notifiche e audit; non crea Blob.
- Gli inventari fixture Local/Production classificano il target senza esporre URL, token o email complete. Il cleanup Production richiede ID esatto, organizzazione etichettata E2E/demo, tutti i membri su domini fixture, Blob count attestato, backup cifrato e checksum verificato.
- Il 2026-07-21 l'unica fixture E2E presente in Production, il relativo utente dev e 42 eventi di sicurezza legati ai domini fixture sono stati rimossi con transazioni DB-first dopo backup JSON scoped cifrati EFS; l'inventario finale riporta zero organizzazioni, utenti e residui fixture, mentre il prefisso Blob era e resta vuoto. Un codice di verifica email, i suoi due eventi di sicurezza e un errore runtime non-fixture sono stati preservati. Nessun dato reale e stato individuato o cancellato.
- Vercel Development non contiene credenziali Prisma Postgres cloud. Preview usa il database dedicato `qoovex-preview` e il marker `QOOVEX_DATABASE_ENVIRONMENT=preview`; Production conserva il proprio database e non e stata riconfigurata.
- Il database Preview dedicato ha cinque migration canoniche applicate, schema diff nullo e lettura Prisma verificata. Le connection string create soltanto per il deploy sono state revocate e nessun segreto e stato scritto nel repository.
- Il piano Prisma Starter e associato all'account/installazione: piu database inclusi non moltiplicano il canone base, ma Operations e storage si sommano nel plafond condiviso. Verificare sempre pricing e fattura correnti prima di decisioni economiche.
- La Git integration Prisma e ancora collegata al repository e crea branch Preview automatici con database e Prisma Compute. Il PR `DB-update-I` ha dimostrato un `prisma migrate deploy` esterno che non scopre `packages/db/prisma.config.ts` e aggira il wrapper Qoovex. Questa automazione non appartiene all'architettura Vercel: scollegamento e cleanup delle risorse richiedono approvazione esplicita e restano un rischio operativo aperto.

La separazione e un'operazione infrastrutturale con hard stop: prima di modificare variabili Vercel o applicare migration esistenti verificare target, backup e cronologia. Non copiare il connection string Production negli scope Development o Preview e non stampare valori o host nei log. Nessuna migration, `db push`, reset o seed fa parte della sola configurazione del guardrail.

Il dev-auth richiede `DEV_AUTH_SECRET` di almeno 32 caratteri ed e disponibile solo in development su host loopback, mai su Vercel, build o runtime production. Il selettore ruolo non esegue seed e opera sull'Azienda gia associata all'identita dev: prima di testare mutation resta quindi necessario classificare il database collegato.

## Deploy migration protetto

Il comando canonico e `pnpm --filter @qoovex/db db:migrate:deploy`. Fuori dalla CI locale rifiuta l'esecuzione finche non sono presenti:

- `QOOVEX_MIGRATE_DEPLOY_APPROVED=1`;
- `QOOVEX_MIGRATION_BACKUP_REF`, riferimento non segreto al dump verificato e allo snapshot disponibile;
- `QOOVEX_EXPECTED_LAST_MIGRATION`, uguale al nome dell'ultima migration locale revisionata.

Prima di una migration distruttiva usare il connection string diretto Prisma Postgres e client PostgreSQL 17 per creare un dump custom-format del solo schema `public`. Conservare il dump cifrato fuori dal repository, calcolarne l'hash, verificarlo con `pg_restore --list` e provarne il restore su un database isolato. Registrare anche l'ultimo snapshot visibile nella Prisma Console. Durante la finestra bloccare il traffico workspace e sospendere i workflow schedulati; dopo il commit, il rollback supportato e il restore del backup seguito dal precedente deployment.

I runner schedulati accettano solo `GET` con `Authorization: Bearer <CRON_SECRET>`. GitHub Actions usa il secret repository `CRON_SECRET` e la variabile `WORKSPACE_BASE_URL`; lo stesso secret ruotato deve essere configurato nel progetto Vercel workspace. Non inserire secret in query, workflow, log o documentazione.

Lo scheduler GitHub esegue data-control ogni cinque minuti e digest ogni ora. Ogni step cattura una sola risposta, richiede HTTP valido e usa `jq` per verificare JSON oggetto con `failed == 0`: fallimenti logici rendono rosso il workflow. Poiche i workflow schedulati dei repository pubblici possono essere ritardati o disabilitati dopo inattivita prolungata, verificarne almeno mensilmente stato e ultime esecuzioni.

Playwright e deny-by-default: richiede `QOOVEX_E2E_MODE=1`, workspace loopback non-production, corrispondenza esatta dei target DB e Blob dichiarati e `QOOVEX_E2E_RUN_ATTESTATION=I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP` per ogni run. GitHub Actions usa esclusivamente uno store Blob E2E dedicato, configurato con il secret repository `QOOVEX_E2E_BLOB_READ_WRITE_TOKEN` e la variabile repository `QOOVEX_E2E_BLOB_STORE_ID`; il workflow fallisce prima di Playwright se mancano. Gli scenari usano organizzazioni e utenti fixture dedicati; il cleanup accetta soltanto identificatori fixture e drena esclusivamente `organizations/<fixtureOrgId>/`.
