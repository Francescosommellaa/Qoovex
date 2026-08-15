# Skill Governance System — Design

## Stato e scopo

`approved_product_direction` per tooling/repository governance. Questa specifica non modifica runtime prodotto, schema Prisma, auth, storage, permessi, provider o capability Qoovex.

Obiettivo: garantire che le skill usate per Qoovex siano disponibili, integre, aggiornate, coordinate, con responsabilita separate, routing deterministico e verifiche ripetibili sia in locale sia in CI.

Questa specifica riguarda solo la prima infrastruttura richiesta: skill governance. Restano fuori scope i futuri gate dedicati a precisione geometrica/spacing e mobile/responsive.

## Vincoli canonici

- Le fonti Qoovex restano superiori a qualunque skill esterna.
- Impeccable resta obbligatorio per task UI/UX e mantiene il proprio ruolo di detector/critique/review generale.
- `qoovex-ux-motion` resta lo specialista Qoovex per interaction e motion e decide anche quando non animare.
- `ui-skills-root` resta advisory e on-demand; non diventa source of truth o release gate online.
- La copia UI Skills di Impeccable resta vietata.
- La CI ordinaria deve essere offline e deterministica.
- Soltanto il workflow di update puo usare rete per discovery e verifica upstream.
- Nessun auto-update modifica direttamente `master`.
- Nessun update viene promosso se provenance, compatibility, routing e gate Qoovex non sono verdi.

## Architettura raccomandata

```text
Task
  -> Qoovex protocol / Brain context
  -> Skill Orchestrator
      -> task classification
      -> required skills
      -> optional specialists
      -> dependency/order graph
      -> conflict checks
      -> routing plan
  -> skill execution
  -> runtime completion verification
  -> Impeccable review when required
  -> Qoovex gates
```

Il sistema e composto da sei parti indipendenti ma coordinate:

1. canonical skill registry;
2. repository-owned skill sources;
3. orchestrator + runtime session state;
4. deterministic doctor and test suite;
5. GitHub `skill-governance` required check;
6. scheduled auto-update workflow con canary/quarantine/rollback.

## 1. Canonical skill registry

Creare un manifest machine-readable repository-local come singola fonte di verita per la governance delle skill.

Campi minimi per ogni skill governata:

```text
id
kind
source
version
provenance
integrity
role
triggers
non_triggers
primary_responsibilities
secondary_responsibilities
forbidden_responsibilities
requires
runs_before
runs_after
conflicts_with
may_delegate_to
max_instances
update_policy
verification
runtime_required
```

### Regola ownership

Una responsabilita primaria ha un solo owner.

Esempio concettuale:

```text
general-ui-quality       -> impeccable
interaction-motion       -> qoovex-ux-motion
external-specialist      -> ui-skills-root
component-api            -> qoovex-component-creator
screen-flow-architecture -> design-qoovex-ui-ux
general-ui-routing       -> qoovex-ui-ux
```

Skill diverse possono avere responsabilita secondarie sovrapposte, ma una collisione tra due `primary_responsibilities` e errore CI salvo eccezione esplicita e documentata nel registry.

### Tipi di skill

- `repository-owned`: skill Qoovex canonica, versionata nel repository;
- `pinned-external`: provider esterno con versione/commit/digest verificati, come Impeccable;
- `external-router`: router locale versionato che accede a un catalogo esterno pin-nato, come UI Skills;
- `ephemeral-specialist`: contenuto esterno caricato on-demand e mai promosso automaticamente a fonte canonica.

## 2. Repository come fonte canonica delle skill Qoovex

Le skill Qoovex che oggi esistono solo globalmente/macchina-localmente non sono verificabili dalla CI.

Direzione raccomandata:

- portare le skill Qoovex governate sotto `.agents/skills/<skill>/SKILL.md`;
- il repository diventa la fonte canonica;
- eventuali copie globali diventano cache/installazione derivata;
- un comando di bootstrap/sync installa o aggiorna le copie locali partendo dal repository;
- il doctor verifica che una copia globale eventualmente attiva corrisponda al digest repository-local prima di consentire il completamento di task governati.

Questo elimina drift silenzioso tra macchine e rende le skill testabili da GitHub Actions.

## 3. Skill Orchestrator runtime

Un solo orchestratore repository-owned governa il routing; non creare hook indipendenti concorrenti per ogni skill.

Responsabilita:

- classificare il task per dominio;
- leggere il registry;
- calcolare skill richieste, opzionali e vietate;
- validare dipendenze e ordine;
- impedire duplicati e conflitti;
- produrre un routing plan machine-readable;
- mantenere stato sessione locale ignorato da Git;
- verificare a `Stop` che i gate runtime richiesti siano stati soddisfatti;
- non sostituire i tool/skill stessi, ma coordinarli.

### Routing Qoovex UI

