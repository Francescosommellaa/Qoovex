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

## Performance budget

Dataset target: almeno 3 Aziende, 200 JobSite, 20.000 eventi, 1.000 step e 500 record per proposte/pagamenti. Home e dettaglio iniziale ≤12 query; timeline ≤4 query per pagina da 50; search ≤8 query bounded; nessun N+1.

## Browser QA

Viewport 320/390/768/1024/1440, zoom 200%, light/dark/system, tastiera, focus, console, hydration, reduced motion e overflow. Un gate non eseguito non può essere dichiarato verde.

## Impeccable UI quality gate

`implemented_decision`: Impeccable è pin-nato a `skill-v4.1.1`, commit `5a149f3fdb1b5793f10567233b1dcab98fc305fd`. `pnpm setup:impeccable` ricostruisce la distribuzione Codex ufficiale ignorata; `pnpm verify:impeccable` è il gate esplicito, offline e read-only per distribuzione, context, doctor, hook, routing, governance e Git hygiene. Non è parte di `check:fast` e non introduce download nei gate backend ordinari.

Codex usa temporaneamente `scripts/impeccable/hook-dispatcher.mjs` per instradare PostToolUse e Stop soltanto ai context figli realmente toccati. Lo stato di sessione è locale e ignorato; l'attivazione del manifest `.codex/hooks.json` richiede approvazione locale tramite `/hooks`. Un aggiornamento richiede cambio esplicito del pin, reinstallazione e regression test; il dispatcher può essere rimosso soltanto quando la versione pin-nata prova nativamente, dalla root del monorepo, il context corretto per PostToolUse e tutti e soli i context toccati per Stop.

## UI Skills specialist layer

`implemented_decision`: UI Skills è disponibile come discovery layer specialistico on-demand, non come gate CI e non come fonte di verità. Il repository versiona `.agents/skills/ui-skills-root`; i comandi `pnpm ui-skills:start`, `pnpm ui-skills:categories`, `pnpm ui-skills:list` e `pnpm ui-skills:get` usano la CLI pin-nata `ui-skills@0.2.4` senza aggiungere dipendenze runtime o devDependency.

La selezione esterna deve essere minima: una skill per default, due per due angoli distinti, massimo tre soltanto per review/redesign ampi. La copia UI Skills di Impeccable è vietata perché il repository possiede già una distribuzione Impeccable pin-nata e verificata. Per interaction e motion, `qoovex-ux-motion` precede sempre qualunque specialista esterno e decide se usare nessuna animazione, CSS/Tailwind, Base UI, API native o Motion.

UI Skills non entra in `check:fast`, `check`, `check:push` o CI: i comandi di registry richiedono rete e servono durante progettazione/implementazione, mentre la qualità finale resta provata da review Impeccable, test repository-local, Browser QA e gate canonici. Un catalogo esterno non può rendere verde una release né autorizzare dependency, token, provider, schema, permessi, capability o modifiche architetturali.

## Release hard stop

Nessun push o completamento CI può avviare reset, migration o deploy. Preview e Production usano workflow `workflow_dispatch` separati con SHA esatto, conferma testuale esatta, GitHub Environment e controlli statici che vietano trigger automatici e comandi non protetti `db push`, `migrate reset` e `migrate resolve`. CI verde resta prerequisito verificato dal workflow Production, ma non costituisce autorizzazione alla mutazione. Qualsiasi head inatteso, conferma errata o credenziale mancante interrompe il rollout prima di mutare i target.
