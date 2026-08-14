# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Il sito pubblico Qoovex si rivolge prima di tutto alle **aziende edili** che stanno valutando un modo più semplice e trasparente di lavorare con clienti e collaboratori.

Rende inoltre comprensibile il valore del prodotto alle altre persone coinvolte nel rapporto di cantiere:

- **clienti dell'Azienda**, che vogliono capire come Qoovex li aiuti a seguire il lavoro, fare domande e ritrovare informazioni, documenti e prove in un unico luogo;
- **collaboratori e professionisti**, che vogliono comprendere come il proprio profilo, i documenti e la partecipazione autorizzata ai cantieri possano ridurre attività ripetitive e dispersione di informazioni;
- **persone che cercano fiducia prima di agire**, incluse quelle con poca familiarità con software gestionali o processi digitali complessi.

L'Azienda è il pubblico primario di conversione. Clienti e Collaboratori non sono comparse nel racconto: il sito deve spiegare con chiarezza quale beneficio concreto ricevono e quali limiti restano in vigore.

## Product Purpose

Il sito deve permettere a una persona di capire rapidamente che cosa fa Qoovex, per chi è pensato, come rende il lavoro più semplice e trasparente e quale passo compiere per iniziare o chiedere informazioni.

Il suo compito non è soltanto promuovere il prodotto. Deve costruire fiducia attraverso spiegazioni verificabili, distinguere le funzionalità correnti dalle direzioni future e rendere accessibili anche temi delicati come tracciabilità, condivisione, responsabilità e limiti del servizio.

## Positioning

Qoovex è presentato come **Il Cantiere Trasparente**: uno spazio condiviso che aiuta Azienda, cliente e Collaboratori a mantenere informazioni, richieste, aggiornamenti, documenti e prove collegati al lavoro corretto.

Il posizionamento distintivo unisce semplicità e trasparenza. Il sito deve mostrare come Qoovex riduca conversazioni e file dispersi senza descriverlo come certificatore, garante legale, sostituto dei professionisti o soluzione capace di eliminare errori e controversie.

## Operating Context

Il sito è una superficie pubblica di informazione, valutazione e contatto. Le persone possono arrivare da ricerca, passaparola, contenuti editoriali o collegamenti diretti e devono poter orientarsi senza conoscere già il lessico di Qoovex.

Le route pubbliche coprono presentazione del prodotto, funzionamento, funzionalità, Aziende, clienti, fiducia, FAQ, community, contatti e contenuti legali. Le call to action possono accompagnare verso il Workspace o verso un contatto, ma non devono simulare capability non disponibili.

Il sito non ospita autenticazione, dati di cantiere o logica operativa del prodotto. Le dimostrazioni devono usare primitive e contenuti rappresentativi senza esporre dati reali o trasformare stati futuri in promesse presenti.

## Capabilities and Constraints

- Il sito comunica il prodotto pubblico, supporta indicizzazione di base, navigazione informativa, contenuti legali, preferenze tema e contatti configurati.
- Pricing, testimonianze, benchmark, certificazioni, partnership, casi studio e risultati quantitativi possono essere pubblicati soltanto quando esistono fonti approvate e verificabili.
- Le capability future devono essere indicate come tali. L'esistenza di un concetto nel copy o nel repository non dimostra disponibilità end-to-end.
- Qoovex non certifica lavori o documenti, non sostituisce verifiche tecniche o legali e non gestisce direttamente denaro, escrow o garanzie di pagamento.
- I componenti condivisi provengono da `@qoovex/ui`; il CSS locale serve a composizione e contenuto del sito, non a creare un design system parallelo.
- Il sito non importa Prisma, autenticazione, servizi di dominio o dati privati del Workspace.

## Brand Commitments

La voce è rassicurante, calma, accessibile, umana, concreta e prudente. Deve sembrare vicina al lavoro reale, mai fredda da software enterprise e mai giocosa davanti a decisioni, documenti o responsabilità importanti.

La foundation condivisa è un impegno da preservare: shadcn `base-nova`, Base UI, Tabler Icons, token Qoovex, General Sans come carattere principale e Array soltanto come accento controllato. Il linguaggio visuale può essere espressivo quanto serve al racconto pubblico, ma resta riconoscibile come parte dello stesso prodotto.

## Evidence on Hand

- Responsabilità, route e confini del sito: `README.md`.
- Implementazione corrente delle superfici pubbliche: `src/app` e `src/components`.
- Asset pubblici disponibili: `public` e `../../packages/brand-resources`.
- Verità e limiti di prodotto: `../../docs/00_PRODUCT_AND_SCOPE.md`.
- Foundation, copy prudente e rapporto tra superfici: `../../docs/05_UI_BRAND_AND_SURFACES.md`.
- Sistema visuale canonico: `../../packages/ui` e `../sirio`.
- Non risultano prove approvate che autorizzino testimonianze, benchmark, certificazioni o garanzie commerciali inventate.

## Product Principles

1. **Capire prima di convincere:** ogni pagina rende evidente che cosa offre Qoovex, a chi serve e quale problema concreto affronta.
2. **Trasparenza anche nel marketing:** capacità correnti, direzioni future e limiti restano distinguibili e verificabili.
3. **Una strada chiara per agire:** ogni superficie conduce a un prossimo passo comprensibile, senza pressione artificiale o percorsi ambigui.
4. **Tre prospettive, un solo rapporto:** il racconto parte dall'Azienda senza nascondere benefici, responsabilità e tutele di clienti e Collaboratori.
5. **Fiducia senza promesse assolute:** prove e precisione sostituiscono superlativi, urgenza e affermazioni non dimostrate.

## Accessibility & Inclusion

Il sito punta alla massima accessibilità pratica. Linguaggio, struttura, navigazione, contrasto, focus, semantica, riduzione del movimento e comportamento responsive devono sostenere anche persone con esperienza digitale limitata.

Le informazioni essenziali non dipendono soltanto da colore, animazione o immagini. Nessuna dichiarazione formale di conformità, inclusa WCAG 2.2 AA, deve essere pubblicata senza una verifica dedicata.
