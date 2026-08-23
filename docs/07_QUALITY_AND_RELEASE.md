# 07 — Quality and release

## Acceptance contract

- `OrganizationRole` resta `OWNER | COLLABORATOR`; client membership impossibile.
- route, navigation, API, service, mutation, permission e test sono collegati dal capability manifest.
- tenant/participant isolation, revision, accessVersion, authority e receipt sono server-side.
- timeline interna e condivisa non perdono audience; ricevute e file non perdono visibilità.
- proposte, agreement, closure ed effect rifiutano versioni stale.
- nessuna cancellazione fisica, provider live, marketplace, billing o IA.

## Test canonici

Prisma format/validate/generate/status/diff, fresh e upgrade; type-check; unit; integration quando attestata; build Workspace/Web/Sirio; route/capability registry; dependency audit; `pnpm check:fast`; `pnpm check`; `pnpm check:ci` soltanto con database, email sink, Blob adapter e chiavi sintetiche locali attestati; `git diff --check`.

Le suite devono includere due Aziende, Owner/Collaborator/cliente, inviti/replay, participant e tenant isolation, authority revocata, stale revision/version, receipt idempotenti, receipt visibility, export/search leakage, hold e minimizzazione audit.

## Matrice di chiusura per task

`implemented_decision`: `HowToUse.md` definisce la Blast-Radius Verification Rule. Ogni task deve dichiarare il proprio blast radius, eseguire prima la regressione focalizzata e poi i gate applicabili sul diff finale. La matrice e cumulativa: una modifica che attraversa piu superfici eredita tutti i relativi gate.

| Impatto reale | Prove minime obbligatorie |
| --- | --- |
| Solo documentazione/contratti testuali | validazione dei formati e riferimenti modificati, `pnpm check:fast`, `git diff --check` |
| Codice o configurazione TypeScript/JavaScript | regressione focalizzata, type-check/lint/test del package proprietario, `pnpm check:push`; `pnpm check` quando il blast radius attraversa package o contratti condivisi |
| Workspace route, auth, service, API, serializzazione o flussi multi-ruolo | test unit/integration pertinenti, build/check Workspace e `workspace-e2e` quando il comportamento e riproducibile nel browser o attraversa confini server/client |
| UI, layout, navigazione, accessibilita, CSS, `packages/ui`, Sirio, Web o Workspace UI | review Impeccable, `pnpm verify:impeccable`, `pnpm mobile:doctor`, `pnpm mobile:impact`; `pnpm mobile:test` per modifiche runtime pertinenti e `pnpm visual:geometry` quando geometria o specimen governati possono cambiare |
| Prisma, schema o migration | format/validate/generate senza diff inatteso, fresh, upgrade dal baseline, drift e `pnpm check` su database locale/CI attestato |
| Dipendenze o lockfile | installazione frozen, audit, build e gate dei consumer impattati |
| Skill, registry o routing agent | `pnpm skills:doctor`, `pnpm skills:test`, `pnpm skills:canary` e i gate prodotto eventualmente impattati |

Nel micro-task, il comando piu stretto che prova completamente il diff e preferibile e l'evidenza verde con input invariati e riusabile; una modifica agli input, alle dependency transitive rilevanti, alle foundation shared o al perimetro invalida il riuso. Questo non riduce la matrice cumulativa: per contratti shared/broad, chiusura di work block importante, PR/release o assenza di una prova mirata sufficiente, eseguire il gate aggregato pertinente. I required check CI e release restano invariati. Se un comando richiesto richiede database, Blob, segreti o browser non attestabili localmente, non va puntato a target remoti: il required check CI corrispondente deve passare sullo SHA finale oppure la task resta in `hard_stop` per quella prova.

### Gestione delle failure

Una failure pertinente resta parte della task. Prima si conserva l'errore originale, poi si identifica la causa, si aggiunge o corregge la regressione e si riesegue l'intera catena invalidata sul diff finale. Non sono correzioni accettabili: skip, timeout arbitrariamente aumentati, assertion indebolite, ordine forzato per mascherare race, mock globali non isolati o update indiscriminati delle baseline.

Per i visual test si ispezionano actual, expected e diff. Le baseline canoniche si aggiornano soltanto se la variazione e intenzionale e corretta; report, screenshot diagnostici, `test-results`, `playwright-report` e `output` restano artifact temporanei o failure-only. Per PR e push, la chiusura richiede i required check verdi sullo stesso SHA finale: rerun su SHA differenti o job verdi precedenti non costituiscono evidenza.

## Performance budget

Dataset target: almeno 3 Aziende, 200 JobSite, 20.000 eventi, 1.000 step e 500 record per proposte/pagamenti. Home e dettaglio iniziale ≤12 query; timeline ≤4 query per pagina da 50; search ≤8 query bounded; nessun N+1.

