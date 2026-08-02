# Support and data control

## `verified_current_state`

`SUPPORT_AGENT` e metadata-only/read-only tramite sessione temporanea motivata; `PLATFORM_ADMIN` usa guard globali separati. Il data-control corrente inventaria ed esporta metadati Azienda. Share link e download restano mediati; Blob key, token e URL permanenti non vengono esposti. Questi flussi non sono export, portabilita o account deletion cliente vNext.

## `approved_product_direction`

### D-VNEXT-31 - export

`CLIENT_EXPORT` e `ORGANIZATION_EXPORT` sono snapshot distinti con indice leggibile, timeline umana, manifest JSON, allegati autorizzati, fingerprint, timestamp e versione.

- link alla pagina export inviato per email: 7 giorni;
- URL firmato o download ticket: 15 minuti;
- archivio binario preparato: 30 giorni;
- manifest e record export: conservati con il cantiere;
- autenticazione sempre richiesta; nessun link anonimo e nessun archivio pesante allegato all'email;
- un export scaduto e rigenerabile come nuovo snapshot, se l'accesso resta valido.

| Entita | Client export | Organization export | Data-control cliente |
| --- | --- | --- | --- |
| profilo cliente e immobili privati | si, dati propri | no salvo dati esplicitamente condivisi | si |
| partecipazioni cliente | si | metadati del proprio cantiere | si |
| timeline/eventi condivisi | si | si | si |
| timeline/note interne | no | si secondo permessi | no |
| step condivisi | si | si | si |
| proposte/versioni/accettazioni | si se parte | si se autorizzato | si |
| pagamenti/ricevute | si se parte | si con capability | si |
| documenti/prove condivisi | si | si | si |
| documenti Worker/dati sensibili interni | no | solo secondo policy Azienda | no |
| audit tecnico e security audit | no | solo flussi amministrativi esistenti | no |
| chiusure, post-chiusura, dispute condivise | si | si | si |

### D-VNEXT-34 - cancellazione cantiere

Nel primo rilascio esiste solo archiviazione logica dei cantieri chiusi. La cancellazione fisica resta disabilitata. Un futuro flusso, non autorizzato ora, richiederebbe: richiesta Owner, verifica eleggibilita, informazione cliente, export, cooling-off di 30 giorni, verifica hold/dispute e job tracciato.

Blocker: legal hold, disputa, richiesta post-chiusura aperta, pagamento irrisolto, proposta aperta, export pendente o obbligo validato. Nessuna parte cancella unilateralmente la storia condivisa.

### D-VNEXT-35 - portabilita cliente

La portabilita comprende profilo, immobili/link, partecipazioni, timeline condivise, commenti, allegati propri, proposte/accettazioni, pagamenti ed export finali, in JSON, file e indice leggibile. Esclude note interne, documenti Worker, permessi Azienda, audit tecnico, altri clienti e cantieri non autorizzati. Non trasferisce ownership o accesso.

### D-VNEXT-36 - eliminazione account cliente

Flusso concettuale: richiesta, verifica identita, controllo membership/ownership, export, disattivazione, cooling window, quindi eliminazione o pseudonimizzazione consentita. L'esatta cooling window account resta inclusa nella policy di retention definitiva.

- un sole Owner deve prima risolvere ownership Azienda;
- inviti pendenti vengono revocati; sessioni e token invalidati;
- immobili e note private vengono eliminati quando consentito;
- storia condivisa, accettazioni e ricevute non vengono riscritte;
- l'autore storico puo diventare pseudonimo stabile e minimizzato;
- allegati condivisi seguono retention/hold del cantiere;
- hold e dispute prevalgono; notifiche alle Aziende sono minimizzate.

Matrice cancellazione/pseudonimizzazione:

| Entita | Eliminabile | Pseudonimizzabile | Preservazione |
| --- | --- | --- | --- |
| credenziali, sessioni, token | si | non applicabile | revoca immediata |
| profilo e contatti privati cliente | secondo retention | si | hold/account obligations prevalgono |
| ClientProperty e note private | secondo retention | proprietario rimosso/minimizzato | link condivisi non trasferiscono note |
| inviti pendenti | revocabili | email minimizzata secondo policy | record di sicurezza minimo |
| partecipazione storica | no riscrittura | autore/utente pseudonimizzabile | lifecycle e timestamp restano |
| timeline/commenti condivisi | no riscrittura | autore pseudonimizzabile | contenuto segue cantiere/hold |
| proposte/accettazioni | no | identita minimizzabile se consentito | snapshot e parte rappresentata preservati |
| pagamenti/ricevute | secondo retention legale | identita minimizzabile | disputa/hold prevalgono |
| allegati propri non condivisi | eliminabili secondo policy | metadati minimi | hold prevale |
| allegati condivisi/export | seguono cantiere | manifest minimizzato | non cancellati unilateralmente |

### D-VNEXT-33 e D-VNEXT-37 - supporto, hold e dispute

Support non legge contenuti, ricevute, IBAN o allegati e non rilascia hold. Platform Admin puo intervenire soltanto tramite flusso motivato, auditato e autorizzato; non decide il merito di una disputa. Qoovex preserva il thread e i record collegati senza arbitrare.

## `conceptual_not_implemented`

Export cliente, portabilita, account deletion, legal hold, dispute preservation e cancellazione futura non sono servizi, job o route attivi. Le funzioni data-control Azienda correnti non devono essere reinterpretate come questi flussi.

## `hard_stop`

Retention canonica definitiva blocca la cancellazione fisica e la conclusione dell'account-deletion policy. Il database remoto resta un gate separato per qualunque futuro deploy.
