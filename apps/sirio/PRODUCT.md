# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sirio è destinato alle persone e agli agenti che progettano, sviluppano, verificano e mantengono le interfacce Qoovex.

I suoi utenti principali sono designer, sviluppatori frontend, revisori di accessibilità, responsabili del design system e agenti di implementazione che devono vedere il sistema condiviso in esecuzione prima di adottarlo nelle applicazioni reali.

Sirio non è una superficie per Aziende, clienti o Collaboratori e non deve essere interpretato come prodotto operativo o demo commerciale.

## Product Purpose

Sirio rende verificabile il design system Qoovex attraverso un catalogo eseguibile di fondazioni, componenti, stati limite e composizioni rappresentative.

Il suo successo consiste nel ridurre ambiguità tra intenzione progettuale e implementazione: chi lavora su Qoovex deve poter osservare comportamento, accessibilità, responsive layout, temi e integrazione dei componenti prima che una soluzione venga promossa nelle superfici di prodotto.

## Positioning

Sirio è il banco prova canonico dell'interfaccia Qoovex. Trasforma token e primitive di `@qoovex/ui` in prove osservabili, mantenendo distinto ciò che è fondazione condivisa da ciò che è composizione locale di una singola applicazione.

Il suo valore non deriva dalla quantità di esempi, ma dalla qualità della verifica: esempi realistici, stati completi, confini espliciti e nessuna rappresentazione ingannevole di capability di prodotto.

## Operating Context

Sirio viene usato durante progettazione, implementazione, revisione e manutenzione del frontend. Il catalogo espone fondazioni e componenti; le superfici rappresentative di marketing e dashboard servono a controllare come il sistema si comporta in composizioni credibili.

Tutti i contenuti sono dimostrativi. Dati, controlli e flussi non devono richiedere autenticazione, database, API di dominio o servizi del Workspace. Un esempio può simulare uno stato visuale, ma non può essere presentato come funzionalità operativa verificata.

## Capabilities and Constraints

- La route principale cataloga fondazioni, componenti e stati rilevanti; le route rappresentative mostrano composizioni marketing e dashboard.
- I componenti canonici provengono da `@qoovex/ui`. Sirio può comporli e documentarli, ma non duplicarli come implementazioni locali concorrenti.
- Gli esempi devono includere gli stati necessari alla valutazione: default, interazione, focus, errore, disabilitato, caricamento, contenuto lungo e comportamento responsive quando pertinenti.
- Sirio usa soltanto dati dimostrativi e non importa Prisma, Auth.js, servizi di prodotto o dati privati.
- Copy e scenari devono rispettare i confini reali di Qoovex e non inventare prezzi, testimonianze, compliance o capability.
- Sirio è una prova tecnica e visuale, non l'unica verifica richiesta per promuovere una modifica condivisa.

## Brand Commitments

Sirio rappresenta fedelmente la foundation Qoovex: shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4, token semantici, General Sans come carattere principale e Array soltanto come accento controllato.

Il carattere dell'interfaccia è rassicurante, calmo, accessibile, umano, tracciabile e operativo. Profondità, movimento e tattilità restano contenuti, chiari e prevedibili; gli esempi non introducono un'estetica alternativa per apparire più spettacolari.

## Evidence on Hand

- Mandato, route e confini di Sirio: `README.md`.
- Catalogo e superfici rappresentative correnti: `src/app` e `src/components`.
- Foundation consumata in esecuzione: `../../packages/ui`.
- Contratto visuale e rapporto tra applicazioni: `../../docs/05_UI_BRAND_AND_SURFACES.md`.
- Verità e limiti di prodotto da rispettare negli esempi: `../../docs/00_PRODUCT_AND_SCOPE.md`.
- Sirio non costituisce evidenza di disponibilità end-to-end delle capability rappresentate.

## Product Principles

1. **Mostrare il comportamento, non soltanto l'aspetto:** ogni esempio deve rendere verificabili interazione, stato e adattamento.
2. **Una fonte condivisa, nessun fork locale:** componenti e token canonici restano in `@qoovex/ui`.
3. **Esempi realistici, affermazioni prudenti:** le composizioni assomigliano al prodotto senza fingere dati o capability operative.
4. **Copertura prima della decorazione:** stati limite, accessibilità e responsive hanno priorità sulla varietà puramente estetica.
5. **Promozione consapevole:** ciò che funziona in Sirio diventa candidato all'adozione, non automaticamente standard definitivo.

## Accessibility & Inclusion

Sirio deve rendere facile verificare uso da tastiera, focus visibile, semantica, contrasto, target interattivi, riduzione del movimento, forced colors e adattamento a viewport e contenuti diversi.

Gli esempi non devono nascondere problemi di accessibilità con dati ideali o stati incompleti. Una dichiarazione formale di conformità richiede comunque verifiche dedicate oltre al catalogo.
