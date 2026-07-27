# Operational engine

Motore server-side exception-driven di Qoovex. Il registry versionato, il lifecycle, il runner e le automazioni vivono in `server/`; le route e le view consumano soltanto servizi e DTO minimizzati.

Il motore orchestra il dominio esistente senza duplicare file o contenuti. Ogni query resta filtrata per Azienda e gli artifact sono validati tramite i servizi di scope correnti.

Le definizioni eseguibili sono `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1` e `CONTINUOUS_CONTROL@1`. Il runner usa claim atomico, lease di cinque minuti, fencing, massimo cinque tentativi e backoff 1/5/15/60 minuti. Gli eventi sono append-only; snapshot di regole ed effect receipt rendono ripresa e riconciliazione idempotenti.

Il client non sceglie stati, affidabilita, impatto o transizioni. Decisioni, risoluzioni consentite e retry sono input discriminati e richiedono permessi gia esistenti.
