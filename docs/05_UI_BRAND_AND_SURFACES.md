# UI, brand and surfaces

`apps/web` e un sito pubblico funzionante con contenuti prudenti, CTA verso workspace e contatto configurabile. `apps/sirio` mostra token e primitive di `packages/ui`; non e la sorgente dei componenti ne una superficie di prodotto.

`packages/ui` esporta token CSS-first per Tailwind v4, base styles e primitive presentazionali generiche. Non importa auth, Prisma, API, ruoli o tipi di dominio. Gli stati di dominio vengono mappati nel workspace verso toni generici.

La nuova unita fondazioni mobile-first adotta uno skeuomorphism moderno e minimale: canvas quasi bianco, superfici raised e sunken in scala di grigi, contenuto grafite, ombre neutre e feedback pressed. La palette usa il blu cielo per azione e focus, il corallo per evidenze editoriali rare e il violetto per visual o categorie di prodotto; i colori di stato restano esclusivamente semantici. Usa gutter e spacing di sezione fluidi, contenitori semantici per lettura e contenuto, target interattivi da 44 px, focus visibile e reduced motion. Light e il default globale indipendentemente dalla preferenza di sistema; dark richiede `data-theme="dark"` esplicito nel prodotto. `apps/web` e bloccata su `data-theme="light"` e non offre ne eredita un tema dark. La proposta e isolata in Sirio su `/foundations` e resta in attesa di approvazione prima di qualunque redesign specifico del workspace.

`packages/brand-resources` centralizza Fontshare (General Sans e Cabinet Grotesk); nessuna app duplica import o asset font. Le CSP consentono esclusivamente il CDN Fontshare necessario per i font. Le app importano esclusivamente token e base style condivisi; i fogli locali conservano composizione e comportamento specifici della superficie. La UI workspace non e stata ancora ridisegnata: ogni unita successiva richiede prima prova e approvazione Sirio.

Non inventare ricerca, preset, canali di contatto, promesse normative o asset aggiuntivi. Ogni task UI passa da `check_ui_task`.
