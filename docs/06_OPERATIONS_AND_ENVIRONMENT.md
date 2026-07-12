# Operations and environment

Gli esempi env versionati sono l'unica guida per la configurazione locale. `AUTH_URL` deve essere un URL assoluto con protocollo; in produzione workspace e web restano progetti Vercel separati. Le variabili Vercel generate dal sistema non sostituiscono i valori applicativi richiesti.

Resend invia email: mittente, reply-to e casella che riceve risposte sono responsabilita distinte. Blob resta privato e usa OIDC o token read-write secondo la configurazione dell'ambiente.

Non eseguire reset, seed distruttivi, `db push`, cancellazioni organization o cleanup Blob senza classificare database e storage: un ambiente locale puo condividere risorse con produzione.

## Deploy migration protetto

Il comando canonico e `pnpm --filter @qoovex/db db:migrate:deploy`. Fuori dalla CI locale rifiuta l'esecuzione finche non sono presenti:

- `QOOVEX_MIGRATE_DEPLOY_APPROVED=1`;
- `QOOVEX_MIGRATION_BACKUP_REF`, riferimento non segreto al dump verificato e allo snapshot disponibile;
- `QOOVEX_EXPECTED_LAST_MIGRATION`, uguale al nome dell'ultima migration locale revisionata.

Prima di una migration distruttiva usare il connection string diretto Prisma Postgres e client PostgreSQL 17 per creare un dump custom-format del solo schema `public`. Conservare il dump cifrato fuori dal repository, calcolarne l'hash, verificarlo con `pg_restore --list` e provarne il restore su un database isolato. Registrare anche l'ultimo snapshot visibile nella Prisma Console. Durante la finestra bloccare il traffico workspace e sospendere i workflow schedulati; dopo il commit, il rollback supportato e il restore del backup seguito dal precedente deployment.

I runner schedulati accettano solo `GET` con `Authorization: Bearer <CRON_SECRET>`. GitHub Actions usa il secret repository `CRON_SECRET` e la variabile `WORKSPACE_BASE_URL`; lo stesso secret ruotato deve essere configurato nel progetto Vercel workspace. Non inserire secret in query, workflow, log o documentazione.

Lo scheduler GitHub esegue data-control ogni cinque minuti e digest ogni ora. Poiche i workflow schedulati dei repository pubblici possono essere ritardati o disabilitati dopo inattivita prolungata, verificarne almeno mensilmente stato e ultime esecuzioni.
