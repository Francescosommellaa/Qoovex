# Visual Geometry & Polish CI — Design

## Stato

`approved_design`, aggiornato il 2026-08-15 dopo il preflight repository-local.

Questa specifica definisce la seconda infrastruttura di qualità Qoovex. Protegge geometria e polish visuale delle superfici web senza assumere la responsabilità della futura CI responsive/mobile, senza introdurre un revisore LLM e senza modificare database, autenticazione, autorizzazioni o capability prodotto.

La richiesta corrente prevale sul requisito font originale: Visual Geometry v1 non controlla disponibilità, famiglia, file o rendering dei font Fontshare. Il browser di test blocca la rete esterna e usa il fallback deterministico disponibile nel container. Nessun asset font viene vendorizzato, scaricato, attestato o sostituito dalla CI.

## Baseline verificata

- Base remota: `origin/master` a `a8bb52cc1975fdf1169de68109cd091c55f02dee`.
- Playwright è già una devDependency root, risolta dal lockfile alla versione `1.62.0`.
- La CI corrente espone `push-gate`, `quality-gate` e `workspace-e2e` da `.github/workflows/ci.yml`.
- `packages/ui` contiene 43 file component; non tutti sono componenti visuali autonomi.
- Sirio contiene 31 page route, di cui 27 pagine di catalogo componenti e 3 fondazioni, oltre al redirect root.
- Web contiene 14 page route pubbliche.
- Workspace contiene 33 page route, molte autenticate o data-dependent.
- Sirio è il proof surface canonico di `@qoovex/ui`; Web e Workspace sono consumer reali distinti.
- Le screenshot visuali versionate e un geometry engine riutilizzabile non esistono ancora.
- `origin/master` contiene la design spec della Skill Governance, ma non la sua implementazione. Il nuovo lavoro non dipende da file non mergiati e non assorbe il diff della checkout originale.

## Obiettivo ingegneristico

Il gate garantisce:

```text
pixel precision nel browser CI controllato
+ token precision
+ geometria approvata
+ protezione da regressioni
```

Non garantisce precisione fisica in millimetri. CSS pixel, device pixel e dimensione fisica non hanno una conversione universale.

Il check richiesto si chiama `visual-geometry`, coerente con i nomi correnti dei job.

## Confini

### Incluso

- screenshot regression native Playwright;
- DOMRect e computed-style assertions;
- spacing, alignment, sizing, padding, gap, radius, border, divider e density;
- overflow, clipping e collisioni misurabili;
- geometria di focus e assenza di layout shift negli stati interattivi;
- stati default, hover, pressed, focus-visible, selected, checked, open, expanded, disabled, read-only, loading, pending, success, warning, error ed empty soltanto quando realmente supportati;
- light e dark secondo rischio;
- Sirio foundation e component proof;
- consumer rappresentativi di Web e Workspace senza dati reali;
- route coverage e blast-radius selection fail-safe;
- baseline policy, diagnostica e artifact di failure.

### Escluso

- CI mobile/responsive dedicata, touch-first design, gesture e mobile information architecture;
- suite accessibility completa o nuova integrazione axe;
- motion-quality CI;
- font availability, font-family assertion, font file integrity o Fontshare network behavior;
- SaaS visuali, provider esterni, nuove dipendenze runtime o nuove librerie di test;
- correzioni visuali automatiche;
- valutazione soggettiva “bello/brutto” in CI;
- database, Blob, Auth.js, sessioni reali, dati Production, secret o deploy;
- modifica della branch protection remota.

## Architettura

### 1. Ambiente controllato

Un file `playwright.visual-geometry.config.ts` separa la nuova suite dall’E2E Workspace data-dependent.

Il runner usa:

- container ufficiale Playwright `mcr.microsoft.com/playwright:v1.62.0-noble`, pin-nato alla stessa versione del lockfile;
- Chromium bundled;
- Ubuntu 24.04 Noble;
- viewport canonico `1440 × 1000`;
- `deviceScaleFactor: 1`;
- locale `it-IT`;
- timezone `Europe/Rome`;
- reduced motion attivo;
- color scheme esplicito per project light/dark;
- clock fissato dalle fixture quando il contenuto usa data o ora;
- screenshot con animazioni disabilitate e caret nascosto;
- rete esterna bloccata dopo il caricamento delle sole origin loopback;
- nessuna attesa o assertion su `document.fonts.ready` o `document.fonts.check()`.

Le tre app vengono buildate e avviate come server Production locali sui porti già canonici: Web `3000`, Workspace `3001`, Sirio `3002`. Workspace viene usato soltanto su superfici che non richiedono DB o autenticazione reale, a partire da `/sign-in`.

