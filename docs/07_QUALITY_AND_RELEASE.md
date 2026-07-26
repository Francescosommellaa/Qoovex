# Quality and release

Il gate standard e: `pnpm type-check`, `pnpm test:unit`, `pnpm build`, `pnpm check:audit`, `pnpm --filter @qoovex/db verify:prisma` e `git diff --check`. `pnpm lint` non e un comando root valido.

`pnpm check` esegue l'intero gate standard. `pnpm check:ci` aggiunge `pnpm test:e2e`. GitHub Actions esegue `quality-gate` e `workspace-e2e` su pull request e push a `master`; entrambi devono essere required status check prima di consentire il merge.

La toolchain ha fonti uniche nel root: `packageManager` determina la versione pnpm anche in GitHub Actions, mentre `engines.node` determina la versione Node letta da `actions/setup-node`. La CI delega installazione frozen, migration effimere e browser Playwright agli script root `ci:install`, `ci:db:prepare` e `test:e2e:install`; non duplicare questi comandi nelle workflow. Lo schema JSON di Turbo e quello installato in `node_modules/turbo/schema.json`, quindi non contiene una versione da sincronizzare manualmente.

Per un aggiornamento ordinario usare `pnpm deps:update`: il primo passaggio aggiorna il progetto root e i riferimenti GitHub Actions, il secondo aggiorna ricorsivamente tutti i package del workspace, rispettando i range dichiarati. Gli upgrade major usano esclusivamente `pnpm deps:update:major`, che richiede una selezione interattiva sia per il root sia per i package; non usare un aggiornamento `--latest` non interattivo sull'intero monorepo. In seguito eseguire `pnpm check` e lasciare che i job remoti `quality-gate` e `workspace-e2e` verifichino la modifica. `pnpm install` resta deterministico: installa quanto dichiarato e non trasforma automaticamente una normale installazione in un upgrade major. La versione dello stesso pnpm si aggiorna separatamente con `pnpm self-update`, che aggiorna il campo `packageManager` consumato anche dalla CI.

`@qoovex/ui#test` e un guardrail statico cross-repository: verifica che `packages/ui` resti l'unica foundation, che Sirio non duplichi primitive, che le app usino subpath espliciti e la stessa configurazione `base-nova`/Base UI/Tabler, che ogni consumer importi il CSS canonico e dichiari le proprie sorgenti Tailwind, e che non rientrino API visuali o provider rimossi. Il task non usa la cache Turbo perche legge file esterni a `packages/ui` e deve osservare ogni modifica dei consumer.

`verify:prisma` non e una semplice query di connessione: fallisce per migration mancanti, riordinate, modificate, fallite o pendenti e per qualunque diff tra database e `schema.prisma`. La CI applica la cronologia completa su PostgreSQL effimero prima del gate. Il test `pnpm --filter @qoovex/db test:upgrade` accetta esclusivamente `qoovex_upgrade_ci` su loopback, applica la cronologia precedente, inserisce dati e una chiave PII legacy, applica la migration privacy e verifica conservazione, purge e diff nullo.

Ogni modifica a schema, API, autorizzazioni, storage, UI condivisa o operazioni deve verificare i confini interessati e aggiornare questa documentazione, Qoovex-Brain e il session log nello stesso task. La memoria Codex si aggiorna solo su richiesta esplicita.

Un deploy non e verificato solo da build locale: le configurazioni Vercel e i flussi sensibili richiedono smoke check nel rispettivo ambiente.

## Database operation impact

Ogni modifica database-sensitive deve includere nel report la sezione prevista da `OperationalProtocol.md` e almeno un test proporzionato al rischio. Per collezioni annidate il test deve dimostrare che il numero di chiamate Prisma non cresce con il numero di record; per memoizzazione o cache deve provare isolamento tra richieste, utenti e Aziende e la corretta invalidazione dopo le mutation.

Il preflight scatta automaticamente in base ai file e ai flussi toccati, anche se la task non cita esplicitamente database o Prisma. La review deve bloccare una modifica database-sensitive priva del confronto prima/dopo, dell'analisi del caso peggiore, del rischio N+1, della strategia cache/invalidazione, dell'impatto tenant e della classificazione degli ambienti. Quando emerge uno spreco misurabile e la correzione non incontra hard stop, la correzione e i relativi test fanno parte della stessa task; il solo rinvio a un audit futuro non chiude il gate.

`QOOVEX_DB_OPERATION_METRICS=1` abilita il contatore locale request/flow-scoped di `@qoovex/db`. Registra solo modello, operazione, durata e conteggio, senza SQL, argomenti, dati personali, token, blob key o identificatori Azienda. L'output e una proxy di chiamate Prisma Client e non sostituisce Usage o Query Insights della Prisma Console. Il flag resta disattivato per default e non va abilitato rumorosamente in produzione.

La review non puo attribuire a `Promise.all`, `select`, paginazione o indici una riduzione del numero di operazioni senza una misurazione che lo dimostri. Questi interventi possono migliorare rispettivamente latenza/concorrenza, payload/egress e tempo di esecuzione.

I test di query-count e l'instrumentation misurano chiamate Prisma Client come proxy locale. I valori ufficiali di fatturazione e l'attribuzione di picchi devono essere riconciliati con Usage e Query Insights della Console Prisma; non trasformare una proxy in un budget di billing.
