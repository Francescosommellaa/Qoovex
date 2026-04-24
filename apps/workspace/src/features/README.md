# Features Layer

Scopo: azioni utente e casi d'uso del workspace.

Metti qui:
- form, flow, mutazioni, pannelli interattivi e orchestrazione di una singola intenzione utente;
- codice che coordina entita` e shared per completare un'azione.

Non mettere qui:
- pagine complete;
- shell di navigazione;
- primitive di dominio pure.

Regole:
- puo` importare da `shared` ed `entities`;
- non puo` importare da `widgets`, `views`, `app`;
- ogni sottocartella feature deve rappresentare un caso d'uso preciso.
