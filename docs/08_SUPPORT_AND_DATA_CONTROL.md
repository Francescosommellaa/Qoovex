# Support and data control

## Stato attuale verificato

Il supporto richiede sessione temporanea, motivo, MFA, notifica e audit; non espone password, TOTP, backup code o credenziali. Qoovex Admin gestisce utenti, Aziende ed errori runtime con accesso server-side.

Gli OWNER possono consultare inventario, retention ed export metadata per dominio. DTO e `select` allow-list escludono password/hash, OTP/TOTP, backup code, token, session token, HMAC, IP hash, Blob key/pathname, URL permanenti, body email e credenziali provider.

Il runner data-control usa claim atomico, fencing tramite `startedAt`, recupero dei job fermi e retry con backoff. La scansione Blob percorre tutte le pagine e ogni cleanup elimina al massimo 50 oggetti. La cancellazione Azienda e DB-first; cleanup e retry restano controllati e ripetibili.

`ProductAuditEvent` e un registro tecnico/prodotto minimizzato, owner-only e normalmente best-effort. Non e una timeline operativa di processo.

## Direzione approvata

La timeline futura e funzionale al processo e leggibile dagli attori autorizzati. Deve spiegare avvio, regola, step, proposta, decisione, retry, output, blocco e risultato. L'audit resta separato e orientato alla responsabilita tecnica.

Le entry timeline conservano soltanto riepiloghi e riferimenti necessari. Non duplicano file, testo estratto completo, dati sanitari/fiscali, token, storage key, URL permanenti, email, credenziali o stack trace. Un request ID tecnico puo essere separato dal riepilogo utente.

Le notifiche sono canali di attenzione: chiudere o leggere una notifica non chiude l'eccezione. Quando una condizione viene soddisfatta, il processo riconcilia eccezione, notifica e timeline senza perdere lo storico.

Supporto e data-control non diventano scorciatoie per retry, override, condivisioni o accessi del motore. Ogni intervento conserva i permessi, il motivo e l'audit esistenti.

## Specifiche concettuali non implementate

Non esistono oggi un archivio timeline, una retention dedicata, export di processo, compensazioni o strumenti supporto per run/step. I riferimenti tecnici e i DTO futuri non sono definiti.

## Decisioni aperte e hard stop

Restano da approvare retention e cancellazione di timeline/eventi, accesso del supporto, contenuto degli export, compensazioni parziali, livelli di servizio, notifiche aggiuntive e policy per documenti sensibili. Nessuna di queste decisioni viene dedotta dall'audit corrente.
