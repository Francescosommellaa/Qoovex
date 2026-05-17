# Recipes View

Scopo: composizione delle schermate legate alle ricette.

Metti qui:
- lista ricette, detail view, screen di editing compose-level.

Non mettere qui:
- editor atomici;
- model puro `Recipe`.

Regole:
- l'editing resta in `features/recipe-editor`;
- la view si occupa di orchestrazione schermata.
- le route importano queste view e restano sottili.
