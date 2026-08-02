# Product and scope

## `verified_current_state`

Il Workspace implementa oggi Aziende, `OWNER` e `COLLABORATOR`, Worker, cantieri, documenti/versioni private, requisiti, scadenze, calendario, checklist, prove, richieste, messaggi interni, timeline contestuale, pacchetti, condivisioni, notifiche, processi, decisioni, eccezioni, audit, export e data-control.

Il runtime corrente e single-membership per account: `OrganizationMembership.userId` e univoco. `JobSite` conserva `clientName` testuale e `JobSiteOperationalPhase`; non esiste una partecipazione cliente account. Le timeline correnti sono aziendali, la ricerca consulta metadati aziendali autorizzati e gli esterni usano share link tokenizzati di pacchetti revisionati. Le cinque definizioni attive restano `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1`, `CONTINUOUS_CONTROL@1` e `DOCUMENT_PACKAGE_SHARING@1`.

## `approved_product_direction`

Qoovex vNext e lo spazio condiviso in cui un'impresa gestisce un lavoro edile con il cliente, documentando avanzamento, step opzionali, modifiche, prove e pagamenti dalla creazione del cantiere alla chiusura.

- Promessa Azienda: documentare il lavoro una volta e riusare gli stessi aggiornamenti autorizzati per informare il cliente, gestire le modifiche e presentare richieste di pagamento.
- Promessa cliente: seguire i lavori sui propri immobili, controllare ogni modifica e conservare cio che e stato condiviso.
- Problema: accordi, avanzamento, modifiche, fotografie, prove, scontrini, richieste, pagamenti e conferme sono dispersi tra messaggi, telefonate, bonifici, email, file e memoria. vNext crea una cronologia condivisa, strutturata, versionata e scaricabile.

### Registro D-VNEXT-18-45

Tutte le decisioni nella tabella hanno stato `approved_product_direction` e implementation status `conceptual_not_implemented`.

| ID | Decisione approvata | Fonte di dettaglio |
| --- | --- | --- |
| `D-VNEXT-18` | Un `User` opera in contesti piattaforma, Azienda e cliente-cantiere espliciti; il cambio contesto non trasferisce permessi. | `01`, `02` |
| `D-VNEXT-19` | `JobSiteParticipant` distingue `ORGANIZATION_MEMBER` e `CLIENT`, con lifecycle e vincoli job-site-scoped. | `01`, `04` |
| `D-VNEXT-20` | Il modello futuro consente membership multiple con unicita per Azienda e User, senza includere le partecipazioni cliente. | `01`, `06` |
| `D-VNEXT-21` | `ClientProperty` e un contenitore privato del cliente; non e tenant ne prova di proprieta. | `02`, `08` |
| `D-VNEXT-22` | L'autorita deriva da una matrice contestuale attore-capability default-deny. | `01` |
| `D-VNEXT-23` | L'autorita economica di un Collaborator richiede una delega esplicita, revocabile e verificata al momento dell'effetto. | `01`, `04` |
| `D-VNEXT-24` | L'invito cliente e separato dall'invito Azienda, email-bound, one-time, hashato, con durata di 14 giorni e lifecycle documentato. | `01`, `04` |
| `D-VNEXT-25` | Una storia append-only produce read model `INTERNAL` e condivisi con disclosure esplicita; timeline, audit e processi restano separati. | `03`, `04` |
| `D-VNEXT-26` | Gli allegati restano Blob privati, versionati, con provenienza, audience e download mediato; condividere crea una disclosure separata. | `03` |
| `D-VNEXT-27` | Proposte e controproposte sono versionate, concorrenziali e accettabili soltanto sulla versione corrente completa. | `04` |
| `D-VNEXT-28` | L'IBAN appartiene a un profilo pagamenti Azienda versionato e protetto; ogni richiesta ne congela una rappresentazione. | `03`, `04` |
| `D-VNEXT-29` | Le ricevute sono contenuti commerciali ristretti, privati e mediati; non provano automaticamente l'accredito. | `03`, `08` |
| `D-VNEXT-30` | Notifiche immediate e digest seguono evento, destinatario, criticita, deduplica e minimizzazione. | `04` |
| `D-VNEXT-31` | Export cliente e Azienda sono snapshot distinti, autenticati, fingerprinted e con durate definite. | `08` |
| `D-VNEXT-32` | Nel primo MVP non esiste cancellazione automatica dei dati canonici; inviti, URL ed export binari hanno durate tecniche definite. | `03`, `08` |
| `D-VNEXT-33` | Dispute preservation e legal hold bloccano la distruzione senza ampliare la visibilita. | `03`, `08` |
| `D-VNEXT-34` | Il primo rilascio consente solo archiviazione logica; cancellazione fisica del cantiere resta disabilitata. | `06`, `08` |
| `D-VNEXT-35` | Il cliente puo ottenere una portabilita dei propri dati e dei contenuti condivisi autorizzati, non dei dati interni Azienda. | `08` |
| `D-VNEXT-36` | Eliminare un account cliente non riscrive la storia condivisa; identita storiche possono essere pseudonimizzate secondo policy. | `08` |
| `D-VNEXT-37` | Una disputa e un thread append-only tra le parti; Qoovex preserva e documenta, non arbitra. | `04`, `08` |
| `D-VNEXT-38` | La riapertura post-chiusura richiede proposta e conferma reciproca e crea un nuovo episodio. | `04` |
| `D-VNEXT-39` | `PRIMARY_CLIENT` e il solo ruolo cliente MVP; ruoli cliente futuri restano esterni a `OrganizationRole`. | `01` |
| `D-VNEXT-40` | Qoovex e un SaaS B2B pagato dall'Azienda; cliente gratuito e Collaborator incluso, senza commissioni o marketplace. | `00` |
| `D-VNEXT-41` | `clientName` resta snapshot legacy; nessun matching automatico, account retroattivo o conferma implicita. | `06` |
| `D-VNEXT-42` | `JobSiteOperationalPhase` resta durante il rollout; vNext usa lifecycle dedicati e non reinterpreta `COMPLETED`. | `04`, `06` |
| `D-VNEXT-43` | I cinque processi `@1` restano immutati; i processi vNext usano definizioni/versioni nuove e non concedono accesso. | `04`, `06` |
| `D-VNEXT-44` | Il rollout separa `LEGACY` e `VNEXT`, senza conversione automatica e con rollback senza perdita. | `06`, `07` |
| `D-VNEXT-45` | L'implementazione futura sara coordinata in un prompt, una branch/PR e una sola migration Prisma additiva, salvo hard stop tecnico provato. | `06`, `07` |

