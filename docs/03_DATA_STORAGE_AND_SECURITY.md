# Data, storage and security

## `verified_current_state`

Prisma conserva record, relazioni, stati e audit; Vercel Blob privato conserva i binari. Il repository contiene 17 migration verificate senza drift soltanto sul database locale guardato. `ContextMessage.visibility` contiene solo `INTERNAL`; `ContextTimelineEvent`, `OperationalEvent`, `ProductAuditEvent` e `SecurityAuditEvent` hanno scopi separati. Prove e documenti hanno revisioni; pacchetti condivisi congelano manifest e fingerprint. Il data-control Azienda corrente non e l'export cliente vNext.

## `approved_product_direction`

### D-VNEXT-25 - timeline canonica

La storia vNext e append-only, strutturata, versionata e scaricabile. Non e una chat. Correzioni, ritiro e sostituzione aggiungono eventi e non riscrivono versioni precedenti. Ogni evento conserva autore, parte rappresentata, timestamp, cantiere, eventuale step, audience, disclosure e riferimenti immutabili.

Audience concettuali: `INTERNAL`, `SHARED`. `SHARED` e il contratto tecnico della visibilita prodotto `SHARED_WITH_CLIENT`. Disclosure concettuali: `GENERAL`, `COMMERCIAL`, `RESTRICTED_COMMERCIAL`. L'evento di condivisione congela lo snapshot autorizzato; cambiare un record sorgente non cambia cio che era stato mostrato.

Matrice audience-disclosure-attore:

| Audience / disclosure | Owner | Responsabile | Collaborator autorizzato | Collaborator operativo | Cliente principale | Support |
| --- | --- | --- | --- | --- | --- | --- |
| `INTERNAL/GENERAL` | si | si | secondo scope | secondo scope | no | soli metadati consentiti |
| `INTERNAL/COMMERCIAL` | si | delega/capability | delega/capability | no | no | no contenuto |
| `INTERNAL/RESTRICTED_COMMERCIAL` | si in contesto | capability esplicita | capability esplicita | no | no | no |
| `SHARED/GENERAL` | si | si | secondo capability | se autore/assegnato | si | soli metadati consentiti |
| `SHARED/COMMERCIAL` | si | si se autorizzato | delega/capability | no | si | no contenuto |
| `SHARED/RESTRICTED_COMMERCIAL` | si in contesto | capability pagamento | capability pagamento | no | si per i propri record | no |

Matrice eventi canonici:

| Famiglia evento | Audience minima | Disclosure | Autori ammessi |
| --- | --- | --- | --- |
| nota/attivita interna | `INTERNAL` | `GENERAL` | membri Azienda autorizzati |
| aggiornamento, commento, prova o documento condiviso | `SHARED` | `GENERAL` | partecipanti autorizzati |
| step creato/aggiornato/pronto/confermato/riaperto | `SHARED` oppure `INTERNAL` per la bozza | `GENERAL` | Azienda; cliente solo conferma/commento |
| proposta, controproposta, accettazione, rifiuto, ritiro | `SHARED` | `COMMERCIAL` | parti e delegati autorizzati |
| richiesta chiarimento, risposta, problema | `SHARED` o `INTERNAL` secondo origine | `GENERAL` | partecipanti autorizzati |
| pagamento richiesto/invio dichiarato/confermato/contestato | `SHARED` | `RESTRICTED_COMMERCIAL` | parte economica autorizzata |
| chiusura proposta/confermata/riapertura/post-chiusura | `SHARED` | `COMMERCIAL` | parti autorizzate |
| legal hold, controllo tecnico, supporto | `INTERNAL` | secondo dato | soli attori amministrativi autorizzati |

La timeline cliente deriva soltanto dagli eventi `SHARED`; timeline interna, audit tecnico e stato dei processi non vengono esposti direttamente.

### D-VNEXT-26 - allegati

