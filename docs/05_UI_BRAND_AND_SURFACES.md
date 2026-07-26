# UI, brand and surfaces

## Stato attuale verificato

Qoovex usa la foundation derivata da `Kiranism/next-shadcn-dashboard-starter` al commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`: shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4 CSS-first, Geist/Geist Mono e tema Vercel light/dark/system. Provenienza e licenze sono in `packages/ui/THIRD_PARTY_NOTICES.md`.

`packages/ui` e la foundation condivisa implementata per token, CSS base, primitive, tema, hook e utility. Sirio, Web e Workspace importano subpath espliciti; layout e composizioni dominio restano app-locali. `packages/brand-resources` espone soltanto SVG proprietari.

Contratti trasversali implementati:

- `Button` e action-only; link e navigazione usano elementi reali e `buttonVariants` quando necessario;
- link `inline`, `quiet` e `plain` distinguono contenuto, azione testuale e navigazione;
- testo operativo ed editoriale resta selezionabile; immagini, marchio e mockup possono disabilitare la selezione accidentale;
- scrollbar nativa condivisa con fallback touch e forced-colors;
- focus visibile, tastiera, touch, zoom 200%, contenuti lunghi, reduced motion e forced colors sono requisiti;
- motion limitata a orientamento e feedback; nessuna libreria visuale parallela;
- copy prudente: presente, mancante, in scadenza, da verificare, pronto per revisione.

Web contiene marketing e pagine legali; Sirio e il catalogo/proof. Le superfici auth Workspace condividono primitive approvate, incluse PasswordInput, OtpInput, Dialog e Sheet, senza spostare logica auth nel package UI.

La UI Workspace attuale usa una shell role-aware con topbar, notifiche, tema, breadcrumb, gruppi Documenti/Persone/Cantieri, Calendario, Preferiti e Azioni rapide. `Da fare` mostra la coda situation-centric. Ricerca e Analisi sono disabilitate e marcate come non disponibili. Le viste complete di documenti, persone, cantieri, calendario, scadenze, checklist, prove, pacchetti, archivi e impostazioni esistono come superfici operative o avanzate.

I Dialog contestuali preservano route, permessi e resource scope. Le viste archivio mantengono conferme distruttive; le superfici non azionabili non simulano hover o navigazione. Notifiche e contatore restano nella topbar.

## Direzione approvata

La direzione target non e una collezione di moduli CRUD coordinati dalla sidebar:

- `Da fare` evolve nel centro operativo con decisioni, processi in corso, blocchi e risultati;
- un ingresso universale per file, foto, informazioni, lavoratori e cantieri sostituisce le azioni rapide globali;
- Preferiti non resta un secondo sistema primario di navigazione prima di una ricerca universale reale;
- viste documentali, profili, calendario, checklist, prove, pacchetti, archivi, accessi e configurazioni diventano dettaglio avanzato o contestuale;
- le azioni ricevono il contesto dal processo o dalla risorsa aperta e chiedono soltanto informazioni realmente mancanti;
- ogni eccezione mostra problema, motivo, conseguenza, proposta, attore autorizzato, azione primaria e condizione di ripresa;
- progressi e risultati provengono da stato reale: nessuna percentuale, metrica o capability simulata.

Il centro operativo dovra coprire loading, vuoto, errore, retry, waiting, blocked, failed, completed, permesso insufficiente, contenuto lungo e stati responsive/accessibili. La timeline deve essere leggibile ma minimizzata e separata dall'audit tecnico.

## Specifiche concettuali non implementate

Ingresso universale, ricerca universale, cronologia di processo, viste `In corso`, eccezioni persistenti e decisioni inline non esistono oggi. I blueprint Documento/Lavoratore/Cantiere/Controllo continuo non autorizzano redesign, componenti, route o payload.

Qualunque futura implementazione UI segue il workflow Qoovex Sirio-first e richiede approvazione separata prima della promozione in Workspace. La foundation, accessibilita, ruoli, API, Prisma e Blob non cambiano per effetto di questa documentazione.

## Decisioni aperte e hard stop

Restano da decidere IA finale, naming delle viste, ricerca, canali di ingresso, ruoli per decisione, soglie, annullamento, sensibilita e disclosure. Non rimuovere route o flussi attuali finche una migrazione prodotto approvata non garantisce compatibilita e controllo avanzato.

## Verifica visuale futura

Le modifiche UI reali richiederanno Sirio, viewport 320/390/768/1024/1440, light/dark/system, zoom 200%, tastiera, touch, focus, reduced motion, forced colors, hydration, console e overflow. Questa task documentale non modifica superfici e non richiede browser proof.
