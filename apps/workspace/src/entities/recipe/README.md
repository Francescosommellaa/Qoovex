# Recipe Entity

Scopo: codice che appartiene solo al dominio `Recipe`.

Metti qui:
- model, ui e lib riusabili della ricetta;
- parser, formatter, meta badge o card fragment della ricetta.

Non mettere qui:
- editor completi, wizard, submit flow o pagine ricetta.

Regole:
- se il codice coordina input utente o mutazioni, spostalo in `features/recipe-editor`;
- mantieni nomi espliciti e dominio-centrico.