Ogni allegato futuro conserva sorgente, audience, disclosure, uploader e parte rappresentata, checksum, MIME verificato, dimensione, versione, collegamento al record, sostituzione/ritiro e timestamp. Il filename non e una fonte autorevole. I binari restano Blob privati; il download usa autorizzazione corrente e URL temporaneo o streaming mediato. Una disclosure crea un evento/versione separata, non cambia un flag sul file interno. File caricati dal cliente sono ammessi soltanto dentro flussi strutturati e diventano visibili ai soli utenti Azienda autorizzati.

| Tipo allegato | Audience/disclosure | Chi puo scaricare | Vincoli |
| --- | --- | --- | --- |
| prova interna Azienda | `INTERNAL/GENERAL` | membri nello scope con permesso file | mai visibile al cliente per deduzione |
| prova condivisa | `SHARED/GENERAL` | partecipanti attivi autorizzati | snapshot/versione immutabile |
| documento condiviso | `SHARED/GENERAL` o `COMMERCIAL` | partecipanti autorizzati | classificazione e review prima della disclosure |
| allegato proposta | `SHARED/COMMERCIAL` | parti della proposta | legato alla versione precisa |
| ricevuta pagamento | `SHARED/RESTRICTED_COMMERCIAL` | cliente autore, Owner e capability pagamento | non a tutti i Collaborator; accesso minimizzato e auditato |
| immagine immobile | privato cliente | proprietario account | mai ereditata dal cantiere/Azienda |
| documento Worker | `INTERNAL` | soli attori Azienda autorizzati | escluso dalla superficie cliente |
| export | audience dell'export | richiedente autenticato autorizzato | fingerprint, scadenza e download mediato |

MIME dichiarato e contenuto devono concordare; checksum e dimensione vengono verificati. Ritiro o sostituzione non cancella la versione dalla cronologia autorizzata. Email e notifiche non allegano file, ricevute o archivi pesanti e non contengono Blob key o URL persistenti.

### D-VNEXT-28 - IBAN

`OrganizationPaymentProfile` e un concetto futuro versionato con campi concettuali `accountHolder`, `ibanProtected`, `ibanLastFour`, `bankLabel?`, `version`, `createdBy`, `activatedAt`, `revokedAt?`. Creazione e modifica richiedono MFA o riverifica adeguata. UI, audit, log, email e notifiche mostrano solo dati minimizzati; il testo prudente e "IBAN indicato dall'Azienda", mai verificato o certificato da Qoovex.

Ogni richiesta di pagamento congela `paymentProfileVersion`, intestatario e rappresentazione mascherata. Una modifica successiva non altera richieste gia inviate. Se l'IBAN di una richiesta e errato, la richiesta viene annullata e ricreata: non si riscrive lo snapshot.

La cifratura a riposo, key management, rotazione, recupero e accesso operativo sono hard stop tecnico residuo.

### D-VNEXT-29 - ricevute

Le ricevute sono `SHARED/RESTRICTED_COMMERCIAL`. Sono visibili al cliente principale, Owner nel contesto corretto, responsabile o Collaborator con capability pagamento attiva. Support non legge il contenuto. Il download e privato e mediato; correzioni generano una nuova versione. La ricevuta e la dichiarazione cliente non confermano automaticamente l'accredito.

### D-VNEXT-32 e D-VNEXT-33 - retention e preservazione

| Entita | Durata approvata MVP | Distruzione automatica | Note |
| --- | --- | --- | --- |
| dati canonici cantiere, timeline, step, proposte, pagamenti | seguono il cantiere | no | retention definitiva hard stop |
| cantiere chiuso/archiviato | conservato read-only | no | archiviazione non e cancellazione |
| invito cliente | 14 giorni | token diventa inutilizzabile | record minimizzato conservato secondo policy canonica |
| link pagina export inviato per email | 7 giorni | link scade | autenticazione sempre richiesta |
| URL firmato download | 15 minuti | URL scade | non persistito in audit/log |
| archivio binario export | 30 giorni | eliminabile dopo scadenza se non in hold | manifest/record export resta col cantiere |
| ricevute e allegati condivisi | seguono il cantiere | no | hold/disputa prevalgono |
| audit/security correnti | policy corrente | invariata | ridefinizione fuori da questo task |

