# Visual System Implementation Plan

## Scopo

Definire l’ordine futuro di prototipazione e implementazione senza modificare
ora app, token o componenti.

## Stato

La fondazione Stable v0.1 ha superato il prototipo Sirio e i gate descritti
qui. `packages/ui@0.1.0` espone token, Blur System e le primitive `Button`,
`Card`, `Input`, `Badge` e `GlassPanel`; le fasi successive restano incrementali.

## Fase 0 — Materiali realistici

Preparare prima della UI:

- dataset italiano con almeno 8 ricette e 2 menu;
- caso principale di chef consulente con due clienti;
- esempio di allergeni con stati rilevato, da verificare e confermato;
- lista della spesa realistica;
- task collegato a recipe snapshot;
- storyboard ricetta → menu → lista/piano;
- copy tratto da `docs/ux`.

**Gate:** nessun mockup usa feature roadmap o dati inventati presentati come
reali.

## Fase 1 — Audit e mapping

1. Confermare che `packages/ui` e Sirio siano ancora scaffold.
2. Inventariare configurazione CSS, font e build.
3. Definire ownership dei token primitivi e semantici.
4. Mappare app consumer e `transpilePackages`.
5. Registrare baseline performance e accessibilità.

**Output:** proposta di mapping, nessuna implementazione implicita.

## Fase 2 — Prototipo Sirio

Costruire pagine di prova, non schermate prodotto finali:

- color ramps e contrast pairs;
- type specimen italiano con quantità, unità e allergeni;
- surface stack su background reali;
- blur bands e preset;
- focus, disabled, error e success;
- hero lens statica e animata;
- fallback senza backdrop-filter;
- confronto 375, 768, 1024 e 1440 px.

**Gate:** approvato per palette, blur, radius, shadow, motion e fallback.
I font esterni restano fuori dal contratto.

## Fase 3 — Token

Implementare in `packages/ui`:

1. primitive monocromatiche e funzionali;
2. token semantici di superficie, testo e bordo;
3. blur, alpha, shadow, glow e layer;
4. type scale e font roles;
5. motion e reduced motion;
6. fallback trasparenza;
7. documentazione token.

I consumer non usano primitive cromatiche direttamente salvo eccezioni
documentate.

**Gate:** type-check, lint, build, contrast audit e visual snapshot Sirio.

## Fase 4 — Primitive componenti

Ordine composition-first:

1. Button e focus ring.
2. Field control, Input e Textarea.
3. Select e menu surface.
4. Card e Divider.
5. Popover e Dropdown.
6. Dialog e Drawer.
7. Tabs.
8. Toast.

Per ogni componente:

- implementare tutti gli stati pertinenti;
- verificare keyboard e focus;
- testare light e superficie inversa;
- testare reduced motion;
- rimuovere override duplicati nei consumer solo quando esistono.

## Fase 5 — Shell

1. Topbar.
2. Navigazione mobile.
3. Sidebar desktop.
4. Command menu.
5. Empty state.

**Gate:** massimo due layer backdrop simultanei, nessuna regressione di scroll
e flusso completo da tastiera.

## Fase 6 — Componenti di dominio

Ordine guidato dal job principale:

1. Recipe card e dettaglio.
2. Menu card e preview.
3. Allergeni e stato di verifica.
4. Shopping list.
5. Work plan task card e recipe snapshot.
6. Notifiche.
7. Explore dopo il valore core.

Le business rule vengono lette dalle fonti canoniche; non vengono duplicate nei
componenti.

## Fase 7 — Marketing

1. Header e CTA.
2. Hero lens.
3. Trasformazione ricetta → output.
4. Feature section.
5. Product preview.
6. Proof.
7. Pricing derivato da `plan_rules.json`.
8. CTA finale.

La hero entra dopo che esiste almeno un linguaggio di prodotto credibile da
mostrare.

## Test plan

### Visual

- Screenshot a 375, 768, 1024 e 1440 px.
- Light canvas e superficie inversa.
- Background semplice e complesso sotto glass.
- Zoom 200%.
- Condizioni high contrast quando disponibili.

### Stati

- Default.
- Hover.
- Active/pressed.
- Focus-visible.
- Disabled.
- Loading.
- Open/closed.
- Error.
- Success.
- Reduced motion.

### Accessibilità

- WCAG 2.2 AA.
- Keyboard completa.
- Focus restoration.
- Label e description programmatiche.
- Stato non dipendente dal colore.
- Touch target almeno 44 × 44 px.
- Screen reader per dialog, menu, toast e form.

### Performance

- Scroll mobile con superfici sticky.
- Layer count e compositing.
- Core Web Vitals sul marketing.
- Peso e caricamento font.
- Fallback senza backdrop-filter.
- Liste lunghe senza blur per item.

### Repository

- `pnpm check:repo`
- `pnpm lint`
- `pnpm type-check`
- build focalizzate e poi complete
- test componenti e browser

## Rollout

- Integrare una famiglia di primitive alla volta.
- Non mantenere due contratti visuali per la stessa responsabilità.
- Evitare flag visuali permanenti; usare una migrazione breve e verificabile.
- Aggiornare Sirio, Components Map e Brain nella stessa milestone.
- Marketing e workspace possono uscire in tempi diversi, ma condividono token
  approvati.

## Esempio

Corretto:

> Validare `glass-navigation` in Sirio su topbar mobile e sidebar desktop prima
> di applicarlo alle app.

Errato:

> Creare subito una landing completa e dedurre i token dal CSS finale.

## Anti-pattern

- Token implementati prima dei test.
- Tutti i componenti sviluppati in parallelo.
- Nuova dipendenza introdotta per un singolo effetto.
- UI marketing che anticipa componenti inesistenti.
- Snapshot aggiornati per nascondere regressioni.
- Brain aggiornato come se la UI fosse disponibile.

## Impatto sul marketing

Il marketing viene implementato dopo le primitive e almeno una preview
prodotto coerente. La firma hero non detta le superfici operative.

## Impatto sul workspace

Il workspace guida leggibilità, accessibilità e performance dei token
condivisi. I componenti di dominio seguono l’ordine dei job UX.

## Rischi tecnici

- Sirio usato come design separato invece che laboratorio.
- Token troppo numerosi prima di avere componenti.
- Font o blur non sostenibili su mobile.
- Consumer override che frammentano la fonte canonica.
- Stato documentale scambiato per stato implementativo.

## Richiede conferma

- Inizio delle fasi successive alla fondazione Stable v0.1.
- Nuove dipendenze.
- Breaking change a token o API pubbliche.
- Eccezioni ai limiti blur.
- Rollout nelle app consumer.

## Checklist

- [ ] I materiali realistici esistono.
- [ ] Sirio valida i token prima del runtime.
- [ ] I componenti procedono deepest-first.
- [ ] Ogni stato e viewport è verificato.
- [ ] Accessibilità e performance sono gate, non follow-up.
- [ ] Brain distingue documentato, prototipato e implementato.
