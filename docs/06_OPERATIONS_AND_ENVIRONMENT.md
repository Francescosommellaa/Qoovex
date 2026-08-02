# Operations and environment

## `verified_current_state`

Production, Preview, locale e CI/E2E usano target distinti e guardati. Il repository contiene 17 migration canoniche, tutte applicate da zero e verificate senza drift soltanto sul database locale guardato. Nessun ambiente remoto e attestato. Query, cache, invalidazione, tenant isolation, runner, workflow, env e provider correnti restano invariati.

## Database operation impact - task documentale

```text
Operazioni aggiunte: 0
Operazioni eliminate: 0
Query per flusso prima: invariato
Query per flusso dopo: invariato
Rischio N+1: invariato
Strategia cache: invariata
Strategia invalidazione: invariata
Impatto tenant isolation: nessuno
Ambienti coinvolti: soli file documentali locali e Qoovex-Brain
Misurazione eseguita: non applicabile; database e Blob non interrogati
```

## `approved_product_direction`

### D-VNEXT-41 - strategia legacy `clientName`

`clientName` resta snapshot storico e non viene usato per creare o trovare un account. Nessun matching automatico per nome, email o indirizzo. Un cantiere legacy senza partecipazione mostra concettualmente "Cliente non collegato"; il collegamento richiede invito esplicito e accettazione. Nessun cliente legacy deve confermare retroattivamente il riepilogo e `COMPLETED` legacy non equivale a chiusura reciproca.

Matrice legacy-backfill:

| Record corrente | Strategia futura | Validazione | Divieto |
| --- | --- | --- | --- |
| membership attiva unica | preservare la riga e introdurre unicita `(organizationId,userId)` | nessun duplicato nella stessa Azienda | nessun cambio Azienda o ruolo |
| membership revocata | preservare storico/revoca | coppia Azienda-User coerente | nessuna riattivazione automatica |
| invito Azienda pendente | resta invito `COLLABORATOR` corrente | token/lifecycle invariati | non convertirlo in invito cliente |
| `JobSite.clientName` valorizzato | conservarlo come snapshot legacy | valore invariato | niente account/matching automatico |
| `clientName` vuoto | nessun partecipante creato | cantiere resta valido | niente placeholder account |
| JobSite legacy non completato | modalita `LEGACY` | phase invariata | nessuna conferma cliente retroattiva |
| JobSite `COMPLETED` | resta completato legacy | nessuna chiusura vNext implicita | niente export/closure artificiale |
| assegnazioni User/Worker | preservare integralmente | stesso tenant e storico | non creare partecipanti CLIENT |
| ContextMessage/TimelineEvent | restano interni Azienda | audience corrente invariata | nessuna disclosure retroattiva |
| Evidence/DocumentVersion | preservare Blob e metadati | checksum/metadati invariati | nessuna condivisione automatica |
| package revision/share link | preservare contratto corrente | token/revision invariati | non equivale a account cliente |
| processi e receipt `@1` | preservare tipo/versione/semantica | registry snapshot invariato | nessuna reinterpretazione vNext |

### D-VNEXT-42 - compatibilita `JobSiteOperationalPhase`

| Stato corrente | Significato legacy | Relazione vNext |
| --- | --- | --- |
| `DRAFT` | preparazione interna corrente | non equivale a partecipazione/invito |
| `PREPARATION` | preparazione operativa corrente | non equivale a conferma iniziale |
| `IN_PROGRESS` | lavoro operativo corrente | non equivale automaticamente a `ACTIVE` vNext |
| `PAUSED` | pausa operativa | nessuna equivalenza con sospensione partecipante |
| `CLOSING` | chiusura operativa corrente | non equivale a closure proposal |
| `COMPLETED` | completamento legacy, anche con override Owner | non equivale a chiusura reciproca |

Il campo resta leggibile e scrivibile dai flussi legacy durante la compatibility window. I nuovi cantieri vNext usano un lifecycle dedicato; la UI vNext non espone fasi separate e l'avanzamento deriva dagli step. Il campo non viene rimosso finche ogni dipendenza, processo, DTO, filtro e report legacy non e eliminato da un task successivo.

### D-VNEXT-44 - rollout `LEGACY/VNEXT`

| Modalita | Record ammessi | Read path | Write path | Conversione |
| --- | --- | --- | --- | --- |
| `LEGACY` | tutti i cantieri correnti | servizi e DTO correnti | lifecycle/assegnazioni correnti | nessuna automatica |
| `VNEXT` | nuovi cantieri allow-listed o conversione esplicita | read model contestuali nuovi | servizi vNext autorizzati | richiede summary, invito e conferma |

Il rollout usa capability/allowlist/flag server-side, non un flag solo UI. Una conversione esplicita crea strutture additive e riferimenti al legacy senza riscriverlo. Il rollback disabilita i write path vNext, conserva tutti i dati gia scritti e lascia i cantieri legacy utilizzabili. Test isolamento e E2E precedono l'allargamento globale.

### D-VNEXT-45 - piano della futura migration unica

Questo piano non crea migration. Il futuro task autorizzato usera un solo prompt, una branch/PR e una sola nuova directory Prisma additiva; migration esistenti immutabili. Lo stesso perimetro coordinato comprendera schema, enum, indici, relazioni, backfill, compatibilita legacy, membership, partecipanti, immobili, timeline, step, proposte, autorita, pagamenti, dispute, chiusura, export, data-control, audit, processi, DTO, servizi, API, authorization, feature flag, test, E2E e documentazione.

#### Inventario e dependency graph