Ordine canonico per motion/interactions:

```text
Qoovex protocol
-> Impeccable context/detector
-> qoovex-ux-motion decision
-> optional narrow UI Skills specialist
-> minimum sufficient implementation technology
-> Impeccable review
-> Qoovex gates
```

Per UI non-motion l'orchestratore non deve rendere `qoovex-ux-motion` obbligatorio senza trigger pertinente.

Per backend/documentazione non UI non deve attivare skill UI.

### Runtime evidence

Per ogni sessione governata salvare localmente un record temporaneo contenente almeno:

```text
session id
task classification
routing plan
required skills
skills observed/acknowledged
ordered checkpoints
completion gates
violations
```

Nessun contenuto sensibile del prodotto deve essere copiato nel log di governance.

## 4. `pnpm skills:doctor`

Comando offline, read-only e deterministico.

Verifiche minime:

- registry schema valido;
- tutte le skill governate presenti;
- frontmatter/metadata validi;
- provenance coerente;
- digest coerenti;
- nessun file richiesto mancante;
- graph `requires/runs_before/runs_after` aciclico;
- nessuna collisione di responsabilita primaria;
- nessun conflitto vietato;
- nessun duplicato Impeccable da UI Skills;
- routing contract coerente con `AGENTS.md`;
- skill repository-owned coerenti con eventuali copie locali installate quando presenti;
- `pnpm verify:impeccable` integrato come sub-gate per Impeccable;
- test orchestrator/hook;
- routing scenario suite;
- nessuna dipendenza da rete.

Output finale chiaro `PASS/WARN/FAIL` e exit code non-zero sui failure.

## 5. Routing scenario suite

La governance deve essere testata come software.

Categorie minime:

- backend Prisma/service;
- documentazione;
- auth server-side;
- componente UI semplice;
- componente interattivo;
- motion/microinteraction;
- responsive;
- accessibility;
- design-system component;
- nuova schermata/flow;
- marketing UI;
- Sirio;
- task misto UI + backend;
- broad redesign;
- specialist escalation;
- richiesta esplicita di skill incompatibile.

Ogni scenario dichiara:

```text
input classification
expected required skills
expected optional skills
forbidden skills
expected order
expected final gates
```

La suite deve verificare sia falsi negativi sia falsi positivi: una skill non deve essere soltanto presente quando serve, ma anche assente quando non serve.

## 6. GitHub CI: `skill-governance`

Aggiungere un job separato alla CI esistente, senza fonderlo in `quality-gate`.

