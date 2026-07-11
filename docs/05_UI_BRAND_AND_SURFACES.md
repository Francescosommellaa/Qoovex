# UI, brand and surfaces

`apps/web` e un sito pubblico funzionante con contenuti prudenti, CTA verso workspace e contatto configurabile. `apps/sirio` mostra token e primitive di `packages/ui`; non e la sorgente dei componenti.

`packages/ui` esporta Button, Card, Badge, Section e Container con token e base styles condivisi. La UI del workspace resta app-local finche non esiste riuso reale. Gli asset in `packages/brand-resources` non sono ancora importati dal runtime.

Non inventare ricerca, preset, canali di contatto, promesse normative o asset aggiuntivi. Ogni task UI passa da `check_ui_task`.
