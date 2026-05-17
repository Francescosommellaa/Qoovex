# Explore View

Scopo: composizione della schermata esplora.

Metti qui:
- layout della pagina, combinazione di filtri, risultati e widget explore.

Non mettere qui:
- logica fine di ricerca o like/fork;
- primitive di dominio menu/recipe.

Regole:
- la view compone, non implementa i casi d'uso nel dettaglio;
- delega interazioni a `features/explore`.
- in V1 il fork e` disponibile per ricette pubbliche, non per menu.