```text
CI
|- push-gate
|- skill-governance
|- quality-gate
`- workspace-e2e
```

Passi minimi:

1. checkout;
2. setup Node/pnpm coerente con repo;
3. frozen install;
4. `pnpm skills:doctor --ci`;
5. test governance/orchestrator;
6. verifica Impeccable repository integration;
7. `git diff --check` dove pertinente.

Questo job deve essere candidabile come required status check della branch protection.

## 7. Auto-update — fail closed

Workflow separato, schedulato e manualmente invocabile.

Il workflow usa rete solo qui.

### Flusso

```text
discover upstream updates
-> create isolated update branch
-> fetch candidate
-> provenance verification
-> digest generation
-> update pins/metadata
-> static compatibility checks
-> routing regression suite
-> full skill-governance
-> normal Qoovex CI
-> canary runtime verification
-> success: open/update PR and enable guarded auto-merge
-> failure: quarantine candidate, no merge
```

### Nessun direct-to-master

Anche in modalita auto-update `B`, il sistema deve usare PR.

`B` significa: nessun intervento umano necessario se tutti i gate sono verdi, non push diretto a `master`.

### Provenance

Per provider pin-nati conservare almeno:

```text
repository id
release/tag/version
resolved commit
payload digest
retrieval timestamp in PR metadata/artifact, not runtime source of truth
```

Tag mutable, commit inatteso o digest incoerente devono fallire chiusi.

## 8. Canary, quarantine e rollback

### Quarantine

Un candidato che fallisce uno dei gate viene marcato come quarantined per quella versione/digest per evitare loop continui.

Il report deve indicare esattamente:

- provider/versione;
- gate fallito;
- collisioni/routing changes;
- test falliti;
- eventuale intervento richiesto.

### Canary

Prima dell'auto-merge eseguire una simulazione runtime dell'orchestratore con fixture di sessione, inclusi Stop/completion checks.

Non deve richiedere un agente reale o accesso a dati prodotto.

### Rollback

Dopo merge, eseguire una post-merge verification sulla nuova `master`.

Se fallisce un controllo deterministico non rilevato nella PR:

- bloccare ulteriori update dello stesso provider;
- aprire automaticamente una PR di revert verso l'ultimo pin noto verde;
- non modificare direttamente `master`;
- non mascherare il failure come warning.

## 9. Drift detection

Il doctor deve rilevare:

- skill repository-owned modificate senza aggiornare registry/integrity;
- AGENTS routing che diverge dal registry;
- pin documentati diversi dal codice;
- versioni UI Skills diverse tra registry e package scripts;
- Impeccable pin diverso tra brain/docs/config;
- copie globali/locali obsolete quando ispezionabili;
- nuove skill non registrate sotto il namespace governato;
- responsabilita dichiarate in due owner primari.

La regola e: nessun drift silenzioso.

## 10. Compatibility policy per update

Classificare gli update:

- patch/minor compatible candidate;
- major/breaking candidate;
- routing-contract change;
- source/provenance anomaly.

Tutti possono essere testati automaticamente.

Solo candidate che preservano i contratti Qoovex e superano l'intera suite possono auto-mergiare.

Un major update non e automaticamente vietato, ma non riceve eccezioni: deve passare gli stessi gate piu le compatibility assertions specifiche del provider.

## 11. Security e supply-chain

- nessun `curl | sh`;
- niente script remoto eseguito prima della verifica della provenance quando evitabile;
- pin a commit/digest per provider che lo consentono;
- CLI esterne invocate con versione pin-nata;
- nessuna skill esterna puo modificare autonomamente registry, authority o business rules;
- nessun token/segreto nei report;
- permissions GitHub Actions minime;
- auto-update workflow con write permission solo dove necessario;
- CI ordinaria `contents: read`.

## 12. Failure model

La governance e fail-closed sui casi seguenti:

- skill required mancante;
- registry invalido;
- graph ciclico;
- collisione ownership primaria;
- provider integrity failure;
- routing scenario failure;
- Impeccable verification failure per task/UI contexts richiesti;
- runtime completion evidence mancante quando il registry la richiede;
- update candidate con provenance incerta;
- auto-update compatibility failure.

Warning ammessi solo per condizioni informative che non alterano il contratto, come un nuovo upstream disponibile non ancora candidato o una copia locale opzionale non installata fuori da una sessione che la richiede.

## 13. File placement proposto

Placement indicativo da validare durante implementation planning:

```text
.agents/skills/<qoovex-skill>/SKILL.md
config/skills/registry.json
scripts/skills/doctor.mjs
scripts/skills/orchestrator.mjs
scripts/skills/runtime-state.mjs
scripts/skills/*.test.mjs
scripts/skills/scenarios/*.json
.github/workflows/ci.yml
.github/workflows/skill-auto-update.yml
AGENTS.md
package.json
docs/07_QUALITY_AND_RELEASE.md
project_brain.json
```

Se viene creata una nuova cartella repository-local, aggiungere il README richiesto dalle regole Qoovex quando applicabile.

## 14. Comandi target

```text
pnpm skills:doctor
pnpm skills:test
pnpm skills:sync
pnpm skills:route -- <task classification fixture>
pnpm skills:update:check
```

`skills:update:check` usa rete solo nel workflow dedicato o quando invocato esplicitamente dall'utente.

## 15. Acceptance criteria

Il sistema e completo quando:

1. tutte le skill Qoovex governate sono repository-verificabili;
2. ogni responsabilita primaria ha un solo owner;
3. il dependency/order graph e aciclico;
4. routing appropriato e non-routing sono coperti da test;
5. Impeccable mantiene il proprio verify esistente e viene composto, non duplicato;
6. UI Skills resta on-demand e non diventa un gate online;
7. l'orchestratore produce routing plan e completion evidence locali;
8. `pnpm skills:doctor` passa offline su checkout pulito dopo bootstrap richiesto;
9. GitHub `skill-governance` passa in PR e push master;
10. update upstream crea branch/PR, non push diretto;
11. candidate incompatibili vengono quarantinati;
12. candidate compatibili possono auto-mergiare dopo tutti i gate;
13. post-merge failure genera rollback PR e blocco provider;
14. nessun update puo cambiare authority Qoovex in modo silenzioso;
15. nessuna CI o skill governance esegue operazioni DB/Blob/deploy.

## 16. Non-obiettivi

- non valutare pixel/spacing/geometria;
- non valutare mobile/responsive quality in modo specialistico;
- non sostituire Browser QA;
- non creare un agente autonomo che decide business/product rules;
- non trasformare UI Skills in dependency runtime;
- non imporre Motion a tutte le UI;
- non modificare schema, migration, auth, provider o deployment.

## Database operation impact

Operazioni aggiunte: 0
Operazioni eliminate: 0
Query per flusso prima: invariato
Query per flusso dopo: invariato
Rischio N+1: invariato
Strategia cache: invariata
Strategia invalidazione: invariata
Impatto tenant isolation: nessuno
Ambienti coinvolti: soli file documentali/repository governance
Misurazione eseguita: non applicabile; database e Blob non interrogati
