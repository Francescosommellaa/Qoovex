# UI, brand and surfaces

## Stato attuale verificato

La direzione grafica e invariata. Qoovex usa shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4 CSS-first, Geist/Geist Mono e tema Vercel light/dark/system. Token, font, tema, iconografia, motion e stile base non sono stati modificati. `packages/ui` aggiunge solo primitive generiche per search field/results, timeline e work queue; `apps/sirio` ne dimostra loading, empty, error, timeline lunga, ricerca multi-tipo e review.

Il Workspace usa una sola shell adattiva. La zona superiore resta `Panoramica`, `Analytics` disattivato e `Calendario` disattivato; `Cerca` e il controllo iconico accanto al nome Qoovex e apre il modale consultivo (`Ctrl/Cmd+K`). La zona centrale mostra fino a sei cantieri recenti accessibili, espandibili per tre aggiornamenti reali, seguiti da `Tutti i cantieri`; Lavoratori e Azienda non sono duplicati nella navigazione principale. La card `Azioni rapide`, nel footer sopra l'account, espone quattro mutazioni iconiche derivate dai permessi. Notifiche e tema mantengono la collocazione esistente; azienda, collaboratori e account sono raggiungibili dalla card account.

In locale, un solo dropdown nella topbar passa tra le viste `Owner`, `Support Agent` e `Platform Admin`; il vecchio banner di cambio vista e stato eliminato. Il profilo dev e il comando `Accedi come dev` restano invariati. La sezione Accessi usa un invito progressivo in quattro passaggi con preset, scope `FULL/ASSIGNED`, risorse selezionate, permessi raggruppati e riepilogo; la modifica di un Collaborator mostra differenze prima della conferma.

Sirio include la prova `/dashboard/operational-workspace` per profilo, cantiere, prova mobile, richieste, review pacchetto e timeline. Workspace promuove il profilo azienda in `/settings/organization-profile`, la state machine e il lavoro contestuale nel dettaglio cantiere, e gli stati di revisione su versioni e prove. Il dettaglio cantiere include otto sezioni reali: Riepilogo, Aggiornamenti, Documenti, Prove, Collaboratori, Checklist, Condivisioni e Impostazioni; `people` e `activities` restano identificatori compatibili per i deep link.

`/dashboard` conserva compatibilita URL ma presenta “Panoramica”. La composizione usa tutto il canvas disponibile: spiega il motore come sequenza `Controlla -> Esegue -> Si ferma`, dichiara esplicitamente che l'IA non e attiva e separa `Cosa serve da te` da `Cosa ha fatto Qoovex`. Le due superfici sono affiancate su desktop e impilate su tablet/mobile. Ogni intervento distingue fatto dal motore, scelta richiesta e una sola azione; i testi lunghi restano nel dettaglio operativo. La pagina ignora `?view=`, non duplica le `Azioni rapide`, mostra cinque interventi iniziali con progressive disclosure da tastiera e al massimo cinque risultati significativi. `/operations/[processId]` conserva stato reale, step, timeline, decisioni, eccezioni e artifact.

Le nuove composizioni usano esclusivamente primitive canoniche gia presenti. Restano vincolanti focus visibile, tastiera, touch, zoom 200%, contenuti lunghi, reduced motion, forced colors, light/dark/system e nessuna capability simulata.

## Direzione approvata

La UI primaria resta exception-driven: problema, motivo, prossimo passo e attore autorizzato sono visibili nello stesso contesto. Progressi e risultati derivano dallo stato persistito; non vengono inventate percentuali o metriche.

## Specifiche non implementate

Ricerca nei file o semantica, OCR/AI, viste salvate, nuovi canali di intake e visual editor non sono attivi. La ricerca Fase 4 e consultiva e limitata ai metadati autorizzati.

## Decisioni aperte e hard stop

Ricerca nei file o semantica, viste salvate/cronologia, nuovi canali, disclosure sensibile e modifiche alle primitive o alla foundation richiedono approvazione. Non adottare Satoshi, Chillax, Phosphor o una foundation visuale parallela.

## Verifica visuale

Le superfici operative devono essere provate a 320/390/768/1024/1440, light/dark/system, zoom 200%, tastiera, touch, reduced motion, forced colors, hydration, console e overflow prima di una dichiarazione di release.