Il viewport `1024 × 900` è ammesso solo per una superficie desktop la cui geometria cambia realmente a quel breakpoint. Viewport 320/390/768 e governance responsive restano fuori scope.

### 2. Visual Geometry Manifest

`tests/visual-geometry/surface-manifest.mjs` è la fonte machine-readable. Ogni entry espone:

```ts
{
  id,
  app,
  route,
  tier,
  themes,
  viewport,
  state,
  setup,
  capture,
  geometry,
  snapshot,
  stability,
  tags
}
```

- `id`: identificatore kebab-case stabile.
- `app`: `sirio`, `web` o `workspace`.
- `route`: route reale.
- `tier`: `critical`, `representative` o `broad`.
- `themes`: `light`, `dark` oppure entrambi.
- `state`: stato realmente supportato.
- `setup`: ID di una interaction fixture deterministica; nessun callback anonimo nel manifest.
- `capture`: page o locator esplicito.
- `geometry`: lista di contratti semantici.
- `snapshot`: nome baseline stabile e tolerance category.
- `stability`: clock, content, animation e network requirements applicabili.
- `tags`: package/component/blast-area usati dal selector PR-aware.

Il manifest non duplica route e file facilmente derivabili. Un inventory builder scopre le `page.tsx`; una route deve essere coperta o classificata con un’esclusione esplicita e motivata. Una nuova route non classificata fallisce il validation gate.

### 3. Route inventory e coverage

La coverage policy distingue:

- `covered`: la route possiede almeno una surface entry;
- `represented`: la route è coperta tramite una composizione canonica equivalente, con riferimento esplicito;
- `excluded`: auth/data/runtime/non-visual route non eseguibile nella suite, con reason code e spiegazione;
- `missing`: stato invalido che fallisce.

Sirio richiede classificazione di tutte le pagine catalogo e foundation. Web richiede classificazione di tutte le route pubbliche. Workspace richiede classificazione di tutte le page route, ma solo superfici sintetiche e DB-free vengono renderizzate in v1.

Il report di coverage pubblica conteggi per app, componenti condivisi rappresentati, stati, screenshot e geometry assertions.

### 4. Tier di esecuzione

#### Critical — sempre

- foundation Sirio spacing/radius e typography geometry;
- Button, Input/Field, Select, Checkbox, Radio, Switch, Tabs, Card e Alert negli stati ad alto rischio realmente presenti;
- almeno un overlay open e un controllo focus-visible;
- Web homepage come consumer della foundation e della navigation condivisa;
- Workspace sign-in come consumer reale DB-free;
- light e dark per foundation critica e consumer rappresentativi.

#### Representative — app impattata

- route Sirio del componente modificato;
- route Web rappresentative della composizione modificata;
- route Workspace DB-free o proof Sirio equivalente per composizioni autenticate;
- stati hidden/open pertinenti.

#### Broad — blast radius alto o esecuzione completa

- tutte le surface entry visuali classificate;
- entrambe le theme dove il manifest lo richiede;
- route pubbliche e catalogo più ampi senza duplicare screenshot equivalenti.

La baseline critical non viene mai saltata. Se il selector non può dimostrare l’assenza di impatto, sceglie `broad`.

### 5. Geometry engine

`tests/visual-geometry/geometry-assertions.ts` offre assertion riutilizzabili su locator Playwright:

- `expectAlignedLeft` / `expectAlignedRight`;
- `expectCenterDeltaWithin`;
- `expectVerticalGap` / `expectHorizontalGap`;
- `expectSameHeight` / `expectSameWidth`;
- `expectSize`;
- `expectPadding`;
- `expectComputedStyle`;
- `expectTokenStyle`;
- `expectNoOverflow`;
- `expectNoDocumentHorizontalOverflow`;
- `expectFocusGeometryStable`;
- `expectAnchoredOverlay`;
- `expectRepeatedRhythm`.

La parte pura di misura, confronto, tolerance e formattazione diagnostica vive in moduli `.mjs` testabili con `node:test`. Il browser adapter raccoglie soltanto dati strutturati e delega il confronto alla parte pura.

Ogni failure mostra:

```text
surface
state
element o relazione
expected
actual
difference
tolerance category
related bounding boxes/computed styles essenziali
```

Non vengono stampati dump DOM o JSON voluminosi.

### 6. Contratti e tolerance

Le tolerance sono centralizzate:

- geometry exact: `0px`;
- optical/antialias-safe geometry: massimo `1px`, soltanto con rationale;
- raster: `maxDiffPixels` minimo e specifico per surface; nessuna grossa percentuale globale;
- colori raster: threshold Playwright centrale e conservativo.

I valori geometrici derivano, in ordine, da:

