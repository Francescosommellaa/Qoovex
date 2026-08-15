# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Qoovex Workspace serve tre gruppi di utenti principali, ciascuno con un ruolo essenziale nel rapporto di cantiere.

- **Aziende edili:** usano il prodotto con continuità per gestire più clienti, cantieri e collaboratori. Creano e seguono i cantieri, invitano le persone coinvolte e coordinano attività, informazioni, documenti, richieste e conferme.
- **Collaboratori e professionisti — `verified_current_state`:** un account `PROFESSIONAL` può accettare un invito Collaborator compatibile e accedere alle risorse autorizzate. L'Azienda può gestire record lavoratore propri, con dati operativi essenziali, e collegarli agli account. **`approved_product_direction` + `conceptual_not_implemented`:** il profilo professionale personale, la scelta strutturata del ruolo, i documenti propri riutilizzabili e la futura ricerca di Aziende presso cui lavorare restano direzioni approvate, non capability correnti.
- **Clienti dell'Azienda — `verified_current_state`:** possono seguire i cantieri a cui partecipano, consultare la proiezione condivisa, interagire nei flussi autorizzati, creare più immobili con dati essenziali e collegare un cantiere attivo a un immobile. I file disponibili oggi restano allegati contestuali al cantiere. **`approved_product_direction` + `conceptual_not_implemented`:** un profilo documentale riutilizzabile dell'immobile e documenti della struttura disponibili automaticamente per lavori successivi non sono implementati.

## Product Purpose

Qoovex rende il processo di cantiere più semplice e trasparente per tutte le persone coinvolte. Riunisce in un unico spazio condiviso clienti, Aziende e Collaboratori, insieme a informazioni, documenti, avanzamento, domande, prove, modifiche, pagamenti dichiarati e conferme.

Il successo del prodotto significa che nessun utente debba chiedersi quale sia il prossimo passo, come completarlo o dove trovare ciò che serve. Le azioni devono essere guidate, comprensibili e facili anche per chi usa raramente strumenti digitali complessi.

## Positioning

Qoovex non è soltanto un gestionale di progetto: semplifica e rende trasparente il rapporto tra Azienda, Collaboratori e cliente lungo tutto il lavoro. Informazioni, richieste, decisioni e prove rimangono collegate al cantiere e alla struttura interessata in una cronologia condivisa, strutturata, versionata e scaricabile.

Il valore distintivo nasce dall'unione di tre elementi:

1. `approved_product_direction`: ogni persona inserisce dati e documenti una volta e li riutilizza nei rapporti autorizzati successivi; questa riusabilità trasversale è `conceptual_not_implemented` nello stato corrente;
2. il cliente può capire, chiedere e verificare senza inseguire conversazioni e file dispersi;
3. il processo conserva una traccia ordinata di ciò che è stato condiviso, richiesto, dichiarato e confermato, utile anche quando occorre ricostruire i fatti dopo un problema o un sinistro.

Qoovex non promette valore probatorio, validità legale, conformità tecnica, assenza di difetti o esiti garantiti.

## Operating Context

`verified_current_state`: l'Azienda gestisce più clienti e cantieri, coinvolge Collaboratori e condivide con il cliente soltanto ciò che appartiene al rapporto autorizzato. Il Collaboratore accede tramite invito e permessi effettivi; i record lavoratore correnti sono organizzazione-scoped. Il cliente mantiene immobili privati con dati essenziali e può collegare ciascun cantiere attivo a un immobile.

`approved_product_direction` + `conceptual_not_implemented`: il Collaboratore mantiene un profilo professionale personale con dati e documenti riutilizzabili; il cliente mantiene un archivio documentale riutilizzabile delle proprie strutture. Queste capacità non devono essere presentate come disponibili finché codice, schema, permessi e superfici non le implementano e verificano.

`approved_product_direction`: il workflow desiderato collega l'invito dell'Azienda, l'accettazione del cliente e la scelta di una struttura già censita dal cliente, affinché il nuovo rapporto di cantiere possa partire con i dati necessari già disponibili. `verified_current_state`: il runtime crea il cantiere prima dell'invito cliente e consente di collegare l'immobile soltanto a un participant cliente `ACTIVE`. L'eventuale riallineamento del lifecycle è `conceptual_not_implemented` e richiede una task di prodotto e runtime separata. Non risultano `open_decision` o `hard_stop` ulteriori per questa sola correzione documentale.