`DisputePreservation` si applica automaticamente agli elementi collegati a una disputa e termina solo tramite lifecycle della disputa e policy approvata. `LegalHold` concettuale conserva `scope`, `reason`, `placedBy`, `placedAt`, `reviewAt`, `releasedBy?`, `releasedAt?`, `releaseReason?`. Owner autorizzato o Platform Admin su richiesta documentata puo applicarlo; Support no. Il rilascio e auditato, mai automatico e soggetto a revisione periodica.

| Scope hold | Elementi preservati | Chi puo applicare | Condizione di rilascio |
| --- | --- | --- | --- |
| cantiere | storia e allegati del cantiere | Owner autorizzato / Platform Admin motivato | review documentata e policy approvata |
| proposta | versioni, allegati, accettazioni, receipt | stessi attori | disputa/obbligo risolto e review |
| pagamento | richiesta, dichiarazioni, ricevute, conferme | stessi attori | disputa/obbligo risolto e review |
| chiusura/post-chiusura | riepiloghi, thread, export | stessi attori | review documentata |
| account cliente | riferimenti condivisi e identita minima | Platform Admin motivato / processo autorizzato | esito data-control e policy |

Un hold blocca cancellazione fisica e cleanup distruttivi ma non amplia accesso o disclosure. Il cliente viene informato quando legalmente e operativamente consentito.

## Threat model vNext

Questa matrice e un contratto di sicurezza futuro; i controlli non sono dichiarati attivi.

