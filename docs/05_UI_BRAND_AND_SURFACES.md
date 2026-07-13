# UI, brand and surfaces

`apps/web` e un sito pubblico funzionante con contenuti prudenti, CTA verso workspace e contatto configurabile. `apps/sirio` mostra token e primitive di `packages/ui`; non e la sorgente dei componenti ne una superficie di prodotto.

`packages/ui` esporta token CSS-first per Tailwind v4, base styles e primitive presentazionali generiche. Non importa auth, Prisma, API, ruoli o tipi di dominio. Gli stati di dominio vengono mappati nel workspace verso toni generici.

Il contratto condiviso comprende tipografia Satoshi/Chillax, link testuali sottolineati, focus comune, touch target, cursor, livelli, ombre, container, icone Phosphor tipizzate e stati statici o live espliciti. `Field` collega label, descrizione ed errore; `Section` mantiene header e contenuto nello stesso container.

`packages/brand-resources` centralizza Fontshare (Satoshi e Chillax); nessuna app duplica import o asset font. Le CSP consentono esclusivamente il CDN Fontshare necessario per i font. Il workspace compone `@qoovex/ui` nelle primitive app-local, mantenendo logica, route e stati di dominio nell'app. Sirio cataloga gli stati condivisi con ID stabili, indice sticky e scrollspy.

Il marketing usa un ritmo piu espressivo e composizioni aperte; il workspace resta denso, prevedibile e senza animazioni decorative. Entrambe le superfici preservano i contenuti prudenziali e usano solo asset gia disponibili.

Non inventare ricerca, preset, canali di contatto, promesse normative o asset aggiuntivi. Ogni task UI passa da `check_ui_task`.
