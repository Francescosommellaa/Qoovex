# Support and data control

## Stato attuale verificato

Supporto, Qoovex Admin e data-control conservano i guardrail esistenti. Il motore non espone credenziali, token, Blob key, URL permanenti, contenuti file o stack trace.

`OperationalEvent` alimenta la timeline funzionale tipizzata e append-only; `ProductAuditEvent` resta il registro tecnico/prodotto separato. Gli accessi esterni registrano solo `LINK_OPENED` e `DOWNLOAD_REQUESTED`: non dichiarano lettura o download completato e non includono token, IP, user-agent, Blob key o URL firmato.

Le eccezioni oggettive vengono riconciliate quando la condizione dominio e soddisfatta. Le eccezioni `DATA_TO_VERIFY` e `PARTIAL_RESULT` possono essere chiuse manualmente con motivazione e permesso sottostante; eccezioni tecniche, oggettive o collegate a decisioni non possono esserlo.

## Direzione approvata

Timeline e audit devono restare separati, minimizzati e tenant-scoped. Supporto e data-control non sono scorciatoie per retry, override, condivisione o ampliamento accesso.

## Specifiche non implementate

Non esistono retention dedicata, export di processo, strumenti supporto per modificare run/step, nuovi canali di notifica o compensazioni generali.

## Decisioni aperte e hard stop

Retention/cancellazione, accesso supporto dedicato, export, SLA, notifiche aggiuntive e policy sensibili richiedono approvazione. Nessuna promessa normativa deriva dalla timeline o dall'audit.