## Browser QA

Viewport 320/390/768/1024/1440, zoom 200%, light/dark/system, tastiera, focus, console, hydration, reduced motion e overflow. Un gate non eseguito non può essere dichiarato verde.

## Skill governance gate

`implemented_decision`: `config/skills/registry.json` è il contratto machine-readable per skill governate, ownership primaria, dipendenze, ordine, conflitti e update policy. Resta subordinato alle fonti canoniche Qoovex.

`pnpm skills:test` verifica routing positivo e negativo; `pnpm skills:doctor` è il controllo offline/read-only per registry, skill repository-local, pin e drift documentale; `pnpm skills:canary` verifica invarianti deterministici dell'orchestratore. Il workflow `Skill Governance` esegue questi gate separatamente dalla CI prodotto e può essere reso required status check.

Le skill Qoovex repository-owned vivono sotto `.agents/skills`; copie macchina-locali sono derivate e si sincronizzano solo verso una destinazione esplicita con `pnpm skills:sync -- <path>`. Lo stato runtime di governance vive sotto `.codex-runtime/skill-governance` ed è ignorato da Git; registra soltanto classificazione, ID skill, gate e violazioni, mai contenuti prodotto o segreti.

## Automatic skill updates

`implemented_decision`: `Skill Auto Update` è l'unico workflow autorizzato a usare rete per discovery delle versioni governate. Il normale `Skill Governance` resta offline.

L'updater:

1. scopre nuove versioni di Impeccable e UI Skills;
2. risolve identity/provenance prima di modificare i pin; per Impeccable conserva tag, commit e digest payload;
3. crea un candidate branch/PR, mai un push diretto a `master`;
4. esegue test governance, doctor e canary;
5. avvia esplicitamente `Skill Governance` e la CI completa sul candidate branch e attende entrambi;
6. mergea soltanto dopo esito verde;
7. rilancia entrambi i workflow su `master` dopo il merge;
8. se il candidato fallisce prima del merge, apre una PR che registra la versione in `config/skills/quarantine.json` e chiude la candidate PR;
9. se fallisce la verifica post-merge, apre una PR di revert dell'esatto merge e registra la versione in quarantena.

La quarantena impedisce retry silenziosi dello stesso provider/versione. Nessun failure viene convertito in warning per consentire il merge.

## Mobile and Responsive Experience quality infrastructure

`implemented_decision`: `config/mobile-experience.json` e il contratto machine-readable per superfici, owner, route, scenari, viewport ed esclusioni accountable. `pnpm mobile:doctor` valida il contratto, confronta tutte le Next page route con la coverage dichiarata, verifica il wiring dei comandi e della CI e applica l'audit statico repository-local. L'audit segnala capability dedotte da user-agent o larghezza, `100vh` in overlay vincolati, interazioni hover-only, fork Mobile/Desktop, fixed surface senza safe area e controlli condivisi senza contratto touch.

La matrice canonica usa 320, 390, 768, 1024 e 1440 px. `pnpm mobile:test` avvia Web, Workspace e Sirio soltanto su loopback e copre reflow, overflow orizzontale, collisioni fixed, target da 44 px, pointer coarse/hover none, shortcut per capability, navigazione mobile, focus ed Escape, software keyboard simulata, portrait/landscape, zoom 200% equivalente, contenuti lunghi, dynamic viewport, safe area, reduced motion, errori console/runtime/hydration e le viste BUSINESS, PROFESSIONAL e CLIENT. In CI la suite accetta soltanto database PostgreSQL effimero loopback dichiarato `test` e con suffisso `_ci`; non richiede Blob e non interroga target remoti.

`pnpm mobile:impact` classifica i path modificati in gruppi runtime mirati. Cambi a `packages/ui`, al contratto o all'infrastruttura condivisa richiedono la matrice completa; cambi app-local selezionano il consumer; documentazione esegue solo il doctor; path sconosciuti falliscono verso la matrice completa. Il blast radius e informativo per il costo, mentre il job required resta fail-closed.

Il job indipendente `mobile-responsive` esegue install frozen, doctor, report del blast radius, migration deploy su database CI effimero, installazione Chromium e suite Playwright con un worker. Gli artifact di failure sono `mobile-playwright-report`; non esiste dipendenza da SaaS, device cloud o screenshot baseline. Per renderlo required, un maintainer deve selezionare `mobile-responsive` nei required status checks della branch protection.

## Visual Geometry & Polish CI