Inventory obbligatorio: vincoli e relazioni di User/Organization/membership/inviti/grant; JobSite e assegnazioni; timeline/richieste; documenti/prove/pacchetti/share link; notifiche; data-control; processi/decisioni/eccezioni/receipt; ogni route/query/test che usa `findUnique({userId})`, `clientName`, `operationalPhase` o `organizationId` dal contesto corrente.

Ordine dipendenze concettuale:

```text
User + Organization
-> OrganizationMembership multi-company
-> JobSite mode/lifecycle + Participant + ClientInvitation
-> ClientProperty + property-job-site link
-> AuthorityGrant
-> shared Timeline + Attachment disclosure
-> Step
-> Proposal/Version/Acceptance
-> PaymentProfile + PaymentRequest/Declaration/Receipt
-> Dispute/Preservation + Closure/PostClosure/Reopening
-> Notification + Export + LegalHold/DataControl
-> new versioned OperationalProcess definitions and effect receipts
```

#### Schema ed enum target concettuali

Strutture target: membership multi-company; `JobSiteParticipant`; `JobSiteClientInvitation`; `ClientProperty` e link; `JobSiteAuthorityGrant`; lifecycle vNext del cantiere; eventi timeline con audience/disclosure e disclosure allegati; step; proposta/versione/accettazione; payment profile/request/declaration/receipt; dispute/preservation; closure/post-closure/reopening; export e legal hold.

Famiglie enum target: participant kind/state; invitation state; job-site mode/lifecycle; audience/disclosure; step state; proposal state/economic consequence; authority capability; payment state; dispute scope/state; closure/reopen state; export type/status; hold scope/status. I nomi sono il contratto concettuale approvato ma non diventano enum Prisma prima del futuro task.

#### Unica migration: ordering interno

La sola migration futura contiene step SQL ordinati e verificabili:

1. creare enum/tabelle/colonne additive e nullable, senza cambiare i read path correnti;
2. sostituire l'unicita globale membership con l'unicita composta preservando tutte le righe;
3. impostare ogni JobSite esistente su `LEGACY` e creare soltanto marker/backfill tecnici sicuri;
4. preservare `clientName`, `operationalPhase`, assegnazioni, timeline e processi senza conversione semantica;
5. creare indici tenant/context/lifecycle e chiavi di idempotenza dopo il backfill;
6. validare riferimenti, duplicati, cross-tenant link e conteggi;
7. applicare constraint/not-null/check soltanto dopo validation e solo dove il backfill e totale;
8. registrare la migration come unica unita Prisma; nessun SQL manuale, `db push`, reset o `migrate resolve`.

Se una constraint non puo essere resa sicura nello stesso file, resta nullable con enforcement applicativo temporaneo: non si spezza autonomamente la migration. Se l'evidenza dimostra che anche questa strategia e insicura, il task si ferma sul gate D-VNEXT-45. Evidenza valida comprende lock incompatibili, durata non accettabile, rischio di perdita dati, impossibilita di rollback/restore, vincoli PostgreSQL o Prisma incompatibili oppure stato remoto non verificato.

#### Read/write compatibility

- Release pre-migration: solo schema e runtime correnti.
- Migration additiva: nessun vecchio campo rimosso; vecchio runtime resta leggibile.
- Release coordinata: dual-read basato sul mode; write legacy sui record `LEGACY`, write nuovi solo sui `VNEXT` allow-listed.
- Nessun dual-write semantico tra `clientName` e partecipante, tra phase e lifecycle vNext o tra ContextMessage e timeline condivisa.
- Conversione esplicita e idempotente; rollback disabilita nuovi write path senza cancellare righe.

#### Data-control, export e audit

Inventory/export devono includere i nuovi modelli con filtri per contesto, audience e disclosure. Client export e Organization export usano manifest distinti. Audit ed effect receipt registrano actor, contesto, versione e risultato minimizzato, mai IBAN completo, Blob key, token o URL firmato. Support resta metadata-only.

#### Deployment ordering

1. preparare dataset rappresentativo locale e snapshot/backup ripristinabile;
2. eseguire la migration sul database locale guardato;
3. generare client, eseguire backfill/validation incorporati e tutti i test;
4. provare restore e rollback applicativo sulla snapshot;
5. distribuire runtime con flag `VNEXT` off;
6. smoke legacy; poi allowlist interna vNext e test isolamento;
7. ampliare soltanto dopo osservazione e approvazione;
8. prima di qualunque remoto: fingerprint target, stato migration, backup/restore provato e autorizzazione esplicita.

#### Backup, rollback e criteri tecnici

Backup completo e restore rehearsal precedono ogni remoto. Rollback applicativo spegne vNext e torna ai read/write legacy; la migration additiva non viene riscritta o risolta manualmente. Non si elimina dato nuovo durante il rollback. Reconciliation confronta conteggi, membership, JobSite mode, riferimenti, receipt e tenant ownership.

Performance budget: query sempre tenant/context-scoped, paginazione bounded, nessun N+1, nessuna scansione non indicizzata su timeline/partecipanti/proposte/pagamenti e nessun aumento non misurato dei round-trip critici. Il futuro task cattura baseline e piano `EXPLAIN` sul database locale guardato prima di autorizzare rollout.

## `conceptual_not_implemented`

Non esistono modalita `LEGACY/VNEXT`, schema target, backfill, flag, dual-read/write o migration vNext. Questo documento e un piano, non un'operazione database.

## `hard_stop` e gate operativi

Hard stop decisionali: retention canonica, protezione IBAN, commerciale definitivo. Gate: stato/autorizzazione database remoto e prova tecnica di sicurezza della migration unica. Nessuna migration o operazione remota e autorizzata ora.
