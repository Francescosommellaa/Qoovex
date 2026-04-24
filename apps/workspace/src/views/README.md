# Views Layer

Scopo: schermate e composizione pagina del workspace.

Metti qui:
- viste complete per route o schermate di prodotto;
- composizione di widget, feature ed entities per una pagina.

Non mettere qui:
- entrypoint App Router;
- widget cross-page;
- casi d'uso isolati.

Regole:
- puo` importare da `widgets`, `features`, `entities`, `shared`;
- non esportare logica di dominio generica da qui;
- ogni sottocartella rappresenta una schermata precisa.
