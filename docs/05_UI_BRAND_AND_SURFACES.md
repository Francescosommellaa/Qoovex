# 05 â€” UI, brand and surfaces

## verified_current_state

La foundation visiva corrente resta invariata: shadcn base-nova, Base UI, Tabler, Tailwind v4, Geist/Geist Mono e token Qoovex. Le composizioni dominio sono app-local nel Workspace; nessun nuovo design system o brand Ã¨ stato introdotto.

## Superficie Azienda

Home, lista cantieri e dettaglio attuale sono presenti e raggiungibili nel routing con Riepilogo, Timeline, Step, Richieste, Modifiche, Pagamenti, Persone, File, Chiusura e Impostazioni. La presenza delle azioni non prova l'uso end-to-end: la creazione produce oggi un responsabile `PENDING`, che blocca l'invito cliente protetto da actor `ACTIVE`.

## Superficie cliente

Home separata e dettaglio cliente sono presenti. Le query del dettaglio filtrano timeline e allegati condivisi, ma il lifecycle non Ã¨ conforme al contratto perchÃ© l'accettazione dell'invito persiste oggi il participant cliente come `ACTIVE` prima della conferma iniziale. La UI non deve essere considerata verificata finchÃ© la vertical slice dedicata resta rossa.

## Form e stati

La validazione server-side e diversi stati UI sono presenti, ma errori field-level, focus, prevenzione double-submit e completezza degli stati non sono stati provati sistematicamente end-to-end. Nessuna capability deve essere classificata pronta sulla sola presenza di route, componenti o `testId` nel registry.

## Copy prudente

Il prodotto usa â€œconfermato dalle partiâ€, â€œinvio dichiaratoâ€, â€œricezione confermata dallâ€™Aziendaâ€, â€œconclusione stimataâ€ e â€œIBAN indicato dallâ€™Aziendaâ€. Non promette conformitÃ , collaudo, assenza difetti, pagamento garantito o validitÃ  legale.

## Marketing (apps/web) â€” polish microinterazioni

`verified_current_state`. Il sito marketing usa la stessa foundation (token Qoovex, Geist, Tabler) senza nuovi design system. Le microinterazioni sono sobrie e basate solo su `transform`/`opacity`:

- Scroll reveal (`components/reveal.tsx` + `[data-reveal]` in `globals.css`): entrata unica con `--ease-standard`, stagger via `--reveal-delay`, rete di sicurezza a 700ms, disattivato con `prefers-reduced-motion` e nessun contenuto nascosto senza JavaScript.
- Card di contenuto: lift discreto in hover (`-translate-y-0.5`, ombra e ring del token `foreground`).
- Frecce inline e dei bottoni primari: micro-spostamento in hover tramite `group`/`group-hover/button`.
- FAQ (Base UI Collapsible): trigger con transizione colore e chevron ruotato su `data-panel-open`.

Verifica: `apps/web` compila come 16 route statiche, `verify-foundation` passa, Web Vitals su `/` con CLS 0.0. Nessuna modifica a `packages/ui`, schema, auth o confini app/package. Il perimetro resta la vetrina pubblica: nessuna capability attuale Ã¨ presentata come disponibile.
