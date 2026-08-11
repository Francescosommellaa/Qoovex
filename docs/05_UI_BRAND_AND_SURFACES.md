# 05 — UI, brand and surfaces

## verified_current_state

La foundation visiva corrente resta invariata: shadcn base-nova, Base UI, Tabler, Tailwind v4, General Sans (principale), ARRAY (accent) e token Qoovex. Le composizioni dominio sono app-local nel Workspace; nessun nuovo design system o brand è stato introdotto.

## Onboarding e destinazione

Dopo autenticazione l'account sceglie una sola volta `BUSINESS`, `PROFESSIONAL` o `CLIENT`. Senza ruolo non può entrare in un contesto tenant o participant. Un account `BUSINESS` crea e usa una sola Azienda attiva; non esiste una vista per scegliere tra più Aziende. `PROFESSIONAL` attende o accetta un invito Collaborator compatibile; `CLIENT` accede soltanto ai cantieri a cui partecipa.

In sviluppo il selettore controllato espone cinque viste: Azienda, Professionista, Cliente, Support Agent e Platform Admin. Il selettore non concede permessi né dati e non è disponibile come escalation nel runtime Production.

## Superficie Azienda

Home, lista cantieri e dettaglio sono presenti e raggiungibili nel routing con Riepilogo, Timeline, Step, Richieste, Modifiche, Pagamenti, Persone, File, Chiusura e Impostazioni. La prima vertical slice lifecycle è verificata: la creazione registra atomicamente il responsabile come participant Azienda `ACTIVE`, consentendo subito le operazioni autorizzate e l'invito del cliente.

## Superficie cliente

Home separata e dettaglio cliente sono presenti. Le query del dettaglio filtrano timeline e allegati condivisi. L'accettazione dell'invito crea il participant cliente `PENDING`; l'attivazione avviene soltanto dopo la conferma del riepilogo iniziale. I test lifecycle dedicati verificano questo passaggio e il relativo isolamento.

## Form e stati

La validazione server-side e diversi stati UI sono presenti. Errori field-level, focus, prevenzione double-submit e completezza degli stati devono continuare a essere provati per la capability interessata: la sola presenza di route, componenti o `testId` nel registry non basta a dichiararla verificata.

## Copy prudente

Il prodotto usa “confermato dalle parti”, “invio dichiarato”, “ricezione confermata dall’Azienda”, “conclusione stimata” e “IBAN indicato dall’Azienda”. Non promette conformità, collaudo, assenza difetti, pagamento garantito o validità legale.

## Marketing (apps/web) — polish microinterazioni

`verified_current_state`. Il sito marketing usa la stessa foundation (token Qoovex, General Sans / ARRAY, Tabler) senza nuovi design system. Le microinterazioni sono sobrie e basate solo su `transform`/`opacity`:

- Scroll reveal (`components/reveal.tsx` + `[data-reveal]` in `globals.css`): entrata unica con `--ease-standard`, stagger via `--reveal-delay`, rete di sicurezza a 700ms, disattivato con `prefers-reduced-motion` e nessun contenuto nascosto senza JavaScript.
- Card di contenuto: lift discreto in hover (`-translate-y-0.5`, ombra e ring del token `foreground`).
- Frecce inline e dei bottoni primari: micro-spostamento in hover tramite `group`/`group-hover/button`.
- FAQ (Base UI Collapsible): trigger con transizione colore e chevron ruotato su `data-panel-open`.

Verifica: `apps/web` compila come 16 route statiche, `verify-foundation` passa, Web Vitals su `/` con CLS 0.0. Nessuna modifica a `packages/ui`, schema, auth o confini app/package. Il perimetro resta la vetrina pubblica: nessuna capability non verificata è presentata come disponibile.
