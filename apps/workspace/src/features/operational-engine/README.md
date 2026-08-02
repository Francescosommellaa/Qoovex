# Operational engine

Motore server-side exception-driven di Qoovex. Il registry versionato, il lifecycle, il runner e le automazioni vivono in `server/`; le route e le view consumano soltanto servizi e DTO minimizzati.

Il motore orchestra il dominio esistente senza duplicare file o contenuti. Ogni query resta filtrata per Azienda e gli artifact sono validati tramite i servizi di scope correnti.

Le definizioni eseguibili sono `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1`, `CONTINUOUS_CONTROL@1` e `DOCUMENT_PACKAGE_SHARING@1`. Quest'ultima e completata dal servizio canonico di condivisione, non dal fallback generico del runner. Il runner usa claim atomico, lease di cinque minuti, fencing, massimo cinque tentativi e backoff 1/5/15/60 minuti. Gli eventi sono append-only; snapshot di regole ed effect receipt rendono ripresa e riconciliazione idempotenti.

La Foundation Operational Intelligence aggiunge un secondo registry, dedicato a quattro azioni deterministiche: schema input/output validato a runtime, permesso, resource scope, impatto, reversibilita, strategia idempotente, entry point dominio, receipt ed evento. Decisioni, eccezioni e notifiche restano effetti interni del runner e non sono comandi IA generici. L'executor e solo dry-run e collega realmente `execution-policy.ts`; gli adapter possono proporre envelope strutturati ma non hanno API di esecuzione o scrittura.

Le modalita sono `OFF`, `SHADOW`, `SUGGEST_ONLY` e `AUTO_LOW_RISK`. `OFF` e il default. `AUTO_LOW_RISK` resta bloccata senza attestazione, versione soglia e score minimo di evaluation approvati. Il solo adapter presente e provider-neutral, disabilitato e non effettua chiamate esterne. Provenienza e confidence sono per campo/task; non esiste una confidence globale.

Il client non sceglie stati, affidabilita, impatto o transizioni. Decisioni, risoluzioni consentite e retry sono input discriminati e richiedono permessi gia esistenti.
