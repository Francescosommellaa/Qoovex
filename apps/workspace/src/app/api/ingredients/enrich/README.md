# Ingredient Enrichment API

Scopo: verifica confermata di un ingrediente non ancora risolto nel form ricetta.

Regole:
- prima usa catalogo locale e fuzzy matching;
- poi provider esterni server-only con cache DB;
- se non trova dati affidabili crea ingrediente in revisione e notifica l'utente.
