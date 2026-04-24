# Entities Layer

Scopo: modelli di dominio stabili e riusabili del workspace.

Metti qui:
- `model`, `lib`, `ui` o adapter legati a una singola entita`;
- tipi, selector, mapper e primitive visuali che descrivono il dominio.

Non mettere qui:
- azioni utente complete, form/wizard, pagine o composizioni grandi;
- logica che coordina piu` entita` in modo orientato al caso d'uso.

Regole:
- importa solo da `shared`, `packages` e dalla stessa entita`;
- mai importare da `features`, `widgets`, `views`;
- ogni sottocartella entita` deve esporre solo API pubblica minima.