| Rischio | Asset | Attore | Vettore | Impatto | Preventivo richiesto | Investigativo richiesto | Test / residuo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| accesso cross-tenant | cantieri/dati | utente autenticato | ID di altro tenant | disclosure/mutazione | tenant derivato dal JobSite, default-deny | audit accesso negato minimizzato | test isolamento su ogni servizio; residuo bug applicativo |
| confused deputy | autorita Azienda | client/servizio | parametro parte rappresentata | impegno non autorizzato | parte e capability server-derived | receipt con actor/context | test actor-context; residuo integrazione |
| cliente trasformato in membro | superfici interne | cliente | riuso invito/membership | escalation | inviti e tabelle separate, no `CLIENT` role | alert su tipo incoerente | test nessuna membership; residuo migration |
| confusione membership | dati multi-Azienda | membro | contesto stale | leakage | context ID firmato e membership esplicita | log cambio contesto | test multi-membership; residuo cache |
| doppio ruolo nello stesso cantiere | neutralita delle parti | account | due partecipazioni opposte | auto-accettazione | constraint/policy di esclusione | evento conflitto | test dual-role; residuo merge account |
| delega economica abusiva | impegni Azienda | Owner/attaccante | grant eccessivo | perdita economica | grant site-scoped, capability-specifico, MFA | audit grant/revoca | test least privilege; residuo abuso Owner |
| delega revocata riusata | impegni Azienda | ex delegato | token/bozza stale | effetto non autorizzato | rivalidazione al commit + accessVersion | receipt e deny event | race test; residuo latenza distribuita |
| permission stale | tutte le risorse | membro revocato | sessione/cache | accesso persistente | invalidazione sessione/cache contestuale | audit version mismatch | test revoca immediata; residuo propagazione |
| race versione proposta | accordo | due parti | update concorrenti | perdita revisione | expected current version | eventi conflitto | test optimistic concurrency; residuo retry UX |
| accettazione versione errata | accordo | controparte | UI/cache stale | consenso errato | fingerprint/versione esplicita e snapshot | acceptance receipt | test stale acceptance; residuo comprensione umana |
| modifica IBAN malevola | coordinate pagamento | account compromesso | update profilo | pagamento errato | MFA/riverifica, versioni, notifica critica | audit minimizzato e alert | test cambio/rollback; residuo account takeover |
| ricevuta esposta | dato finanziario | membro non autorizzato | endpoint/file | privacy breach | disclosure ristretta, URL breve | audit download | test matrix; residuo screenshot utente |
| allegato interno condiviso | dati interni | membro | flag/riuso file | disclosure | disclosure event separato + review | audit snapshot | test no flag mutation; residuo errore review |
| URL Blob persistente | binari | destinatario | URL loggato/cache | accesso prolungato | Blob privato, URL 15 minuti, no log | scansione audit/log | test expiry; residuo inoltro entro TTL |
| IDOR | record | utente | ID prevedibile | leakage/mutazione | lookup context+tenant+scope | deny audit | test IDOR su tutte le route; residuo omissione guard |
| enumeration inviti | identita | anonimo | errori distinguibili | privacy | risposte uniformi/rate limit | metriche aggregate | test indistinguibilita; residuo timing |
| token replay | partecipazione | destinatario/attaccante | token riusato | accesso duplicato | token one-time hashato e superseded | evento consumo | test replay; residuo furto prima uso |
| account takeover | account | attaccante | credenziali/sessione | accesso completo | MFA, authVersion, session revoke | security audit/alert | test session binding; residuo phishing |
| export cross-tenant | archivio | membro | job/export ID | data breach | requester/context/tenant su create e download | audit export/download | test export isolation; residuo bug storage |
| cancellazione durante disputa | prove | Owner/processo | delete job | perdita evidenza | hold/preservation blocker | evento delete blocked | test blocker; residuo policy errata |
| account deletion riscrive storia | cronologia | processo data-control | cascade/purge | perdita integrita | pseudonimizzazione, FK restrictive e snapshot | manifest data-control | test deletion graph; residuo policy legale |
| leakage stesso immobile | cantieri cross-company | Azienda | property join | tenant discovery | property private, no company query | audit accesso anomalo | test same-property isolation; residuo metadata laterale |
| Support legge contenuti | file/timeline | Support Agent | endpoint interno | disclosure | metadata-only guard anche su client surface | audit support | test file/content deny; residuo privilege bug |
| Platform Admin senza motivo | dati globali | admin | accesso diretto | abuso privilegi | purpose/authorization espliciti | audit immutabile/review | test reason required; residuo insider |
| bypass feature flag | vNext incompleta | utente | route diretta | uso prematuro | gate server-side per mode/capability | metriche deny | test flag off; residuo misconfig |
| conversione legacy incompleta | cantiere | deploy | backfill parziale | stato incoerente | conversione esplicita, validation report | reconciliation report | dataset legacy; residuo dati inattesi |
| rollback dopo backfill | integrita | deploy | codice vecchio su schema nuovo | corruzione | compat window e additive writes | metriche/read verification | rollback rehearsal; residuo durata window |
| processi `@1` reinterpretati | audit/processi | nuova release | semantic reuse | storia falsa | definizioni/versioni nuove | registry diff | test snapshot @1; residuo chiamante legacy |
| doppio effetto economico | pagamenti/proposte | retry/concorrenza | replay | duplicazione | effect key e receipt univoco | reconciliation receipt | test idempotenza; residuo provider esterno |
| email sensibile | IBAN/ricevute | notifier | subject/body/allegato | leakage | template minimizzato, no file/IBAN pieno | test snapshot e delivery audit | test redaction; residuo provider email |
| cache condivisa tra contesti | read model | utente multi-contesto | chiave incompleta | cross-context leakage | chiave include user+context+version | telemetry miss/mismatch | test switch context; residuo CDN config |
| search leakage | contenuti | cliente/membro | indice non filtrato | disclosure | indice/read query per audience e scope | audit query minimizzato | test negative corpus; residuo ranking side-channel |
| audit con IBAN/Blob key | segreti | servizio | metadata non filtrato | leakage persistente | allow-list e redazione | scanner automatico | test forbidden keys; residuo nuove chiavi |

## `conceptual_not_implemented`

Audience, disclosure, profilo pagamento, ricevute vNext, retention, hold e controlli del threat model non sono enum, modelli, policy runtime o job attivi. Blob, download e audit correnti restano invariati.

## `hard_stop`

Retention definitiva e protezione IBAN/key management restano aperte. Nessuna cancellazione fisica e autorizzata; hold e dispute prevalgono su qualunque futuro cleanup.