`implemented_decision`: il workflow `.github/workflows/visual-geometry.yml` pubblica il check stabile `visual-geometry` su pull request, push a `master` e invocazione manuale. Usa Playwright `1.62.0` nell'immagine pin-nata `mcr.microsoft.com/playwright:v1.62.0-noble`, installazione frozen, permessi `contents: read`, self-test fail-closed e artifact diagnostici conservati per 7 giorni soltanto quando il job fallisce.

Il manifest `tests/visual-geometry/surface-manifest.mjs` governa gli stati rappresentativi di Sirio, Web e delle sole superfici Workspace DB-free. Il contratto desktop canonico è viewport 1440×1000, DPR 1, locale `it-IT`, timezone `Europe/Rome`, rete browser limitata agli origin loopback e geometria esatta con tolleranza 0px; soltanto relazioni ottiche documentate possono usare al massimo 1px. Le baseline sono versionate e separate per piattaforma e progetto. La route inventory deve classificare ogni pagina oppure motivarne esplicitamente l'esclusione.

I comandi governati sono `pnpm visual:geometry`, `pnpm visual:geometry:self-test`, `pnpm visual:geometry:report` e, solo in locale, `pnpm visual:geometry:update`. L'update richiede l'attestazione esatta `QOOVEX_VISUAL_BASELINE_UPDATE=I_ACKNOWLEDGE_INTENTIONAL_VISUAL_CHANGE`; in CI è sempre vietato e il gate non scrive nel repository. Una baseline nuova o modificata deve essere generata e revisionata sulla stessa piattaforma prima del commit; un artifact CI mancante non è approvazione automatica.

Per decisione esplicita, questo gate non controlla caricamento, identità o integrità dei font, asset Fontshare, `document.fonts` o `font-family`: con richieste esterne bloccate sono accettati i font di fallback. Questa esclusione non riduce i controlli geometrici e visuali. L'impatto database resta zero: Workspace usa una destinazione PostgreSQL loopback inerte e non avvia né interroga database.

## Impeccable UI quality gate

`implemented_decision`: Impeccable è pin-nato a `skill-v4.1.1`, commit `5a149f3fdb1b5793f10567233b1dcab98fc305fd`. `pnpm setup:impeccable` ricostruisce la distribuzione Codex ufficiale ignorata; `pnpm verify:impeccable` è il gate esplicito, offline e read-only per distribuzione, context, doctor, hook, routing, governance e Git hygiene. Non è parte di `check:fast` e non introduce download nei gate backend ordinari.

Codex usa temporaneamente `scripts/impeccable/hook-dispatcher.mjs` per instradare PostToolUse e Stop soltanto ai context figli realmente toccati. Lo stato di sessione è locale e ignorato; l'attivazione del manifest `.codex/hooks.json` richiede approvazione locale tramite `/hooks`. Un aggiornamento richiede cambio del pin tramite il workflow governato, reinstallazione locale quando necessario e regression test; il dispatcher può essere rimosso soltanto quando la versione pin-nata prova nativamente, dalla root del monorepo, il context corretto per PostToolUse e tutti e soli i context toccati per Stop.

## UI Skills specialist layer

`implemented_decision`: UI Skills è disponibile come discovery layer specialistico on-demand, non come fonte di verità. Il repository versiona `.agents/skills/ui-skills-root`; i comandi `pnpm ui-skills:start`, `pnpm ui-skills:categories`, `pnpm ui-skills:list` e `pnpm ui-skills:get` usano la CLI pin-nata `ui-skills@0.2.4` senza aggiungere dipendenze runtime o devDependency.

La selezione esterna deve essere minima: una skill per default, due per due angoli distinti, massimo tre soltanto per review/redesign ampi. La copia UI Skills di Impeccable è vietata perché il repository possiede già una distribuzione Impeccable pin-nata e verificata. Per interaction e motion, `qoovex-ux-motion` precede sempre qualunque specialista esterno e decide se usare nessuna animazione, CSS/Tailwind, Base UI, API native o Motion.

Il catalogo UI Skills non entra nei gate ordinari: la rete serve soltanto durante progettazione/implementazione on-demand o nel workflow `Skill Auto Update`. La qualità finale resta provata da review Impeccable, test repository-local, Browser QA e gate canonici. Un catalogo esterno non può rendere verde una release né autorizzare dependency, token, provider, schema, permessi, capability o modifiche architetturali.

## Release hard stop

Nessun push o completamento CI può avviare reset, migration o deploy. Preview e Production usano workflow `workflow_dispatch` separati con SHA esatto, conferma testuale esatta, GitHub Environment e controlli statici che vietano trigger automatici e comandi non protetti `db push`, `migrate reset` e `migrate resolve`. CI verde resta prerequisito verificato dal workflow Production, ma non costituisce autorizzazione alla mutazione. Qualsiasi head inatteso, conferma errata o credenziale mancante interrompe il rollout prima di mutare i target.