Ogni account sceglie una sola volta `BUSINESS`, `PROFESSIONAL` o `CLIENT`. Un account può avere al massimo una membership Azienda attiva e non sceglie l'Azienda da un selettore. Il ruolo account non concede da solo accesso a dati o cantieri: autorizzazioni, membership, partecipazione e permessi restano espliciti e verificati server-side.

## Capabilities and Constraints

- `verified_current_state`: le superfici correnti coprono account e inviti, Azienda, record lavoratore e accessi Collaborator, clienti, immobili con dati essenziali, cantieri, cronologia, allegati contestuali, step, richieste, proposte e controproposte, pagamenti documentati, dispute, chiusura, export, ricerca e notifiche; la presenza nel codice non equivale automaticamente a readiness end-to-end.
- L'Azienda paga il prodotto; Collaboratori e clienti invitati non pagano. Pricing, piani, trial, limiti ed entitlement non sono ancora definiti o implementati.
- `CLIENT` è un partecipante del cantiere e non un ruolo Azienda. Un Collaboratore opera soltanto nei limiti degli inviti e dei permessi effettivi.
- `approved_product_direction` + `conceptual_not_implemented`: dati, documenti e profili riutilizzabili devono ridurre richieste ripetitive senza indebolire privacy, minimizzazione, isolamento tenant o controllo esplicito delle condivisioni. Non sono una capability corrente.
- La ricerca di Aziende da parte dei Collaboratori è una direzione futura. Non sono implementati marketplace, pagamenti in-app, escrow, KYC, firma elettronica qualificata, fatturazione, contabilità, paghe, BIM o geolocalizzazione continua.
- Non è prevista cancellazione fisica di cantieri o account. I file restano privati e mediati dal server.

## Brand Commitments

Il nome del prodotto è **Qoovex**. La voce deve essere chiara, concreta, rassicurante e prudente: guida l'utente con parole quotidiane, evita gergo tecnico e non inventa garanzie legali o commerciali.

La foundation esistente è un impegno da preservare: shadcn `base-nova`, Base UI, Tabler Icons, token Qoovex, General Sans come carattere principale e Array soltanto come accento controllato. Il Workspace usa composizioni di dominio locali e non introduce un design system alternativo.

## Evidence on Hand

- Verità di prodotto e limiti: `../../docs/00_PRODUCT_AND_SCOPE.md`.
- Modello di accesso e autorizzazione: `../../docs/01_DOMAIN_AND_AUTHORIZATION.md`.
- Foundation, superfici e copy prudente: `../../docs/05_UI_BRAND_AND_SURFACES.md`.
- Route, sicurezza e capability correnti: `README.md` e `src/shared/server/job-site-registry.ts`.
- Implementazione visiva corrente: `src/views`, `src/app/globals.css` e `../../packages/ui`.
- Marchio Workspace: `public/brand/qoovex-workspace-icon.svg`.
- Non risultano nel repository testimonianze, benchmark, casi studio, certificazioni o prove legali da presentare come fatti di marketing.

## Product Principles

1. **Facilissimo, senza esitazioni:** ogni schermata deve rendere evidente cosa sta succedendo, cosa serve e quale azione viene dopo.
2. **Trasparenza con contesto:** domande, risposte, documenti, prove, decisioni e conferme restano comprensibili e collegate al lavoro corretto.
3. **Inserire una volta, riutilizzare con controllo:** persone e strutture conservano dati e documenti utili, condividendoli soltanto nei rapporti autorizzati.
4. **Tutela attraverso chiarezza e tracciabilità:** il cliente deve poter verificare il lavoro senza attrito; la cronologia conserva i fatti senza trasformarli in promesse legali.
5. **Permessi reali, mai impliciti:** ruolo, interfaccia o convenienza non sostituiscono autorizzazione, privacy e isolamento dei dati.

## Accessibility & Inclusion

L'obiettivo è la massima accessibilità pratica. Flussi, linguaggio, navigazione, feedback e stati devono funzionare anche per persone con esperienza digitale limitata e non devono affidarsi soltanto a colore, memoria o conoscenze tecniche. Tastiera, focus, semantica, contrasto, riduzione del movimento, errori comprensibili e comportamento responsive sono requisiti permanenti.

Non è ancora stato confermato uno standard formale specifico, come WCAG 2.2 AA; future dichiarazioni di conformità richiedono una verifica dedicata.
