# UI, brand and surfaces

`apps/web` e un sito pubblico funzionante con contenuti prudenti, CTA verso workspace e contatto configurabile. `apps/sirio` mostra token e primitive di `packages/ui`; non e la sorgente dei componenti ne una superficie di prodotto.

`packages/ui` esporta token CSS-first per Tailwind v4, base styles e primitive presentazionali generiche. Non importa auth, Prisma, API, ruoli o tipi di dominio. Gli stati di dominio vengono mappati nel workspace verso toni generici.

`packages/brand-resources` centralizza Fontshare (Satoshi e Chillax); nessuna app duplica import o asset font. Le CSP consentono esclusivamente il CDN Fontshare necessario per i font. La UI workspace non e stata ancora migrata al design system: ogni integrazione richiede prima prova e approvazione Sirio.

Non inventare ricerca, preset, canali di contatto, promesse normative o asset aggiuntivi. Ogni task UI passa da `check_ui_task`.
