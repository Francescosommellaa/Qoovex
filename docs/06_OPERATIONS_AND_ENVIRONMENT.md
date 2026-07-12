# Operations and environment

Gli esempi env versionati sono l'unica guida per la configurazione locale. `AUTH_URL` deve essere un URL assoluto con protocollo; in produzione workspace e web restano progetti Vercel separati. Le variabili Vercel generate dal sistema non sostituiscono i valori applicativi richiesti.

Resend invia email: mittente, reply-to e casella che riceve risposte sono responsabilita distinte. Blob resta privato e usa OIDC o token read-write secondo la configurazione dell'ambiente.

Non eseguire reset, seed distruttivi, `db push`, cancellazioni organization o cleanup Blob senza classificare database e storage: un ambiente locale puo condividere risorse con produzione.

I runner schedulati accettano solo `GET` con `Authorization: Bearer <CRON_SECRET>`. GitHub Actions usa il secret repository `CRON_SECRET` e la variabile `WORKSPACE_BASE_URL`; lo stesso secret ruotato deve essere configurato nel progetto Vercel workspace. Non inserire secret in query, workflow, log o documentazione.

Lo scheduler GitHub esegue data-control ogni cinque minuti e digest ogni ora. Poiche i workflow schedulati dei repository pubblici possono essere ritardati o disabilitati dopo inattivita prolungata, verificarne almeno mensilmente stato e ultime esecuzioni.