### Modello commerciale approvato

- paga soltanto l'Azienda tramite futura sottoscrizione B2B SaaS;
- l'accesso Collaborator e incluso nell'Azienda;
- il cliente accede gratuitamente ai cantieri autorizzati;
- nessuna commissione, trattenuta, transaction fee, acquisto cliente o marketplace;
- la cessazione della sottoscrizione non cancella subito i dati; un eventuale periodo di tolleranza e ancora da definire.

Prezzi, piani, limiti, trial, entitlement, storage e periodo di tolleranza commerciale non sono definiti.

### Fuori MVP

Marketplace, ricerca imprese, preventivi, commissioni, pagamento in app, escrow, trattenimento fondi, rimborsi, arbitrato, KYC, firma elettronica qualificata, fatturazione, contabilita, paghe, BIM, geolocalizzazione continua, sorveglianza, IA normativa o valutativa, modifiche economiche automatiche, portfolio pubblico e recensioni pubbliche.

## `conceptual_not_implemented`

D-VNEXT-18-45 non prova alcuna capability. Nomi di entita, campi, enum, lifecycle, capability, processi e modalita sono il contratto concettuale per una futura implementazione coordinata; non sono Prisma, DTO, permission key, route, servizio, UI, job o configurazione attivi.

La Fase A documentale e completa con questo contratto. La successiva attivita tecnica non e autorizzata da questo documento.

## `open_decision` e `hard_stop`

Restano tre hard stop decisionali vNext:

1. retention definitiva dei dati canonici, da validare legalmente e lato privacy;
2. protezione tecnica dell'IBAN a riposo, key management, rotazione, recupero e accesso operativo;
3. prezzi, limiti, trial e periodo di tolleranza commerciale.

Restano inoltre due gate operativi, non decisioni architetturali:

1. stato, fingerprint e autorizzazione del database remoto al momento di un futuro deploy;
2. eventuale evidenza tecnica che renda insicura una sola migration coordinata.

Cancellazione fisica e deploy Production restano disabilitati finche i rispettivi hard stop o gate non sono chiusi. Gli hard stop operativi generali del repository non collegati a vNext restano invariati.
