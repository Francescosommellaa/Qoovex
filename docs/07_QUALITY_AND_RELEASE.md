# Quality and release

## `verified_current_state`

Il gate standard prodotto e `pnpm check`; `pnpm check:ci` aggiunge E2E. Per un task documentale il protocollo richiede parsing JSON, audit riferimenti/terminologia, `pnpm check:fast` e `git diff --check`. Le suite correnti coprono soltanto dominio, access model, processi `@1`, ricerca Azienda, timeline interne e condivisioni a pacchetto.

## `approved_product_direction` - piano test futuro

Il futuro prompt unico dovra aggiungere test, senza riusare le suite correnti come prova vNext:

- multi-membership e cambio contesto con cache/session invalidation;
- partecipanti e inviti, token replay, email binding, 14 giorni, supersede e revoca;
- isolamento cross-tenant e tra cantieri dello stesso immobile;
- matrice attore-capability e delega/revoca economica, incluse race stale;
- timeline audience/disclosure e allegati/download/receipt;
- optimistic concurrency di proposte e accettazione fingerprinted;
- payment-profile versioning, IBAN redaction, pagamenti separati e receipt idempotenti;
- notifiche, dedupe, preferenze e redazione email;
- dispute, hold, closure reciproca, post-closure e reopening;
- client/org export, scadenze link, data-control e account deletion;
- compatibility dataset legacy, conversione esplicita, rollback e processi `@1` immutati.

Dataset minimo futuro: User senza membership; User con due membership; Owner/Collaborator in Aziende diverse; cliente di cantieri cross-company sullo stesso immobile; un cliente principale; inviti pending/expired/revoked/superseded; grant attivo/scaduto/revocato; proposta concorrente; payment profile versionato; ricevuta ristretta; disputa/hold; JobSite legacy per ogni phase e con/senza `clientName`; processi e share link `@1`.

Smoke test futuri: login e scelta contesto; Workspace legacy; creazione vNext allow-listed; invito/conferma; timeline internal/shared; proposta e pagamento; closure/export; revoke; rollback flag-off. Tutti verificano negative access prima del percorso positivo.

## Indice delle 20 matrici canoniche

| # | Matrice | Fonte |
| --- | --- | --- |
| 1 | attore x capability | `01_DOMAIN_AND_AUTHORIZATION.md` |
| 2 | contesto x authorization source | `01_DOMAIN_AND_AUTHORIZATION.md` |
| 3 | partecipante x stato x azioni | `01_DOMAIN_AND_AUTHORIZATION.md` |
| 4 | invito x stato x transizioni | `04_RUNTIME_AND_FEATURES.md` |
| 5 | proposta x stato x transizioni | `04_RUNTIME_AND_FEATURES.md` |
| 6 | pagamento x stato x transizioni | `04_RUNTIME_AND_FEATURES.md` |
| 7 | disputa x stato x transizioni | `04_RUNTIME_AND_FEATURES.md` |
| 8 | chiusura x stato x transizioni | `04_RUNTIME_AND_FEATURES.md` |
| 9 | riapertura x stato x transizioni | `04_RUNTIME_AND_FEATURES.md` |
| 10 | audience x disclosure x attore | `03_DATA_STORAGE_AND_SECURITY.md` |
| 11 | allegato x visibilita x download | `03_DATA_STORAGE_AND_SECURITY.md` |
| 12 | evento x destinatario x notifica | `04_RUNTIME_AND_FEATURES.md` |
| 13 | entita x retention | `03_DATA_STORAGE_AND_SECURITY.md` |
| 14 | legal hold x scope | `03_DATA_STORAGE_AND_SECURITY.md` |
| 15 | legacy record x strategia backfill | `06_OPERATIONS_AND_ENVIRONMENT.md` |
| 16 | processo corrente x compatibilita vNext | `04_RUNTIME_AND_FEATURES.md` |
| 17 | operazione x effect receipt | `04_RUNTIME_AND_FEATURES.md` |
| 18 | entita x data-control/export | `08_SUPPORT_AND_DATA_CONTROL.md` |
| 19 | entita x cancellazione/pseudonimizzazione | `08_SUPPORT_AND_DATA_CONTROL.md` |
| 20 | rischio x mitigazione | `03_DATA_STORAGE_AND_SECURITY.md` |

## Acceptance criteria della futura release

- migration unica applicata da zero e su snapshot rappresentativa senza drift o perdita;
- ogni record legacy resta leggibile e semanticamente invariato;
- nessuna conversione automatica, disclosure retroattiva o doppio ruolo nello stesso cantiere;
- ogni read/write e tenant-, context-, audience- e capability-scoped;
- nessun N+1 e nessuna scansione non indicizzata nei flussi critici;
- processi `@1` e share link correnti restano compatibili;
- receipt impediscono doppi effetti; race e stale version falliscono in modo sicuro;
- Blob, IBAN, ricevute, email, audit ed export rispettano redazione e scadenze;
- flag off e rollback applicativo preservano dati e Workspace legacy;
- restore provato prima di qualunque deploy remoto.

## Gate del contratto documentale corrente

- D-VNEXT-18-45 presenti e classificati correttamente;
- 20 matrici, lifecycle, threat model e piano migration unica completi;
- `CLIENT` mai in `OrganizationRole`; ruoli legacy non reintrodotti;
- stato corrente, 17 migration, single-membership, `clientName`, phase, timeline interne e processi `@1` preservati;
- nessun enum futuro descritto come attivo, prezzo inventato, promessa legale o cancellazione autorizzata;
- diff esclusivamente documentale; foundation visuale invariata;
- JSON valido, `pnpm check:fast` e `git diff --check` verdi.

## `conceptual_not_implemented`

Nessun test, fixture, E2E, gate di deploy o migration vNext viene aggiunto da questo task.

## `hard_stop` e gate

Non dichiarare una release pronta. Retention, protezione IBAN e commerciale sono hard stop decisionali; database remoto e sicurezza della migration unica sono gate operativi.
