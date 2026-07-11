# Operations and environment

Gli esempi env versionati sono l'unica guida per la configurazione locale. `AUTH_URL` deve essere un URL assoluto con protocollo; in produzione workspace e web restano progetti Vercel separati. Le variabili Vercel generate dal sistema non sostituiscono i valori applicativi richiesti.

Resend invia email: mittente, reply-to e casella che riceve risposte sono responsabilita distinte. Blob resta privato e usa OIDC o token read-write secondo la configurazione dell'ambiente.

Non eseguire reset, seed distruttivi, `db push`, cancellazioni organization o cleanup Blob senza classificare database e storage: un ambiente locale puo condividere risorse con produzione.
