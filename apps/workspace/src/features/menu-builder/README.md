# Menu Builder Feature

Scopo: casi d'uso per costruire e modificare menu.

Metti qui:
- flow di creazione menu, ordinamento item, validazioni e mutazioni dedicate.

Non mettere qui:
- card shared di menu;
- pagine complete o sezioni dashboard.

Regole:
- il codice qui descrive azioni utente, non il modello puro del menu;
- niente dipendenze da layer superiori.
- feedback temporanei tramite toast del design system.
- lo stato senza ricette usa `EmptyState` con accesso a Esplora e alla creazione ricetta;
- l'aggiunta di una voce replica il pattern full-width tratteggiato dell'editor ingredienti.
