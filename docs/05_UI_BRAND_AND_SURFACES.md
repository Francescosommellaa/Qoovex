# UI, brand and surfaces

## Stato attuale verificato

La direzione grafica e invariata. Qoovex usa shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4 CSS-first, Geist/Geist Mono e tema Vercel light/dark/system. Token, font, tema, iconografia, motion, primitive e stile base non sono stati modificati in Fase 3. `apps/sirio` e rimasta invariata; in `packages/ui` e stato allineato soltanto il verifier della foundation ai nuovi entrypoint Workspace.

Il Workspace usa ora una shell primaria ridotta: Centro operativo, Documenti, Lavoratori, Cantieri, Pacchetti quando autorizzato e Impostazioni. Preferiti, Azioni rapide e placeholder Ricerca/Analisi non sono piu parte della shell. Notifiche, account e tema restano nella topbar/footer account.

`/dashboard` conserva compatibilita URL ma presenta “Centro operativo”. L'ingresso universale responsive apre i flussi controllati esistenti; `/operations/[processId]` mostra stato reale, step, timeline, decisioni, eccezioni e artifact. Le viste di dominio restano controllo avanzato.

Le nuove composizioni usano esclusivamente primitive canoniche gia presenti. Restano vincolanti focus visibile, tastiera, touch, zoom 200%, contenuti lunghi, reduced motion, forced colors, light/dark/system e nessuna capability simulata.

## Direzione approvata

La UI primaria resta exception-driven: problema, motivo, prossimo passo e attore autorizzato sono visibili nello stesso contesto. Progressi e risultati derivano dallo stato persistito; non vengono inventate percentuali o metriche.

## Specifiche non implementate

Ricerca universale, OCR/AI, nuovi canali di intake e visual editor non sono attivi. L'ingresso universale non e un endpoint generico e non sostituisce i controlli dei flussi dominio.

## Decisioni aperte e hard stop

Ricerca, nuovi canali, disclosure sensibile e nuove primitive richiedono approvazione. Non adottare Satoshi, Chillax, Phosphor o una foundation visuale parallela.

## Verifica visuale

Le superfici Fase 3 devono essere provate a 320/390/768/1024/1440, light/dark/system, zoom 200%, tastiera, touch, reduced motion, forced colors, hydration, console e overflow prima di una dichiarazione di release.
