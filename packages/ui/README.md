# Qoovex UI

Fonte runtime condivisa della fondazione visuale Qoovex Stable v0.1.

## Contiene

- token primitivi e semantici;
- baseline CSS condivisa;
- preset funzionali del Blur System;
- primitive React `Button`, `Card`, `Input`, `Badge` e `GlassPanel`.

## Ownership

Il package non dipende dalle app. Sirio documenta e verifica i contratti che
marketing e workspace possono consumare. I font esterni non sono ancora
integrati: i ruoli tipografici stabili usano fallback di sistema.

## Vincoli

- Nessuna business logic o componente di dominio.
- Nessuna variante puramente decorativa.
- Glass raro: focus, navigazione, overlay o trasformazione.
- Le Card glass applicano blur reale e richiedono un contesto sottostante utile.
- Logo esclusivamente da `@qoovex/brand`; icone future solo Phosphor.
- API, token e preset pubblici sono congelati nel contratto Stable v0.1.