1. token runtime esistenti;
2. `DESIGN.md` canonico della superficie;
3. componenti approvati reali;
4. eccezioni ottiche esplicite nel manifest.

Un optical adjustment contiene elemento, valore, unità e rationale. Il validator rifiuta eccezioni senza motivazione. Nessuna regola impone `1.618` o altra proporzione universale.

### 7. State setup e superfici nascoste

`tests/visual-geometry/interaction-setups.ts` contiene setup nominati e deterministici per:

- dialog open;
- dropdown/menu open;
- select open/selected;
- tooltip open stabilizzato;
- collapsible expanded;
- tabs selected;
- checkbox/switch/radio checked;
- focus-visible;
- invalid/error;
- loading/disabled dove realmente esposti.

Ogni setup usa locator role-qualified, attende lo stato Base UI reale e cattura soltanto lo stato finale. Rapid interaction e animation craft non diventano proprietà di questa suite; viene verificata soltanto l’assenza di variazioni geometriche involontarie.

### 8. Sirio proof e composition-first

La CI riusa le route Sirio esistenti. Se manca un target stabile, estende `Specimen` e i catalog page esistenti con identificatori visuali intenzionali; non crea primitive alternative né un secondo catalogo.

I componenti non visuali autonomi — provider, loader, controller e indicatori interni — vengono classificati come `represented` dal consumer che ne rende osservabile l’effetto, oppure esclusi con ragione tecnica.

Le lacune importanti di stato vengono colmate nella pagina Sirio del componente interessato con il minimo markup sintetico e senza simulare capability prodotto.

### 9. Cross-consumer protection

La suite non presume che Sirio provi ogni wrapper consumer:

- Web homepage protegge floating navigation, brand, theme e composizione marketing;
- Workspace sign-in protegge field/input/button/card e shell auth DB-free;
- Sirio protegge componenti condivisi e shell catalogo;
- ulteriori consumer vengono aggiunti soltanto quando un override locale o wrapper introduce rischio geometrico distinto.

Non vengono usati account, fixture database, Blob o sessioni Production.

### 10. Blast-radius selector

`scripts/visual-geometry/blast-radius.mjs` riceve i file cambiati e restituisce i tag da eseguire.

- `packages/ui/src/components/*`: critical + Sirio component proof + consumer rappresentativi.
- `packages/ui/styles/*`, font loader, theme o global CSS: broad su tutte le app.
- `apps/sirio/*`: critical + Sirio pertinenti.
- `apps/web/*`: critical + Web pertinenti.
- `apps/workspace` UI: critical + Workspace DB-free pertinenti + Sirio proof quando shared.
- manifest, runner, config o workflow visuale: full self-test + broad.
- path sconosciuto: critical; se contiene frontend/CSS/asset non classificato, broad.

Il selector non considera import diretti una prova sufficiente per token e stili globali. `workflow_dispatch` e update baseline eseguono broad.

### 11. Static design-drift checks

Il validator esamina soltanto aggiunte nel diff UI rilevante e segnala pattern ad alta precisione:

- arbitrary spacing/radius/color nuovi nei file shared;
- inline style geometrico nuovo;
- magic number duplicati per la stessa responsabilità;
- token bypassato quando il mapping canonico è inequivocabile.

Una allowlist richiede file, valore, proprietà e rationale. Non viene eseguita una regex indiscriminata sull’intero repository e nessun autofix viene applicato.

### 12. Snapshot e baseline policy

Le baseline PNG vivono in `tests/visual-geometry/__snapshots__` e sono versionate.

`pnpm visual:geometry:update`:

- funziona soltanto nel container Playwright pin-nato;
- richiede un’attestazione locale esplicita;
- esegue la suite broad;
- aggiorna le snapshot tramite il flag Playwright intenzionale;
- non committa, non pusha e non apre PR automaticamente.

In CI, `--update-snapshots` e qualunque env di update fanno fallire il gate prima dell’avvio. La PR deve contenere insieme codice visuale e nuove baseline reviewable.

`pnpm visual:geometry:report` apre il report HTML prodotto dall’ultimo run; non modifica baseline.

### 13. Self-test dell’infrastruttura

I test pure/deterministici seguono TDD e provano almeno:

- manifest valido e duplicati rifiutati;
- missing baseline fallisce;
- visual diff non autorizzata fallisce;
- exact geometry passa;
- geometry mismatch fallisce;
- limite tolerance passa e superamento fallisce;
- route eligible non classificata fallisce;
- esclusione motivata passa ed esclusione vuota fallisce;
- cambio shared amplia coverage;
- cambio token/global/font/theme amplia coverage;
- baseline update esplicito locale è ammesso;
- baseline update implicito o in CI è vietato;
- diagnostica contiene surface, state, expected, actual e difference.

Un meta-canary Playwright usa una pagina sintetica locale temporanea per provare che una baseline mancante e una diff reale producano exit code non-zero. Gli artifact temporanei non vengono versionati.

### 14. CI

`.github/workflows/visual-geometry.yml` è un workflow indipendente:

```text
name: Visual Geometry
job/check: visual-geometry
events: pull_request, push master, workflow_dispatch
permissions: contents: read
```

Passi:

1. checkout con history sufficiente al diff;
2. pnpm setup e Node 24;
3. install frozen;
4. ambiente Playwright 1.62.0 Noble;
5. validation e self-test;
6. build/start delle superfici locali richieste;
7. visual screenshot + geometry assertions;
8. upload di report, expected, actual, diff e trace soltanto su failure;
9. `git diff --check`.

Retention artifact: 7 giorni, coerente con l’E2E attuale. Nessun secret, database, deploy o permission write.

### 15. Comandi root

```text
pnpm visual:geometry
pnpm visual:geometry:update
pnpm visual:geometry:report
pnpm visual:geometry:self-test
```

Il quarto comando è interno ma resta esplicito per rendere verificabile l’infrastruttura. Non vengono aggiunti alias ridondanti.

## File ownership previsto

- `playwright.visual-geometry.config.ts`: ambiente browser e reporter.
- `tests/visual-geometry/README.md`: contratto operativo, baseline e coverage.
- `tests/visual-geometry/surface-manifest.mjs`: source of truth delle superfici.
- `tests/visual-geometry/manifest.test.mjs`: schema, route coverage e invarianti.
- `tests/visual-geometry/visual-geometry.spec.ts`: esecuzione manifest-driven.
- `tests/visual-geometry/geometry-assertions.ts`: browser adapter.
- `tests/visual-geometry/geometry-contracts.mjs`: confronti puri e diagnostica.
- `tests/visual-geometry/interaction-setups.ts`: stati nascosti/interattivi.
- `tests/visual-geometry/stability.ts`: clock, network e readiness non-font.
- `tests/visual-geometry/__snapshots__/README.md`: policy della baseline.
- `scripts/visual-geometry/README.md`: responsabilità dei runner.
- `scripts/visual-geometry/run.mjs`: orchestrazione locale/CI.
- `scripts/visual-geometry/blast-radius.mjs`: selezione fail-safe.
- `scripts/visual-geometry/snapshot-policy.mjs`: guard update baseline.
- `scripts/visual-geometry/report.mjs`: summary machine-readable.
- `scripts/visual-geometry/*.test.mjs`: self-test pure e meta-canary.
- `.github/workflows/visual-geometry.yml`: required-quality check.
- Sirio: soltanto estensioni minime ai proof esistenti necessarie ai target/stati.
- `package.json`: quattro comandi root.
- `docs/07_QUALITY_AND_RELEASE.md`: contratto canonico del gate.
- `project_brain.json`: `implemented_decision` soltanto dopo gate verdi.
- `AGENTS.md`: aggiornato soltanto se il workflow operativo per agenti cambia realmente.

## Error handling

Il gate fallisce chiuso per:

- manifest invalido;
- route nuova non classificata;
- server locale non pronto;
- network esterna inattesa necessaria al contenuto testato;
- snapshot mancante;
- raster diff sopra la policy;
- geometry mismatch;
- overflow/clipping rilevato;
- baseline update implicito;
- selector ambiguo su file frontend.

Il controllo font è l’unica eccezione esplicita: non produce pass, failure o warning.

## Verifica e chiusura

Prima della PR devono essere eseguiti realmente:

```text
pnpm visual:geometry:self-test
pnpm visual:geometry
pnpm check:fast
pnpm check
git diff --check
```

Se la Skill Governance sarà nel base branch al momento del rebase finale, si aggiunge `pnpm skills:doctor`; non si importa la sua implementazione da branch non mergiati.

Impeccable viene rieseguito sul context Sirio con detector manuale sui target UI modificati. La review valuta findings reali, focus, temi, hidden states, reduced motion e overflow senza trasformare questa infrastruttura in una nuova Impeccable.

La PR va verso `master`, non viene mergiata automaticamente e non modifica branch protection. L’azione manuale residua sarà aggiungere `visual-geometry` ai required checks dopo che il check esiste ed è verde sullo SHA della PR.

## Database operation impact

```text
Operazioni aggiunte: 0
Operazioni eliminate: 0
Query per flusso prima: invariato
Query per flusso dopo: invariato
Rischio N+1: invariato
Strategia cache: invariata
Strategia invalidazione: invariata
Impatto tenant isolation: nessuno
Database e Blob interrogati: no
```

